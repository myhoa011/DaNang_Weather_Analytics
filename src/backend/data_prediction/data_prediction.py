from fastapi import FastAPI, HTTPException
import os
import sys
import time
import aiohttp
import asyncio
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, root_mean_squared_error

sys.path.append(".")
from src.logger import logger

# Load environment variables
load_dotenv()

class WeatherPredictor:
    """
    Weather prediction service that handles model training and predictions.
    Automatically trains daily and makes predictions every 5 minutes.
    """
    
    def __init__(self):
        """
        Initialize predictor with required components:
        - HTTP session for API communication
        - StandardScaler for feature normalization
        - XGBoost model for temperature prediction
        - Tracking variables for model state
        """
        self.db_api_url = os.getenv('DB_API_URL')
        self.session = None
        self.scaler = StandardScaler()
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.is_trained = False
        self.last_trained = None  # Timestamp of last training
        self.feature_columns = None
        self.train_metrics = None
        self.test_metrics = None

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

    async def send_predictions(self, predictions: List[Dict[str, Any]]) -> bool:
        """
        Send predictions to db_api
        
        Args:
            predictions: List of prediction dictionaries
            
        Returns:
            bool: Success status
        """
        try:
            if self.session is None:
                await self.connect()

            url = f"{self.db_api_url}/api/predictions/bulk"
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            async with self.session.post(url, json=predictions, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Successfully saved {result['count']} predictions")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to save predictions: {response.status}, error: {error}")
                    return False

        except Exception as e:
            logger.error(f"Error sending predictions: {e}")
            return False

    def prepare_data(self, df: pd.DataFrame) -> tuple:
        """
        Prepare data for XGBoost prediction with train/test split
        """
        try:
            # Create a copy of the dataframe
            df = df.copy()
            
            # Features for prediction
            features = ['temp', 'pressure', 'humidity', 'clouds', 
                       'visibility', 'wind_speed', 'wind_deg']
            
            # Create time-based features
            dt = pd.to_datetime(df['dt'], unit='s')
            time_features = pd.DataFrame({
                'hour': dt.dt.hour,
                'day': dt.dt.day,
                'month': dt.dt.month
            })
            
            # Create lag features all at once
            lag_features = {}
            for feature in features:
                for i in range(1, 25):  # 24 hours of lag features
                    lag_features[f'{feature}_lag_{i}'] = df[feature].shift(i)
            
            # Combine all features using concat
            final_df = pd.concat([
                df[features],
                time_features,
                pd.DataFrame(lag_features)
            ], axis=1)
            
            # Drop rows with NaN (first 24 hours)
            final_df = final_df.dropna()
            
            # Prepare features
            feature_columns = [col for col in final_df.columns if any(
                f'{feature}_lag_' in col for feature in features
            )] + ['hour', 'day', 'month']
            
            X = final_df[feature_columns]
            y = final_df['temp']  # Predict temperature
            
            # Split data into train and test sets
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            logger.info(f"Prepared {len(X_train)} training samples and {len(X_test)} test samples")
            return X_train_scaled, X_test_scaled, y_train, y_test, feature_columns
            
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            raise

    def evaluate_model(self, y_true, y_pred, dataset="train") -> dict:
        """Calculate model performance metrics"""
        metrics = {
            'mse': mean_squared_error(y_true, y_pred),
            'rmse': root_mean_squared_error(y_true, y_pred),
            'mae': mean_absolute_error(y_true, y_pred),
            'r2': r2_score(y_true, y_pred)
        }
        logger.info(f"{dataset.title()} Metrics - RMSE: {metrics['rmse']:.2f}, MAE: {metrics['mae']:.2f}, R2: {metrics['r2']:.2f}")
        return metrics

    async def train_model(self) -> None:
        """
        Train the XGBoost model once per day.
        
        Process:
        1. Check if training is needed (24h since last training)
        2. Fetch latest data from Database API
        3. Prepare features and split train/test data
        4. Train model and calculate performance metrics
        5. Update model state and timestamps
        
        Raises:
            Exception: If any step in the training process fails
        """
        try:
            current_time = int(time.time())
            
            # Only train if 24 hours have passed since last training
            if (self.last_trained is None or 
                current_time - self.last_trained >= 24 * 3600):
                
                df = await self.get_weather_data()
                X_train, X_test, y_train, y_test, self.feature_columns = self.prepare_data(df)
                
                logger.info("Training XGBoost model...")
                self.model.fit(X_train, y_train)
                
                # Evaluate on training data
                y_train_pred = self.model.predict(X_train)
                self.train_metrics = self.evaluate_model(y_train, y_train_pred, "train")
                
                # Evaluate on test data
                y_test_pred = self.model.predict(X_test)
                self.test_metrics = self.evaluate_model(y_test, y_test_pred, "test")
                
                self.is_trained = True
                self.last_trained = current_time
                logger.info("Model training completed successfully")
            else:
                logger.info("Using existing model (trained within last 24h)")
                
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise

    async def predict(self) -> List[Dict[str, Any]]:
        """
        Make weather predictions for next 3 hours (T+1, T+2, T+3).
        
        Process:
        1. Check if model needs training
        2. Get latest weather data
        3. Generate predictions for next 3 hours
        4. Send predictions to Database API
        
        Returns:
            List[Dict[str, Any]]: List of predictions containing:
                - dt: Timestamp for prediction
                - temp: Predicted temperature
                - prediction_hour: T+1, T+2, or T+3
                - Other weather parameters
                
        Raises:
            Exception: If prediction process fails
        """
        try:
            if not self.is_trained:
                await self.train_model()

            # Get latest data
            df = await self.get_weather_data()
            last_known = df.iloc[-1].to_dict()
            current_data = df.copy()
            predictions = []

            # Predict exactly 3 hours ahead
            for i in range(3):
                # Create next timestamp
                next_timestamp = last_known['dt'] + (i + 1) * 3600
                next_dt = pd.to_datetime(next_timestamp, unit='s')
                
                # Create features for next hour
                data_dict = {
                    'dt': [next_timestamp],
                    'hour': [next_dt.hour],
                    'day': [next_dt.day],
                    'month': [next_dt.month]
                }
                
                # Add all lag features at once
                features = ['temp', 'pressure', 'humidity', 'clouds', 
                           'visibility', 'wind_speed', 'wind_deg']
                for feature in features:
                    for lag in range(1, 25):
                        data_dict[f'{feature}_lag_{lag}'] = [current_data[feature].iloc[-(lag)]]
                
                # Create DataFrame and scale features
                next_row = pd.DataFrame(data_dict)
                X_pred = self.scaler.transform(next_row[self.feature_columns])
                
                # Make prediction
                temp_pred = self.model.predict(X_pred)[0]
                
                # Create prediction object
                prediction = {
                    'dt': int(next_timestamp),
                    'prediction_hour': f'T+{i+1}',
                    'temp': float(temp_pred),
                    'pressure': last_known['pressure'],
                    'humidity': last_known['humidity'],
                    'clouds': last_known['clouds'],
                    'visibility': last_known['visibility'],
                    'wind_speed': last_known['wind_speed'],
                    'wind_deg': last_known['wind_deg'],
                    'created_at': int(time.time())
                }
                
                predictions.append(prediction)
                
                # Update current data for next iteration
                current_data = pd.concat([
                    current_data,
                    pd.DataFrame([prediction])
                ]).reset_index(drop=True)
            
            # # Send predictions to Database API
            # await self.send_predictions(predictions)
            
            logger.info(f"Generated {len(predictions)} predictions")
            return predictions
            
        except Exception as e:
            logger.error(f"Error in prediction cycle: {e}")
            raise

    async def get_chart_data(self) -> Dict[str, Any]:
        """
        Get data for 24-hour temperature chart (21 historical hours + 3 predicted hours)
        
        Returns:
            Dict[str, Any]: {
                'temperatures': List of 24 temperature records,
                'current_temp': Current temperature,
                'min_temp': Minimum temperature in 24h period,
                'max_temp': Maximum temperature in 24h period,
                'last_updated': Timestamp of last update
            }
        """
        try:
            # Get predictions for next 3 hours
            predictions = await self.predict()
            
            # Get last 21 hours of historical data
            df = await self.get_weather_data()
            historical_data = df.tail(21)[['dt', 'temp']].to_dict('records')
            
            # Format historical data
            historical_points = [{
                'dt': int(record['dt']),
                'temp': float(record['temp']),
                'type': 'historical',
                'hour': datetime.fromtimestamp(record['dt']).strftime('%H:00'),
                'formatted_temp': f"{float(record['temp']):.1f}°C"
            } for record in historical_data]
            
            # Format prediction data
            prediction_points = [{
                'dt': pred['dt'],
                'temp': pred['temp'],
                'type': 'prediction',
                'hour': datetime.fromtimestamp(pred['dt']).strftime('%H:00'),
                'formatted_temp': f"{pred['temp']:.1f}°C"
            } for pred in predictions]
            
            # Combine and sort all temperature points
            all_temps = historical_points + prediction_points
            all_temps.sort(key=lambda x: x['dt'])
            
            # Calculate statistics
            chart_data = {
                'temperatures': all_temps,
                'current_temp': float(df.iloc[-1]['temp']),
                'min_temp': min(point['temp'] for point in all_temps),
                'max_temp': max(point['temp'] for point in all_temps),
                'last_updated': int(time.time()),
                'statistics': {
                    'historical_avg': sum(point['temp'] for point in historical_points) / len(historical_points),
                    'prediction_avg': sum(point['temp'] for point in prediction_points) / len(prediction_points)
                }
            }
            
            logger.info(f"Generated chart data with {len(all_temps)} points")
            return chart_data
            
        except Exception as e:
            logger.error(f"Error generating chart data: {e}")
            raise

predictor = WeatherPredictor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events handler for FastAPI application.
    
    Handles:
    - Startup: Initialize predictor and start background tasks
    - Background: Periodic training and prediction tasks
    - Shutdown: Cleanup and close connections
    """
    try:
        # Startup initialization
        logger.info("Initializing Weather Predictor...")
        await predictor.connect()
        
        # Define background tasks
        async def periodic_training():
            """Background task for daily model training"""
            while True:
                await predictor.train_model()
                await asyncio.sleep(24 * 3600)  # Train once per day
                
        async def periodic_prediction():
            """Background task for periodic predictions"""
            while True:
                await predictor.predict()
                await asyncio.sleep(300)  # Predict every 5 minutes
        
        # Start background tasks
        asyncio.create_task(periodic_training())
        asyncio.create_task(periodic_prediction())
        
        yield
        
    finally:
        # Cleanup on shutdown
        logger.info("Closing Weather Predictor...")
        await predictor.close()

# Initialize FastAPI application
app = FastAPI(
    title="Weather Prediction Service",
    description="Microservice for weather prediction using XGBoost",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/predict")
async def get_prediction() -> List[Dict[str, Any]]:
    """
    Get weather predictions for next 3 hours (T+1, T+2, T+3)
    
    Returns:
        List[Dict[str, Any]]: List of predictions with timestamps and temperatures
        
    Raises:
        HTTPException: If prediction fails
    """
    try:
        predictions = await predictor.predict()
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-metrics")
async def get_model_metrics():
    """Get model training and test metrics"""
    if not predictor.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained yet")
        
    return {
        "training_metrics": predictor.train_metrics,
        "test_metrics": predictor.test_metrics,
        "is_trained": predictor.is_trained
    }

@app.get("/chart-data")
async def get_chart_data() -> Dict[str, Any]:
    """
    Get data for 24-hour temperature chart visualization
    
    Returns:
        Dict containing:
        - 21 historical temperature points
        - 3 predicted temperature points
        - Current, min, and max temperatures
        - Statistics and metadata
        
    Example Response:
    {
        "temperatures": [
            {
                "dt": 1637000400,
                "temp": 25.6,
                "type": "historical",
                "hour": "10:00",
                "formatted_temp": "25.6°C"
            },
            // ... more points ...
            {
                "dt": 1637086000,
                "temp": 28.3,
                "type": "prediction",
                "hour": "10:00",
                "formatted_temp": "28.3°C"
            }
        ],
        "current_temp": 24.8,
        "min_temp": 22.5,
        "max_temp": 28.3,
        "last_updated": 1637075200,
        "statistics": {
            "historical_avg": 24.5,
            "prediction_avg": 26.2
        }
    }
    """
    try:
        chart_data = await predictor.get_chart_data()
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.backend.data_prediction.data_prediction:app",
        host="0.0.0.0",
        port=8004,
        reload=True
    )
