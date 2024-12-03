import os
import sys

import uvicorn
import pandas as pd

import numpy as np

import aiohttp

import asyncio

from typing import List, Dict, Any
from datetime import datetime

from dotenv import load_dotenv

from statsmodels.tsa.seasonal import seasonal_decompose

from fastapi import FastAPI, HTTPException

from contextlib import asynccontextmanager

from sklearn.preprocessing import StandardScaler

from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.asyncio import AsyncIOScheduler

#from statsmodels.tsa.seasonal import seasonal_decompose

# Append project root to system path

sys.path.append(".")
from src.logger import logger


# Load environment variables

load_dotenv()


class WeatherAnalysis:

    """Weather analysis service that gets data from db_api and makes analysis"""
    
    def __init__(self, api_url=None):
        """Initialize analysis with API endpoint"""
        self.db_api_url = api_url or os.getenv('DB_API_URL')
        self.session = None
        self.scaler = StandardScaler()
        self.scheduler = AsyncIOScheduler()

    async def connect(self):
        """Initialize HTTP session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()

    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None

    async def get_weather_data(self) -> pd.DataFrame:
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
            async with self.session.get(f"{self.db_api_url}/api/weather", headers=headers) as response:
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
    #call 60m/turn
    async def analysis(self):
        await self.corelation()
        await self.seasonal()


    async def start(self):
        """Start the Weather Data Analysis service"""
        try:
            logger.info("Starting Weather Data Analysis service")
            
            ####
            await self.analysis()
            
            self.scheduler.add_job(
                self.analysis,
                'interval',
                minutes=60,
                id='weather_data_analyst'
            )
            
            self.scheduler.start()
            

            try:
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                await self.stop()

        except Exception as e:
            logger.error(f"Error starting service: {e}")
            await self.stop()

    async def stop(self):
        try:
            self.scheduler.shutdown()
            if self.session:
                await self.session.close()
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
                    logger.info(f"Retrieved {len(df)} weather records")
                    return df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {response.status}, {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise
    
    
        
    async def clear_data(self):
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
                    result = await response.json()
                    logger.info(f"API response for delete: {result}")
                else:
                    error = await response.text()
                    logger.error(f"API DELETE error: {error}")
                    raise Exception(f"API error: {response.status}, {error}")
                
        except Exception as e:
            logger.error(f"Error stopping service: {e}")  
        
        
    async def corelation(self):
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
                await self.clear_data()

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
                    logger.info(f"API response: {result}")
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
            logger.error(f"Error fetching data: {e}")
            raise
    
    async def clear_data_seasonal(self):
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
            
            # Chuyển timestamp sang định dạng datetime string
            df['dt'] = df['dt'].apply(lambda x: datetime.utcfromtimestamp(int(x)).strftime('%Y-%m-%d %H:%M:%S'))
         
            # Chuyển đổi nhiệt độ từ °K sang °C
            df['temp'] = df['temp'].apply(lambda f: f-273.15)
        
            # Chuyển đổi đơn vị tầm nhìn từ m sang km
            df['visibility'] = df['visibility'].apply(lambda f: f/1000)



            ##bắt đầu xử lý
            #temp
            # Phân tích Seasonal Decomposition
            result_temp = seasonal_decompose(df['temp'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            
            # Tạo DataFrame từ các thành phần của result
            temp_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_temp': result_temp.observed,
                'trend_temp': result_temp.trend,
                'seasonal_temp': result_temp.seasonal,
                'residual_temp': result_temp.resid
            })
            
            #pressure
            result_pressure = seasonal_decompose(df['pressure'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            # Tạo DataFrame từ các thành phần của result
            pressure_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_pressure': result_pressure.observed,
                'trend_pressure': result_pressure.trend,
                'seasonal_pressure': result_pressure.seasonal,
                'residual_pressure': result_pressure.resid
            })
            
            #humidity
            result_humidity = seasonal_decompose(df['humidity'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            # Tạo DataFrame từ các thành phần của result
            humidity_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_humidity': result_humidity.observed,
                'trend_humidity': result_humidity.trend,
                'seasonal_humidity': result_humidity.seasonal,
                'residual_humidity': result_humidity.resid
            })
            
            #clouds
            result_clouds = seasonal_decompose(df['clouds'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            # Tạo DataFrame từ các thành phần của result
            clouds_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_clouds': result_clouds.observed,
                'trend_clouds': result_clouds.trend,
                'seasonal_clouds': result_clouds.seasonal,
                'residual_clouds': result_clouds.resid
            })

            #visibility
            result_visibility = seasonal_decompose(df['visibility'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            # Tạo DataFrame từ các thành phần của result
            visibility_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_visibility': result_visibility.observed,
                'trend_visibility': result_visibility.trend,
                'seasonal_visibility': result_visibility.seasonal,
                'residual_visibility': result_visibility.resid
            })

            #wind_speed
            result_wind_speed = seasonal_decompose(df['wind_speed'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            # Tạo DataFrame từ các thành phần của result
            wind_speed_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_wind_speed': result_wind_speed.observed,
                'trend_wind_speed': result_wind_speed.trend,
                'seasonal_wind_speed': result_wind_speed.seasonal,
                'residual_wind_speed': result_wind_speed.resid
            })

            #wind_deg
            result_wind_deg = seasonal_decompose(df['wind_deg'], model='additive', period=720)  # period có thể điều chỉnh phù hợp
            
            # Tạo DataFrame từ các thành phần của result
            wind_deg_df = pd.DataFrame({
                'dt': df['dt'], 
                'observed_wind_deg': result_wind_deg.observed,
                'trend_wind_deg': result_wind_deg.trend,
                'seasonal_wind_deg': result_wind_deg.seasonal,
                'residual_wind_deg': result_wind_deg.resid
            })
            
            #gộp dataFrame lại thành seasonal_df
            # Gộp hai DataFrame theo cột (axis=1)
            seasonal_df = pd.concat([temp_df, pressure_df, humidity_df, clouds_df, visibility_df, wind_speed_df, wind_deg_df], axis=1)
            
            seasonal_df = seasonal_df.dropna()

            
            # Chuyển DataFrame thành danh sách dict để gửi API
            seasonal_data = seasonal_df.to_dict('records')
            
            logger.info(f"Seasonal data: {seasonal_data}")
            
            data_seasonal_old = await self.get_seasonal_data()
            
            if not data_seasonal_old.empty:
                await self.clear_data_seasonal()

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
            logger.exception(f"error calculating seasonal decomposition: {e}")
            raise

    


analysis = WeatherAnalysis()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan events
    Args:
        app (FastAPI): FastAPI application instance
    """
    logger.info("Initializing Weather Analysis")
    await analysis.connect()
    yield
    
    logger.info("Closing Weather Analysis")
    await analysis.close()


# Initialize FastAPI app

app = FastAPI(
    title="Weather Analysis API",
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

async def main():
    api_url = os.getenv('DB_API_URL')
    if not api_url:
        logger.error("DB_API_URL not set in environment variables")
        return
    
    service = WeatherAnalysis(api_url)
    await service.start()  # Khởi động dịch vụ phân tích

    # Sau khi start, chạy FastAPI
    uvicorn.run(
        "src.backend.data_analysis.data_analysis:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )

if __name__ == "__main__":
    asyncio.run(main())  # Chạy main để khởi động cả dịch vụ phân tích và FastAPI
