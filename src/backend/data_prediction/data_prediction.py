from typing import List, Dict, Any
import os
import aiohttp
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from lightgbm import LGBMRegressor, early_stopping, log_evaluation
from sklearn.preprocessing import StandardScaler
from src.logger import logger
import redis.asyncio as aioredis
import json

# Load environment variables
load_dotenv()

class WeatherPredictor:
    def __init__(self):
        self.db_api_url = os.getenv('DB_API_URL')
        self.session = None
        self.scaler = StandardScaler()
        
        # Thêm features mới
        self.feature_columns = [
            'pressure', 'humidity', 'clouds', 'visibility', 
            'wind_speed', 'wind_deg',
            'hour_sin', 'hour_cos',  # Chu kỳ 24h
            'is_daytime',  # 0: đêm (18-6h), 1: ngày (6-18h)
            'season_sin', 'season_cos'  # Chu kỳ 4 mùa
        ]
        
        self.model = LGBMRegressor(
            n_estimators=1000,
            learning_rate=0.05,
            max_depth=10,
            num_leaves=31,
            min_child_samples=20,
            random_state=42,
        )
        
        self.is_trained = False
        self.best_iteration = None
        self.redis = None

    async def connect(self):
        """Initialize HTTP session and Redis"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
            
        if self.redis is None:
            self.redis = await aioredis.from_url(
                f'redis://redis:6379',
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

    def add_time_features(self, df):
        """Thêm các features liên quan đến thời gian"""
        # Chuyển đổi timestamp thành datetime nếu chưa có
        if 'datetime' not in df.columns:
            df['datetime'] = pd.to_datetime(df['dt'], unit='s')

        # Thời điểm trong ngày (24h cycle)
        df['hour'] = df['datetime'].dt.hour
        df['hour_sin'] = np.sin(2 * np.pi * df['hour']/24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour']/24)
        
        # Ngày/đêm (6-18h là ngày)
        df['is_daytime'] = ((df['hour'] >= 6) & (df['hour'] < 18)).astype(int)
        
        # Mùa (3,4,5: xuân; 6,7,8: hạ; 9,10,11: thu; 12,1,2: đông)
        df['month'] = df['datetime'].dt.month
        # Chuyển tháng thành góc (0-2π)
        month_angle = 2 * np.pi * ((df['month'] - 3) % 12) / 12
        df['season_sin'] = np.sin(month_angle)
        df['season_cos'] = np.cos(month_angle)
        
        return df

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
        """Get historical weather data from API"""
        try:
            async with self.session.get(f"{self.db_api_url}/api/weather") as response:
                if response.status == 200:
                    data = await response.json()
                    if not data:
                        logger.warning("No historical data available")
                        return pd.DataFrame()
                    
                    # Convert to DataFrame
                    df = pd.DataFrame(data)
                    
                    # Convert timestamp to datetime
                    df['dt'] = pd.to_datetime(df['dt'], unit='s')
                    
                    logger.info(f"Retrieved {len(df)} historical records")
                    return df
                else:
                    error_text = await response.text()
                    logger.error(f"Error response from API: {error_text}")
                    raise Exception(f"API error: {response.status}, {error_text}")
        except Exception as e:
            logger.error(f"Error fetching historical data: {e}")
            return pd.DataFrame()

    async def train_model(self, data: pd.DataFrame):
        """Train model with data"""
        try:
            if data.empty:
                logger.warning("No data available for training")
                return

            # Add time-based features
            data = self.add_time_features(data)
            
            # Prepare features and target
            X = data[self.feature_columns]
            y = data['temp']

            # Split data into train and validation sets
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)

            # Train model with early stopping
            self.model.fit(
                X_train_scaled, 
                y_train,
                eval_set=[(X_val_scaled, y_val)],
                eval_metric='mse',
                callbacks=[
                    early_stopping(stopping_rounds=10),
                    log_evaluation(period=1)  # Log mỗi iteration
                ]
            )
            
            self.is_trained = True
            self.best_iteration = self.model.best_iteration_

            # Evaluate model
            y_pred = self.model.predict(X_val_scaled)
            
            # Calculate metrics
            mse = mean_squared_error(y_val, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_val, y_pred)
            
            # Log evaluation metrics
            logger.info(f"Model evaluation metrics:")
            logger.info(f"MSE: {mse:.4f}")
            logger.info(f"RMSE: {rmse:.4f}")
            logger.info(f"R2 score: {r2:.4f}")
            
            # Log feature importances
            importances = pd.DataFrame({
                'feature': self.feature_columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info(f"Model trained with {len(X_train)} samples")
            logger.info(f"Best iteration: {self.best_iteration}")
            logger.info("Feature importances:")
            for idx, row in importances.iterrows():
                logger.info(f"{row['feature']}: {row['importance']:.4f}")

        except Exception as e:
            logger.error(f"Error training model: {e}")

    async def predict(self, current_data):
        """Predict next 3 hours"""
        try:
            if not current_data or not self.is_trained:
                logger.warning("No current data available for prediction or model not trained")
                return []
                
            # Convert to DataFrame and add time features
            df = pd.DataFrame(current_data)
            df = self.add_time_features(df)
            
            last_known = pd.to_datetime(df.iloc[-1]['dt'], unit='s')
            predictions = []

            # Dự đoán cho 3 giờ tiếp theo
            for hour in range(1, 4):  # 1, 2, 3
                next_time = last_known + pd.Timedelta(hours=hour)
                
                # Prepare input data
                current_input = df.iloc[-1].copy()
                current_input['datetime'] = next_time
                current_input['dt'] = int(next_time.timestamp())
                
                # Update time-based features
                input_df = pd.DataFrame([current_input])
                input_df = self.add_time_features(input_df)
                
                # Prepare features for prediction
                X = input_df[self.feature_columns]
                
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Predict using best iteration
                temp_pred = self.model.predict(X_scaled, num_iteration=self.best_iteration)[0]
                
                # Create prediction
                prediction = {
                    'dt': int(next_time.timestamp()),
                    'temp': temp_pred,
                    'hour': next_time.hour,
                    'day': next_time.day,
                    'month': next_time.month,
                    'year': next_time.year,
                    'created_at': int(datetime.now().timestamp()),
                    'formatted_time': next_time.strftime('%Y-%m-%d %H:00:00'),
                    'prediction_hour': hour
                }
                predictions.append(prediction)
            
            logger.info(f"Generated predictions for next 3 hours")
            return predictions
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return []

    async def save_predictions(self, predictions):
        """Save predictions to the database"""
        try:
            async with self.session.post(
                f"{self.db_api_url}/api/weather/predictions",
                json=predictions
            ) as response:
                if response.status == 200:
                    logger.info(f"Saved {len(predictions)} predictions")
                else:
                    logger.error(f"Error saving predictions: {await response.text()}")
        except Exception as e:
            logger.error(f"Error saving predictions: {e}")

    async def start_redis_listener(self):
        """Start listening for new data from Redis"""
        try:
            pubsub = self.redis.pubsub()
            await pubsub.subscribe('weather_data')
            
            logger.info("Started Redis listener")
            
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = json.loads(message['data'])
                    logger.info(f"Received new data: dt={datetime.fromtimestamp(data['dt'])}")
                    
                    # Predict with new data
                    predictions = await self.predict([data])
                    if predictions:
                        await self.save_predictions(predictions)
                
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error in Redis listener: {e}")

    async def run(self):
        """Main prediction loop"""
        try:
            logger.info("Starting prediction service...")
            
            # Initialize connections
            await self.connect()
            
            # Wait for initial data
            await self.wait_for_initial_data()
            
            # Collect historical data for initial training
            historical_data = await self.get_weather_data()
            if historical_data.empty:
                logger.warning("No historical data available after initial load signal")
                return
            
            logger.info(f"Collected {len(historical_data)} historical records")
            
            # Train model with historical data
            await self.train_model(historical_data)
            logger.info("Initial model training completed")
            
            # Start Redis listener to receive new data
            await self.start_redis_listener()
            
            # Keep the service running
            while True:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
        finally:
            await self.close()

async def main():
    predictor = WeatherPredictor()
    await predictor.run()

if __name__ == "__main__":
    asyncio.run(main())
