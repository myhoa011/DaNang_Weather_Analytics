import os
import sys
import uvicorn
import pandas as pd
import numpy as np
import httpx
import xgboost as xgb
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from sklearn.preprocessing import StandardScaler

# Append project root to system path
sys.path.append(".")
from src.logger import logger

# Load environment variables
load_dotenv()

class WeatherPredictor:
    """Weather prediction service that gets data from db_api and makes predictions"""
    
    def __init__(self):
        """Initialize predictor with API endpoint"""
        self.db_api_url = os.getenv('DB_API_URL')
        self.client = None
        self.scaler = StandardScaler()
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
    
    async def connect(self):
        """Initialize HTTP client"""
        if not self.client:
            self.client = httpx.AsyncClient()
    
    async def close(self):
        """Close HTTP client"""
        if self.client:
            await self.client.aclose()
    
    async def get_weather_data(self) -> pd.DataFrame:
        """
        Fetch weather data from db_api
        
        Returns:
            pd.DataFrame: DataFrame containing historical weather data
        """
        try:
            response = await self.client.get(f"{self.db_api_url}/api/weather")
            response.raise_for_status()
            
            # Convert response to DataFrame
            data = response.json()
            df = pd.DataFrame(data)
            
            # Sort by timestamp
            df = df.sort_values('dt')
            logger.info(f"Retrieved {len(df)} weather records")
            
            return df
        
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise
    
    def prepare_data(self, df: pd.DataFrame) -> tuple:
        """
        Prepare data for XGBoost prediction
        
        Args:
            df (pd.DataFrame): Input weather DataFrame
        
        Returns:
            Tuple containing scaled features, target variable, and feature columns
        """
        try:
            # Features for prediction
            features = [
                'temp', 'pressure', 'humidity', 'clouds', 
                'visibility', 'wind_speed', 'wind_deg'
            ]
            
            # Create time-based features
            df['hour'] = pd.to_datetime(df['dt'], unit='s').dt.hour
            df['day'] = pd.to_datetime(df['dt'], unit='s').dt.day
            df['month'] = pd.to_datetime(df['dt'], unit='s').dt.month
            
            # Add lag features (previous hours)
            for feature in features:
                for i in range(1, 25):  # 24 hours of lag features
                    df[f'{feature}_lag_{i}'] = df[feature].shift(i)
            
            # Drop rows with NaN (first 24 hours)
            df = df.dropna()
            
            # Prepare features
            feature_columns = [
                col for col in df.columns 
                if any(f'{feature}_lag_' in col for feature in features)
            ] + ['hour', 'day', 'month']
            
            X = df[feature_columns]
            y = df['temp']  # Predict temperature
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            logger.info(f"Prepared {len(X)} samples with {len(feature_columns)} features")
            
            return X_scaled, y, feature_columns
        
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            raise
    
    async def predict(self, hours_ahead: int = 24) -> List[Dict[str, Any]]:
        """
        Make weather predictions using XGBoost
        
        Args:
            hours_ahead (int): Number of hours to predict ahead
        
        Returns:
            List of prediction dictionaries
        """
        try:
            # Get historical data
            df = await self.get_weather_data()
            
            # Prepare training data
            X, y, feature_columns = self.prepare_data(df)
            
            # Train model
            logger.info("Training XGBoost model...")
            self.model.fit(X, y)
            
            # Prepare data for prediction
            last_known = df.iloc[-1].to_dict()
            predictions = []
            current_data = df.copy()
            
            features = [
                'temp', 'pressure', 'humidity', 'clouds', 
                'visibility', 'wind_speed', 'wind_deg'
            ]
            
            for i in range(hours_ahead):
                # Create next timestamp
                next_timestamp = last_known['dt'] + (i + 1) * 3600
                next_dt = pd.to_datetime(next_timestamp, unit='s')
                
                # Create features for next hour
                next_row = pd.DataFrame({
                    'dt': [next_timestamp],
                    'hour': [next_dt.hour],
                    'day': [next_dt.day],
                    'month': [next_dt.month]
                })
                
                # Add lag features
                for feature in features:
                    for lag in range(1, 25):
                        next_row[f'{feature}_lag_{lag}'] = current_data[feature].iloc[-(lag)]
                
                # Scale features
                X_pred = self.scaler.transform(next_row[feature_columns])
                
                # Make prediction
                temp_pred = self.model.predict(X_pred)[0]
                
                # Create prediction dictionary
                prediction = {
                    'dt': int(next_timestamp),
                    'temp': float(temp_pred),
                    'pressure': last_known['pressure'],
                    'humidity': last_known['humidity'],
                    'clouds': last_known['clouds'],
                    'visibility': last_known['visibility'],
                    'wind_speed': last_known['wind_speed'],
                    'wind_deg': last_known['wind_deg']
                }
                
                predictions.append(prediction)
                
                # Add prediction to current data for next iteration
                current_data = pd.concat([
                    current_data,
                    pd.DataFrame([prediction])
                ]).reset_index(drop=True)
            
            logger.info(f"Generated {len(predictions)} predictions using XGBoost")
            return predictions
        
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            raise

# Global predictor instance
predictor = WeatherPredictor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan events
    
    Args:
        app (FastAPI): FastAPI application instance
    """
    try:
        logger.info("Initializing Weather Predictor...")
        await predictor.connect()
        yield
    finally:
        logger.info("Closing Weather Predictor...")
        await predictor.close()

# Initialize FastAPI app
app = FastAPI(
    title="Weather Prediction API",
    lifespan=lifespan
)

@app.get("/predict/{hours}")
async def get_prediction(hours: int = 24) -> List[Dict[str, Any]]:
    """
    Get weather predictions for specified hours ahead
    
    Args:
        hours (int): Number of hours to predict ahead (default: 24)
    
    Returns:
        List[Dict[str, Any]]: List of weather predictions
    """
    try:
        predictions = await predictor.predict(hours)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
def run_app():
    """
    Run the FastAPI application using Uvicorn
    """
    uvicorn.run(
        "src.backend.data_prediction.data_prediction:app",
        host="0.0.0.0",
        port=8004,
        reload=True
    )

if __name__ == "__main__":
    run_app()