import os
import pandas as pd
import aiohttp
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.preprocessing import StandardScaler
from src.logger import logger
import redis.asyncio as aioredis
import json

# Load environment variables
load_dotenv()

class WeatherAnalysis:
    """Weather analysis service that gets data from db_api and makes analysis"""
    
    def __init__(self):
        """Initialize analysis with API endpoint"""
        self.db_api_url = os.getenv('DB_API_URL')
        self.session = None
        self.scaler = StandardScaler()
        self.redis = None

    async def connect(self):
        """Initialize HTTP session and Redis connection"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        if self.redis is None:
            self.redis = await aioredis.from_url(
                os.getenv('REDIS_URL'), 
                password=os.getenv('REDIS_PASSWORD')
                )

    async def close(self):
        """Close HTTP session and Redis connection"""
        if self.session:
            await self.session.close()
            self.session = None
        if self.redis:
            await self.redis.close()
            self.redis = None

    async def wait_for_initial_data(self):
        """Wait for initial data to be loaded in db"""
        logger.info("Waiting for initial data load...")
        while True:
            try:
                is_ready = await self.redis.get('db_initial_load_complete')
                if is_ready:
                    logger.info("Initial data is ready")
                    return True
                    
                # Subscribe để nhận thông báo realtime
                pubsub = self.redis.pubsub()
                await pubsub.subscribe('db_status')
                
                async for message in pubsub.listen():
                    if message['type'] == 'message':
                        if message['data'] == b'initial_load_complete':
                            logger.info("Received initial data ready signal")
                            await pubsub.unsubscribe('db_status')
                            return True
                
                await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Error waiting for initial data: {e}")
                await asyncio.sleep(5)

    async def get_weather_data(self):
        """Get weather data from API"""
        try:
            async with self.session.get(f"{self.db_api_url}/api/weather") as response:
                if response.status == 200:
                    data = await response.json()
                    df = pd.DataFrame(data)
                    df = df.sort_values('dt')
                    logger.info(f"Retrieved {len(df)} weather records")
                    return df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise

    async def analysis(self):
        """Perform all analyses concurrently"""
        try:       
            # Run analyses concurrently
            logger.info("Starting concurrent analyses...")
            await asyncio.gather(
                self.correlation(),
                self.seasonal()
            )
            
            logger.info("Completed all analyses")            
        except Exception as e:
            logger.error(f"Error in analysis: {e}")

    async def start(self):
        """Start the Weather Data Analysis service"""
        try:
            logger.info("Starting Weather Data Analysis service")
            
            # Initialize connections
            await self.connect()
            
            # Wait for initial data
            await self.wait_for_initial_data()
            
            # Kiểm tra dữ liệu thực sự có sẵn
            df = await self.get_weather_data()
            if df.empty:
                logger.warning("No data available after initial load signal")
                return  # Hoặc xử lý theo cách khác nếu không có dữ liệu
            
            # Perform initial analysis
            await self.analysis()
            
            await self.start_redis_listener()

            try:
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                await self.stop()
            
        except Exception as e:
            logger.error(f"Error starting service: {e}")
            await self.stop()
            raise

    async def stop(self):
        """Stop the service"""
        try:
            if self.scheduler:
                self.scheduler.shutdown()
            await self.close()
            logger.info("Weather Data Analysis service stopped")
        except Exception as e:
            logger.error(f"Error stopping service: {e}") 
    
    #correlation
    async def get_correlation_data(self) -> pd.DataFrame:
        """
        Fetch weather data from db_api
        
        Returns:
            pd.DataFrame: DataFrame containing historical weather data
        """
        try:
            if self.session is None:
                await self.connect()
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            async with self.session.get(f"{self.db_api_url}/correlation", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} correlation records")
                    return df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error fetching correlation data: {e}")
            return pd.DataFrame()

    async def clear_correlation_data(self):
        """Clear existing correlation data"""
        try:
            if self.session is None:
                await self.connect()
                
            # Gửi dữ liệu lên API
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }    

            # Gửi API DELETE để xóa dữ liệu cũ
            async with self.session.delete(f"{self.db_api_url}/api/correlation/delete", headers=headers) as response:
                if response.status == 200:
                    logger.info("Cleared existing correlation data")
                else:
                    error = await response.text()
                    logger.error(f"API DELETE error: {error}")
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error clearing correlation data: {e}")
     
    async def correlation(self):
        try:
            # Lấy dữ liệu thời tiết
            df = await self.get_weather_data()

            # Các cột số liệu cần phân tích
            numeric_columns = ['temp', 'pressure', 'humidity', 'clouds','visibility', 'wind_speed', 'wind_deg']

            # Tính ma trận tương quan
            correlation_matrix = df[numeric_columns].corr()
            
            #chuyển ma trận sang DataFrame
            correlation_df = correlation_matrix.reset_index()
            
            # Chuyển DataFrame thành danh sách dict để gửi API
            correlation_data = correlation_df.to_dict('records')
            
            logger.info(f"Correlation data: {correlation_data}")

            data_correlation_old = await self.get_correlation_data()
            
            if not data_correlation_old.empty:
                await self.clear_correlation_data()

            if self.session is None:
                await self.connect()
                
            # Gửi dữ liệu lên API
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }    
            
            async with self.session.post(
                f"{self.db_api_url}/api/correlation/bulk",
                headers=headers,
                json=correlation_data  # Gửi dữ liệu dưới dạng JSON
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Received response: {result}")
                    return correlation_matrix
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error calculating correlation: {e}")
            raise
        
    
    
    
    #seasonal
    
    async def get_seasonal_data(self) -> pd.DataFrame:
        """
        Fetch weather data from db_api
        
        Returns:
            pd.DataFrame: DataFrame containing historical weather data
        """
        try:
            if self.session is None:
                await self.connect()
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            async with self.session.get(f"{self.db_api_url}/seasonal", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} weather records")
                    return df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error fetching seasonal data: {e}")
            return pd.DataFrame()
    
    async def clear_seasonal_data(self):
        try:
            if self.session is None:
                await self.connect()
                
            # Gửi dữ liệu lên API
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }    

            # Gửi API DELETE để xóa dữ liệu cũ
            async with self.session.delete(f"{self.db_api_url}/api/seasonal/delete", headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"API response for delete: {result}")
                else:
                    error = await response.text()
                    logger.error(f"API DELETE error: {error}")
                    raise Exception(f"API error: {response.status}, {error}")
                
        except Exception as e:
            logger.error(f"Error stopping service: {e}") 
    
    async def seasonal(self):
        try:
            # Lấy dữ liệu thời tiết
            df = await self.get_weather_data()
            if df.empty:
                logger.warning("No data available for seasonal analysis")
                return
            
            # Chuyển timestamp sang định dạng datetime string
            df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
            # Chuyển đổi nhiệt độ từ °K sang °C
            df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
            # Chuyển đổi đơn vị tầm nhìn từ m sang km
            df['visibility'] = df['visibility'].apply(lambda f: f/1000)

            # Tạo DataFrame chính với cột dt
            seasonal_df = pd.DataFrame({'dt': df['dt']})

            # Phân tích từng feature và thêm vào DataFrame chính
            features = ['temp', 'pressure', 'humidity', 'clouds', 'visibility', 'wind_speed', 'wind_deg']
            
            for feature in features:
                result = seasonal_decompose(df[feature], model='additive', period=720)
                # Thêm kết quả phân tích vào DataFrame chính với tên cột riêng biệt
                seasonal_df[f'observed_{feature}'] = result.observed
                seasonal_df[f'trend_{feature}'] = result.trend
                seasonal_df[f'seasonal_{feature}'] = result.seasonal
                seasonal_df[f'residual_{feature}'] = result.resid

            # Xóa các dòng có giá trị NaN
            seasonal_df = seasonal_df.dropna()

            # Chuyển đổi thành dạng records để gửi API
            seasonal_data = seasonal_df.to_dict('records')

            # Xóa dữ liệu cũ nếu có
            data_seasonal_old = await self.get_seasonal_data()
            if not data_seasonal_old.empty:
                await self.clear_seasonal_data()

            if self.session is None:
                await self.connect()

            # Gửi dữ liệu lên API
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            async with self.session.post(
                f"{self.db_api_url}/api/seasonal/bulk",
                headers=headers,
                json=seasonal_data  # Gửi dữ liệu dưới dạng JSON
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"API response: {result}")
                    return seasonal_df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error calculating seasonal decomposition: {e}")
            raise

    async def start_redis_listener(self):
        """Start listening for new weather data"""
        try:
            pubsub = self.redis.pubsub()
            await pubsub.subscribe('weather_data')
            
            logger.info("Started Redis listener for new weather data")
            
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    try:
                        # Parse new data
                        data = json.loads(message['data'])
                        current_time = datetime.fromtimestamp(data['dt'])
                        logger.info(f"Received new weather data at {current_time}")
                        
                        # Get latest data including new record
                        df = await self.get_weather_data()
                        if not df.empty:
                            # Run analyses concurrently with new data
                            await asyncio.gather(
                                self.correlation(),
                                self.seasonal()
                            )
                            logger.info("Completed analyses with new data")
                        else:
                            logger.warning("No data available for analysis")
                            
                    except json.JSONDecodeError as e:
                        logger.error(f"Error decoding message: {e}")
                    except Exception as e:
                        logger.error(f"Error processing new data: {e}")
                
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error in Redis listener: {e}")
            # Attempt to reconnect
            await asyncio.sleep(5)
            await self.start_redis_listener()

async def main():
    service = WeatherAnalysis()
    await service.start()

if __name__ == "__main__":
    asyncio.run(main())