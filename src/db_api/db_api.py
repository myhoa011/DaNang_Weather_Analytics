from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
import aiomysql
import httpx
import os
import sys
from dotenv import load_dotenv
from contextlib import asynccontextmanager

sys.path.append(".")
from src.logger import logger
from src.db_api.weather import WeatherData

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
                query = "SELECT * FROM raw_weather_data ORDER BY dt DESC"
                await cur.execute(query)
                results = await cur.fetchall()
                return [WeatherData(**row) for row in results]
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