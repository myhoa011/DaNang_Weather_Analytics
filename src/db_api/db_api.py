from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
import aiomysql
import httpx
import os
import sys
import pandas as pd
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from contextlib import asynccontextmanager

sys.path.append(".")
from src.logger import logger
from src.db_api.weather import WeatherData
from src.db_api.correlationModel import CorrelationRecord
from src.db_api.seasonalModel import SeasonalRecord

# Load environment variables
load_dotenv()

class WeatherAPI:
    """
    Weather API class that handles database connections and service calls.
    Provides methods for database operations and service integrations.
    """
    def __init__(self):
        """Initialize WeatherAPI with database pool and service endpoints"""
        self.pool = None
        # Backend service endpoints for future integrations
        self.service_urls = {
            "analysis": "http://localhost:8001/analyze",
            "clustering": "http://localhost:8002/cluster",
            "classification": "http://localhost:8003/classify",
            "prediction": "http://localhost:8004/predict"
        }

    async def connect_db(self):
        """
        Initialize database connection pool.
        Uses environment variables for database configuration.
        """
        if not self.pool:
            self.pool = await aiomysql.create_pool(
                host=os.getenv('DB_HOST'),
                port=int(os.getenv('DB_PORT')),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                db=os.getenv('DB_NAME'),
                autocommit=True
            )

    async def close_db(self):
        """
        Close database connection pool.
        Should be called when shutting down the application.
        """
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    async def _call_service(self, service: str, weather_data: WeatherData) -> Dict[str, Any]:
        """
        Call backend service with weather data
        Args:
            service: Service name to call
            weather_data: Weather data to process
        Returns:
            JSON response from service
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.service_urls[service],
                json=weather_data.dict(),
                timeout=30.0
            )
            return response.json()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events handler"""
    # Startup
    logger.info("Connecting to database...")
    await weather_api.connect_db()
    yield
    # Shutdown
    logger.info("Closing database connection...")
    await weather_api.close_db()

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Weather API",
    lifespan=lifespan
)

# Ngay sau khi khởi tạo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các origin (trong môi trường dev)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức
    allow_headers=["*"],  # Cho phép tất cả các headers
)

weather_api = WeatherAPI()

@app.post("/api/raw_weather/bulk")
async def save_raw_weather_bulk(raw_data_list: List[WeatherData]) -> Dict[str, Any]:
    """
    Save multiple raw weather data entries in bulk.
    
    Args:
        raw_data_list (List[WeatherData]): List of weather data objects to be saved
        
    Returns:
        Dict[str, Any]: Response containing count of saved entries and status message
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                INSERT INTO raw_weather_data 
                (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                values = [
                    (data.dt, data.temp, data.pressure, data.humidity,
                     data.clouds, data.visibility, data.wind_speed, data.wind_deg)
                    for data in raw_data_list
                ]
                await cur.executemany(query, values)

        return {
            "count": len(raw_data_list),
            "message": "Raw weather data saved successfully"
        }

    except Exception as e:
        logger.error(f"Error saving bulk raw weather data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process_weather/bulk")
async def save_processed_weather_bulk(processed_data_list: List[WeatherData]) -> Dict[str, Any]:
    """
    Save multiple processed weather data entries in bulk.
    
    Args:
        processed_data_list (List[WeatherData]): List of processed weather data objects
        
    Returns:
        Dict[str, Any]: Response containing count of saved entries and status message
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor() as cur:
                query = """
                INSERT INTO processed_weather_data 
                (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                values = [
                    (data.dt, data.temp, data.pressure, data.humidity,
                     data.clouds, data.visibility, data.wind_speed, data.wind_deg)
                    for data in processed_data_list
                ]
                await cur.executemany(query, values)

        return {
            "count": len(processed_data_list),
            "message": "Processed weather data saved successfully"
        }

    except Exception as e:
        logger.error(f"Error saving bulk processed weather data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather/{timestamp}", response_model=WeatherData)
async def get_weather(timestamp: int):
    """
    Get weather data for a specific timestamp.
    
    Args:
        timestamp (int): Unix timestamp to query
        
    Returns:
        WeatherData: Weather data object for the specified timestamp
        
    Raises:
        HTTPException: If data not found or database error occurs
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM raw_weather_data WHERE dt = %s"
                await cur.execute(query, (timestamp,))
                result = await cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Weather data not found")
                return WeatherData(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather", response_model=List[WeatherData])
async def get_all_weather():
    """
    Get all weather data entries ordered by timestamp descending.
    
    Returns:
        List[WeatherData]: List of all weather data objects
        
    Raises:
        HTTPException: If database error occurs
    """
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM processed_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
                return [WeatherData(**row) for row in results]
    except Exception as e:
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
async def get_filer() -> List[Dict[str, Any]]:  
    try:
        async with weather_api.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM correlation_table"
                await cur.execute(query)
                results = await cur.fetchall()
        
        # Chuyển đổi dữ liệu sang DataFrame
        df = pd.DataFrame(results)
         
        result = df.to_dict(orient='records')   
        return result
    except Exception as e:
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
    



# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.db_api.db_api:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True
    ) 