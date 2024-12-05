from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import aiomysql
import os
from dotenv import load_dotenv
import asyncio
from datetime import datetime
import redis.asyncio as aioredis
import json
from pymysqlreplication import BinLogStreamReader
from pymysqlreplication.row_event import WriteRowsEvent
import pandas as pd

from src.logger import logger
from .weather import WeatherData
from .correlationModel import CorrelationRecord
from .seasonalModel import SeasonalRecord
from .cluster import ClusterData
from .centroid import Centroid

# Load environment variables
load_dotenv()

app = FastAPI()
# Ngay sau khi khởi tạo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)
weather_api = None

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    global weather_api
    try:
        # Create WeatherAPI instance first
        weather_api = WeatherAPI()
        # Connect database
        await weather_api.connect_pool()
        logger.info("Database connection initialized")
        
        # Start binlog listener in background
        weather_api.binlog_task = asyncio.create_task(weather_api.start_binlog_listener())
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

class WeatherAPI:
    def __init__(self):
        self.pool = None
        self.binlog_task = None
        self.is_listening = False
        self.binlog_stream = None
        self.redis = None
        self.initial_count = 0
        self.is_initial_load = True
        self.binlog_queue = asyncio.Queue()

    async def connect_pool(self):
        """Initialize database and redis connection pools"""
        if not self.pool:
            # Connect MySQL
            self.pool = await aiomysql.create_pool(
                host=os.getenv('DB_HOST'),
                port=int(os.getenv('DB_PORT')),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                db=os.getenv('DB_NAME'),
                autocommit=True
            )
            
            # Connect Redis
            self.redis = await aioredis.from_url(
                f'redis://redis:6379',
                password=os.getenv('REDIS_PASSWORD')
            )

    async def start_binlog_stream(self):
        """Start MySQL binlog stream"""
        try:
            if self.binlog_stream:
                self.binlog_stream.close()
                
            mysql_settings = {
                "host": os.getenv('DB_HOST'),
                "port": int(os.getenv('DB_PORT')),
                "user": os.getenv('DB_USER'),
                "passwd": os.getenv('DB_PASSWORD')
            }
            
            # Get current binlog position
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SHOW MASTER STATUS")
                    result = await cur.fetchone()
                    if result:
                        log_file, log_pos = result[0], result[1]
                    else:
                        log_file, log_pos = None, None
                        
                    # Get column names
                    await cur.execute("""
                        SELECT COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = %s 
                        AND TABLE_NAME = 'processed_weather_data'
                        ORDER BY ORDINAL_POSITION
                    """, (os.getenv('DB_NAME'),))
                    columns = [row[0] for row in await cur.fetchall()]
            
            self.binlog_stream = BinLogStreamReader(
                connection_settings=mysql_settings,
                server_id=1000,
                only_events=[WriteRowsEvent],
                only_tables=['processed_weather_data'],
                only_schemas=[os.getenv('DB_NAME')],
                log_file=log_file,
                log_pos=log_pos,
                resume_stream=True,
                blocking=True,
                slave_heartbeat=30.0,
                freeze_schema=False
            )
            logger.info(f"Started MySQL binlog stream from {log_file}:{log_pos}")
            
            # Store column names for later use
            self.table_columns = columns
            
        except Exception as e:
            logger.error(f"Error starting binlog stream: {e}")
            self.binlog_stream = None
            await asyncio.sleep(5)

    async def start_binlog_listener(self):
        """Start binlog listener in background"""
        try:
            # Start binlog reader in a separate task
            reader_task = asyncio.create_task(self.read_binlog())
            # Start processor in a separate task
            processor_task = asyncio.create_task(self.process_binlog_queue())
            
            # Wait for both tasks
            await asyncio.gather(reader_task, processor_task)
            
        except Exception as e:
            logger.error(f"Error in binlog listener: {e}")
            raise

    async def read_binlog(self):
        """Read binlog in background thread"""
        while True:
            try:
                if not self.binlog_stream:
                    await self.start_binlog_stream()
                    continue

                def read_next():
                    try:
                        # Sử dụng fetchone() thay vì next()
                        for event in self.binlog_stream:
                            return event
                    except Exception as e:
                        logger.error(f"Error reading binlog: {e}")
                        return None

                # Read binlog in thread pool
                event = await asyncio.get_event_loop().run_in_executor(None, read_next)
                
                if event and isinstance(event, WriteRowsEvent):
                    logger.info(f"Received WriteRowsEvent with {len(event.rows)} rows")
                    # Put event into queue for processing
                    await self.binlog_queue.put(event)
                    
            except Exception as e:
                logger.error(f"Error in binlog reader: {e}")
                if self.binlog_stream:
                    self.binlog_stream.close()
                    self.binlog_stream = None
                await asyncio.sleep(0.1)

    async def process_binlog_queue(self):
        """Process events from binlog queue"""
        initial_events = []
        redis = await aioredis.from_url('redis://redis:6379', password=os.getenv('REDIS_PASSWORD'))

        try:
            while True:
                event = await self.binlog_queue.get()
                
                if self.is_initial_load:
                    initial_events.extend(event.rows)
                    logger.info(f"Added to initial load buffer. Current size: {len(initial_events)}")
                    
                    if len(initial_events) >= 34400:
                        logger.info(f"Initial load complete with {len(initial_events)} rows")
                        self.is_initial_load = False
                        
                        # Gửi signal qua Redis
                        await redis.set('db_initial_load_complete', '1')
                        await redis.publish('db_status', 'initial_load_complete')
                        
                        # Process all initial events
                        for row in initial_events:
                            await self.process_weather_event(row['values'], is_initial=True)
                        initial_events.clear()
                else:
                    # Process normal binlog event
                    for row in event.rows:
                        await self.process_weather_event(row['values'], is_initial=False)
                
                self.binlog_queue.task_done()
                
        except Exception as e:
            logger.error(f"Error processing binlog event: {e}")
        finally:
            await redis.close()

    async def process_weather_event(self, values, is_initial=False):
        """Process a weather event"""
        try:
            
            # Map UNKNOWN_COL to actual column names
            weather_data = {
                'dt': values['UNKNOWN_COL0'],
                'temp': values['UNKNOWN_COL1'],
                'pressure': values['UNKNOWN_COL2'],
                'humidity': values['UNKNOWN_COL3'],
                'clouds': values['UNKNOWN_COL4'],
                'visibility': values['UNKNOWN_COL5'],
                'wind_speed': values['UNKNOWN_COL6'],
                'wind_deg': values['UNKNOWN_COL7']
            }
            
            # Chỉ publish khi không phải initial load
            if not is_initial:
                await self.publish_weather_data(weather_data)
            
        except Exception as e:
            logger.error(f"Error processing weather event: {e}")
            logger.error(f"Values received: {values}")

    async def close_pool(self):
        """Close database connection"""
        self.is_listening = False
        
        if self.binlog_task:
            self.binlog_task.cancel()
            try:
                await self.binlog_task
            except asyncio.CancelledError:
                pass
                
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()
        logger.info("Database connection closed")

    async def publish_weather_data(self, weather_data):
        """Publish weather data to Redis"""
        try:
            # Convert to JSON string
            data_str = json.dumps(weather_data)
            
            # Publish to Redis channel
            await self.redis.publish('weather_data', data_str)
            logger.info(f"Published weather data: {data_str}")
            
        except Exception as e:
            logger.error(f"Error publishing weather data: {e}")
            logger.error(f"Weather data: {weather_data}")

# Initialize API
weather_api = WeatherAPI()

# FastAPI endpoints
@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    if weather_api:
        await weather_api.close_pool()

@app.get("/health")
async def health_check():
    try:
        # Kiểm tra kết nối MySQL
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
                await cur.fetchone()
        
        # Kiểm tra kết nối Redis
        await weather_api.redis.ping()
        
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.post("/api/weather/bulk")
async def insert_weather_bulk(raw_data_list: List[WeatherData], processed_data_list: List[WeatherData]):
    """Insert bulk weather data - both raw and processed"""
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Insert raw data
                await cur.executemany("""
                    INSERT INTO raw_weather_data 
                    (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg)
                    VALUES (%(dt)s, %(temp)s, %(pressure)s, %(humidity)s, 
                            %(clouds)s, %(visibility)s, %(wind_speed)s, %(wind_deg)s)
                """, [data.model_dump() for data in raw_data_list])

                # Insert processed data
                await cur.executemany("""
                    INSERT INTO processed_weather_data 
                    (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg)
                    VALUES (%(dt)s, %(temp)s, %(pressure)s, %(humidity)s, 
                            %(clouds)s, %(visibility)s, %(wind_speed)s, %(wind_deg)s)
                """, [data.model_dump() for data in processed_data_list])
                
                return {
                    "message": "Bulk insert successful",
                    "count": len(processed_data_list)
                }

    except Exception as e:
        logger.error(f"Error bulk inserting weather data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather")
async def get_weather_data():
    """Get all weather data"""
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Get all processed weather data
                await cur.execute("""
                    SELECT 
                        dt, temp, pressure, humidity, 
                        clouds, visibility, wind_speed, wind_deg
                    FROM processed_weather_data 
                    ORDER BY dt DESC
                """)
                
                # Fetch all records
                records = await cur.fetchall()
                
                # Convert to list of dicts
                result = []
                for record in records:
                    result.append({
                        'dt': record[0],
                        'temp': record[1],
                        'pressure': record[2],
                        'humidity': record[3],
                        'clouds': record[4],
                        'visibility': record[5],
                        'wind_speed': record[6],
                        'wind_deg': record[7]
                    })
                
                logger.info(f"Retrieved {len(result)} weather records")
                return result

    except Exception as e:
        logger.error(f"Error getting weather data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/weather/predictions")
async def save_predictions(predictions: List[dict]):
    """Save weather predictions to database"""
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Insert predictions with ON DUPLICATE KEY UPDATE
                await cur.executemany("""
                    INSERT INTO predictions 
                    (dt, temp, prediction_hour, hour, day, month, year, created_at, formatted_time)
                    VALUES (
                        %(dt)s, %(temp)s, %(prediction_hour)s, 
                        %(hour)s, %(day)s, %(month)s, %(year)s,
                        %(created_at)s, %(formatted_time)s
                    )
                """, predictions)
                
                await conn.commit()
                
                logger.info(f"Saved {len(predictions)} predictions to database")
                return {"message": f"Saved {len(predictions)} predictions"}

    except Exception as e:
        logger.error(f"Error saving predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

###########api manhdung
#FILTER
@app.get("/filter")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển timestamp sang string để JSON serializable
        df['dt'] = df['dt'].astype(str)
        
        result = df.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#nhóm theo ngày
@app.get("/filterDay")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển cột dt sang định dạng datetime
        df['dt'] = pd.to_datetime(df['dt'])

        # Tạo cột date
        df['date'] = df['dt'].dt.date

        # Nhóm dữ liệu theo ngày
        daily_data = df.groupby('date').mean().reset_index()
        
        # Chuyển timestamp sang string để JSON serializable
        daily_data['date'] = daily_data['date'].astype(str)
        
        result = daily_data.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))   
 
#nhóm theo tuần
@app.get("/filterWeek")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển cột dt sang định dạng datetime
        df['dt'] = pd.to_datetime(df['dt'])

        # Tạo cột week và year để nhóm
        df['week'] = df['dt'].dt.isocalendar().week
        df['year'] = df['dt'].dt.year

        # Nhóm dữ liệu theo tuần và năm
        weekly_data = df.groupby(['year', 'week']).mean().reset_index()

        # Chuyển đổi cột week và year thành string để JSON serializable
        weekly_data['week'] = weekly_data['week'].astype(str)
        weekly_data['year'] = weekly_data['year'].astype(str)

        # Kết hợp year và week vào một cột duy nhất để dễ hiểu
        weekly_data['year_week'] = weekly_data['year'] + '-W' + weekly_data['week']

        # Loại bỏ các cột không cần thiết
        weekly_data = weekly_data.drop(columns=['year', 'week'])
        
        # Chuyển timestamp sang string để JSON serializable
        weekly_data['year_week'] = weekly_data['year_week'].astype(str)
        
        result = weekly_data.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    
#nhóm theo tháng
@app.get("/filterMonth")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển cột dt sang định dạng datetime
        df['dt'] = pd.to_datetime(df['dt'])

        # Tạo cột month để nhóm
        df['month'] = df['dt'].dt.strftime('%Y-%m')

        # Nhóm dữ liệu theo tuần và năm
        monthly_data = df.groupby('month').mean().reset_index()
  
        # Chuyển timestamp sang string để JSON serializable
        monthly_data['month'] = monthly_data['month'].astype(str)
        
        result = monthly_data.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    
    
#RE-SAMPLING về tháng TREND
@app.get("/resampleMonth")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển cột dt sang định dạng datetime
        df['dt'] = pd.to_datetime(df['dt'])

        # Tạo cột month để nhóm
        df['month'] = df['dt'].dt.strftime('%Y-%m')

        # Nhóm dữ liệu theo tháng
        monthly_data = df.groupby('month').median().reset_index()
  
        # Chuyển timestamp sang string để JSON serializable
        monthly_data['month'] = monthly_data['month'].astype(str)
        
        result = monthly_data.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    
#RE-SAMPLING về tuần TREND
@app.get("/resampleWeek")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
        df = df.sort_values('dt')
        
        # Chuyển timestamp sang định dạng datetime string
        df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
        # Chuyển đổi nhiệt độ từ °K sang °C
        df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
        # Chuyển đổi đơn vị tầm nhìn từ m sang km
        df['visibility'] = df['visibility'].apply(lambda f: f/1000)
        
        # Chuyển cột dt sang định dạng datetime
        df['dt'] = pd.to_datetime(df['dt'])

        # Tạo cột week và year để nhóm
        df['week'] = df['dt'].dt.isocalendar().week
        df['year'] = df['dt'].dt.year

        # Nhóm dữ liệu theo tuần và năm
        weekly_data = df.groupby(['year', 'week']).median().reset_index()

        # Chuyển đổi cột week và year thành string để JSON serializable
        weekly_data['week'] = weekly_data['week'].astype(str)
        weekly_data['year'] = weekly_data['year'].astype(str)

        # Kết hợp year và week vào một cột duy nhất để dễ hiểu
        weekly_data['year_week'] = weekly_data['year'] + '-W' + weekly_data['week']

        # Loại bỏ các cột không cần thiết
        weekly_data = weekly_data.drop(columns=['year', 'week'])
        
        # Chuyển timestamp sang string để JSON serializable
        weekly_data['year_week'] = weekly_data['year_week'].astype(str)
        
        result = weekly_data.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 


#CORRELATON
#xóa correlation cũ
@app.delete("/api/correlation/delete")
async def delete_correlation_data():  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "DELETE FROM correlation_table"
                await cur.execute(query)
                await conn.commit() # commit trên connection
        return {"message":"Correlation old data deleted successfully"}
    except Exception as e:
        logger.error(f"error during delete operation: {e}") # log the error messag
        raise HTTPException(status_code=500, detail=str(e)) 

@app.post("/api/correlation/bulk")
async def save_correlation_bulk(data: List[CorrelationRecord]) -> Dict[str, Any]:
    """
    Save correlation data from a list of CorrelationRecord objects in bulk.
    """
    try:
        # Chuyển danh sách CorrelationRecord thành các tuple để insert
        values = [
            (
                record.temp, record.pressure, record.humidity,
                record.clouds, record.visibility, record.wind_speed, record.wind_deg
            ) for record in data
        ]

        query = """
        INSERT INTO correlation_table 
        (temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.executemany(query, values)
                await conn.commit()

        return {
            "count": len(values),
            "message": "Correlation data saved successfully"
        }

    except Exception as e:
        logger.error(f"Error saving correlation data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

##get data Correlation
@app.get("/correlation")
async def get_correlation_data():
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT * FROM correlation_table")
                rows = await cur.fetchall()
                if rows:
                    df = pd.DataFrame(rows)
                    logger.info(f"Retrieved {len(df)} correlation records")
                    return df.to_dict('records')
                return []
    except Exception as e:
        logger.error(f"Error getting correlation data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

##SEASONAL
@app.post("/api/seasonal/bulk")
async def save_seasonal_bulk(data: List[SeasonalRecord]) -> Dict[str, Any]:
    """
    Save correlation data from a list of SeasonalRecord objects in bulk.
    """
    try:
        # Chuyển danh sách CorrelationRecord thành các tuple để insert
        values = [
            (
                record.dt,
                record.observed_temp, 
                record.trend_temp, 
                record.seasonal_temp, 
                record.residual_temp, 
                
                record.observed_pressure, 
                record.trend_pressure, 
                record.seasonal_pressure, 
                record.residual_pressure, 
                
                record.observed_humidity, 
                record.trend_humidity, 
                record.seasonal_humidity, 
                record.residual_humidity, 
                
                record.observed_clouds, 
                record.trend_clouds, 
                record.seasonal_clouds, 
                record.residual_clouds, 
                
                record.observed_visibility, 
                record.trend_visibility, 
                record.seasonal_visibility, 
                record.residual_visibility, 
                
                record.observed_wind_speed, 
                record.trend_wind_speed, 
                record.seasonal_wind_speed, 
                record.residual_wind_speed, 
                
                record.observed_wind_deg, 
                record.trend_wind_deg, 
                record.seasonal_wind_deg, 
                record.residual_wind_deg
            ) for record in data
        ]

        query = """
        INSERT INTO seasonal_table 
        (   dt,
            observed_temp, 
            trend_temp, 
            seasonal_temp, 
            residual_temp, 
            
            observed_pressure, 
            trend_pressure, 
            seasonal_pressure, 
            residual_pressure, 
            
            observed_humidity, 
            trend_humidity, 
            seasonal_humidity, 
            residual_humidity, 
            
            observed_clouds, 
            trend_clouds, 
            seasonal_clouds, 
            residual_clouds, 
            
            observed_visibility, 
            trend_visibility, 
            seasonal_visibility, 
            residual_visibility, 
            
            observed_wind_speed, 
            trend_wind_speed, 
            seasonal_wind_speed, 
            residual_wind_speed, 

            observed_wind_deg, 
            trend_wind_deg, 
            seasonal_wind_deg, 
            residual_wind_deg) 
        VALUES (%s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s, %s)
        """

        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.executemany(query, values)
                await conn.commit()

        return {
            "count": len(values),
            "message": "Seasonal data saved successfully"
        }

    except Exception as e:
        logger.error(f"Error saving correlation data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

#xóa seasonal cũ
@app.delete("/api/seasonal/delete")
async def delete_seasonal_data():  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "DELETE FROM seasonal_table"
                await cur.execute(query)
                await conn.commit() # commit trên connection
        return {"message":"seasonal old data deleted successfully"}
    except Exception as e:
        logger.error(f"error during delete operation: {e}") # log the error messag
        raise HTTPException(status_code=500, detail=str(e)) 

##get data seasonal
@app.get("/seasonal")
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM seasonal_table"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
         
        result = df.to_dict(orient='records')   
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
# ====================================================================

# =========================== API Tuyen ==============================
@app.post("/api/cluster_data/bulk")
async def save_cluster_data_bulk(cluster_data: List[ClusterData]) -> Dict[str, Any]:
    """
    Lưu dữ liệu phân cụm vào cơ sở dữ liệu theo từng batch để tránh mất dữ liệu.
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                INSERT INTO cluster_data 
                (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg, date, month, scaled_temp, kmean_label, custom_label)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                # Tách dữ liệu thành các batch nhỏ (mỗi batch tối đa 100 dòng)
                batch_size = 100
                total_saved = 0

                for i in range(0, len(cluster_data), batch_size):
                    batch = cluster_data[i:i + batch_size]
                    values = [
                        (data.dt, data.temp, data.pressure, data.humidity,
                         data.clouds, data.visibility, data.wind_speed, data.wind_deg,
                         data.date, data.month, data.scaled_temp, data.kmean_label, data.custom_label)
                        for data in batch
                    ]

                    try:
                        await cur.executemany(query, values)
                        total_saved += len(values)
                    except Exception as e:
                        logger.error(f"Error saving batch starting at index {i}: {e}")
                        continue

        return {
            "count": total_saved
        }

    except Exception as e:
        logger.error(f"Error saving bulk cluster data weather data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/delete_all_data")
async def delete_all_cluster_data() -> Dict[str, Any]:
    """
    Xóa toàn bộ dữ liệu trong bảng cluster_data.
    
    Returns:
        Dict[str, Any]: Trạng thái xóa dữ liệu.
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                DELETE FROM cluster_data
                """
                await cur.execute(query)  # Xóa toàn bộ dữ liệu trong bảng
                logger.info("All data in 'cluster_data' table has been deleted successfully.")

        return {
            "message": "Clustered weather data deleted successfully"
        }

    except Exception as e:
        logger.error(f"Error deleting all cluster data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/centroids")
async def save_centroid(data_centroids: List[Centroid]) -> Dict[str, Any]:
    """
    Lưu dữ liệu centroid vào cơ sở dữ liệu.

    Args:
        data_centroids (List[Centroid]): Danh sách các centroid cần lưu.

    Returns:
        Dict[str, Any]: Kết quả lưu trữ dữ liệu.
    """
    try:
        # Kết nối đến cơ sở dữ liệu
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Truncate bảng trước khi chèn mới
                await cur.execute("TRUNCATE TABLE centroids")
                logger.info("Cleared old centroids data.")

                # Câu lệnh chèn dữ liệu
                query = """
                INSERT INTO centroids 
                (cluster_name, temp, scaled_temp) 
                VALUES (%s, %s, %s)
                """
                # Tạo danh sách giá trị từ dữ liệu đầu vào
                values = [
                    (data.cluster_name, data.temp, data.scaled_temp)
                    for data in data_centroids
                ]

                # Thực thi lệnh chèn dữ liệu hàng loạt
                await cur.executemany(query, values)

        # Trả về kết quả thành công
        return {
            "count": len(data_centroids),
            "message": "Centroids saved successfully"
        }

    except Exception as e:
        # Ghi log và trả về lỗi nếu xảy ra
        logger.error(f"Error saving centroids data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/centroids")
async def delete_all_cluster_data() -> Dict[str, Any]:
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                DELETE FROM centroids
                """
                await cur.execute(query)  # Xóa toàn bộ dữ liệu trong bảng
                logger.info("All data in 'centroids' table has been deleted successfully.")

        return {
            "message": "centroids data deleted successfully"
        }

    except Exception as e:
        logger.error(f"Error deleting all centroids: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data_cluster", response_model=List[ClusterData])
async def get_all_weather():
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM cluster_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
                return [ClusterData(**row) for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_centroids", response_model= List[Centroid])
async def get_centroid():
    try: 
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM centroids"
                await cur.execute(query)
                results = await cur.fetchall()
                return [Centroid(**row) for row in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ====================================================================

@app.get("/api/prediction_chart")
async def get_prediction_chart_data() -> Dict[str, Any]:
    """
    Lấy dữ liệu nhiệt độ cho biểu đồ:
    - 9 giờ historical data từ processed_weather_data
    - 3 giờ predicted data từ predictions
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Query lấy 9 giờ dữ liệu historical gần nhất
                historical_query = """
                    SELECT 
                        dt,
                        temp - 273.15 as temp,
                        FROM_UNIXTIME(dt) as formatted_time
                    FROM processed_weather_data
                    ORDER BY dt DESC
                    LIMIT 9;
                """
                await cur.execute(historical_query)
                historical_results = await cur.fetchall()

                # Query lấy 3 giờ dự đoán tiếp theo
                prediction_query = """
                    SELECT 
                        dt,
                        temp - 273.15 as temp,
                        formatted_time,
                        prediction_hour
                    FROM predictions 
                    WHERE prediction_hour <= 3
                    ORDER BY dt ASC, prediction_hour ASC
                    LIMIT 3;
                """
                await cur.execute(prediction_query)
                prediction_results = await cur.fetchall()

        # Chuyển đổi kết quả thành list of dicts
        historical_data = [
            {
                "timestamp": row["dt"],
                "temperature": round(float(row["temp"]), 2),
                "time": row["formatted_time"].strftime("%Y-%m-%d %H:%M:%S"),
                "type": "historical"
            }
            for row in historical_results
        ]
        # Sắp xếp theo thời gian tăng dần
        historical_data.sort(key=lambda x: x["timestamp"])

        prediction_data = [
            {
                "timestamp": row["dt"],
                "temperature": round(float(row["temp"]), 2),
                "time": row["formatted_time"],
                "type": "predicted",
                "hour": row["prediction_hour"]
            }
            for row in prediction_results
        ]

        return {
            "status": "success",
            "data": {
                "historical": historical_data,
                "prediction": prediction_data
            },
            "message": f"Retrieved {len(historical_data)} historical and {len(prediction_data)} prediction records"
        }

    except Exception as e:
        logger.error(f"Error getting temperature chart data: {e}")
        raise HTTPException(status_code=500, detail=str(e))