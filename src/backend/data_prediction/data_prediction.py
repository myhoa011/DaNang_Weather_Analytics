from typing import List, Dict, Any
import os
import time
import aiohttp
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestRegressor
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
        
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1
        )
        
        self.is_trained = False
        self.redis = None
        self.is_listening = False

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
        """Close HTTP session and Redis"""
        if self.session:
            await self.session.close()
            self.session = None
            
        if self.redis:
            await self.redis.close()
            self.redis = None

    async def start_redis_listener(self):
        """Start listening for new data from Redis"""
        try:
            if self.redis is None:
                self.redis = await aioredis.from_url(
                    'redis://redis:6379',
                    password=os.getenv('REDIS_PASSWORD')
                )
            
            pubsub = self.redis.pubsub()
            await pubsub.subscribe('weather_data')
            self.is_listening = True
            
            logger.info("Started Redis listener")
            
            while self.is_listening:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = json.loads(message['data'])
                    logger.info(f"Received new data: dt={datetime.fromtimestamp(data['dt'])}")
                    
                    predictions = await self.predict([data])
                    if predictions:
                        # Format predictions cho database
                        formatted_predictions = []
                        created_at = int(datetime.now().timestamp())
                        
                        for pred in predictions:
                            formatted_predictions.append({
                                'dt': pred['dt'],
                                'temp': float(pred['temp']),
                                'hour': pred['hour'],
                                'day': pred['day'],
                                'month': pred['month'],
                                'year': pred['year'],
                                'created_at': created_at,
                                'formatted_time': pred['formatted_time'],
                                'prediction_hour': pred['prediction_hour']
                            })
                        
                        try:
                            async with self.session.post(
                                f"{self.db_api_url}/api/weather/predictions",
                                json=formatted_predictions
                            ) as response:
                                if response.status == 200:
                                    logger.info(f"Saved {len(formatted_predictions)} predictions")
                                else:
                                    logger.error(f"Error saving predictions: {await response.text()}")
                        except Exception as e:
                            logger.error(f"Error saving predictions: {e}")
                
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error in Redis listener: {e}")
            self.is_listening = False
        finally:
            if self.redis:
                await self.redis.aclose()

    async def train_model(self, data: List[Dict]):
        """Train model with data"""
        try:
            if len(data) < 2:
                return

            # Convert to DataFrame
            df = pd.DataFrame(data)
            
            # Add time-based features
            df = self.add_time_features(df)
            
            # Prepare features and target
            X = df[self.feature_columns]
            y = df['temp']

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            # Log feature importances
            importances = pd.DataFrame({
                'feature': self.feature_columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info(f"Model trained with {len(df)} samples")
            logger.info("Feature importances:")
            for idx, row in importances.iterrows():
                logger.info(f"{row['feature']}: {row['importance']:.4f}")

        except Exception as e:
            logger.error(f"Error training model: {e}")

    async def predict(self, current_data):
        """Predict next 3 hours"""
        try:
            if not current_data:
                logger.warning("No current data available for prediction")
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
                
                # Predict
                temp_pred = self.model.predict(X_scaled)[0]
                
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

    async def run(self):
        """Main prediction loop"""
        try:
            logger.info("Starting prediction service...")
            
            # Initialize connections
            await self.connect()
            
            # Train model only once at startup with historical data
            logger.info("Collecting historical data for initial training...")
            async with self.session.get(f"{self.db_api_url}/api/weather") as response:
                if response.status == 200:
                    initial_training_data = await response.json()
                    initial_training_data = sorted(initial_training_data, key=lambda x: x['dt'])
                    logger.info(f"Collected {len(initial_training_data)} historical records")
                    
                    # Train model
                    await self.train_model(initial_training_data)
                    logger.info("Initial model training completed")
                    
                    # Dự đoán ngay với dữ liệu cuối cùng
                    latest_data = initial_training_data[-1]
                    logger.info(f"Making initial predictions with latest data: dt={datetime.fromtimestamp(latest_data['dt'])}")
                    predictions = await self.predict([latest_data])
                    if predictions:
                        async with self.session.post(
                            f"{self.db_api_url}/api/weather/predictions",
                            json=predictions
                        ) as response:
                            if response.status == 200:
                                logger.info(f"Saved initial predictions")
                            else:
                                logger.error(f"Failed to save initial predictions: {response.status}")
                else:
                    logger.error("Failed to get historical data")
                    return

            while True:
                # Nhận và xử lý dữ liệu từ Redis
                if self.redis is None:
                    self.redis = await aioredis.from_url(
                        'redis://redis:6379',
                        password=os.getenv('REDIS_PASSWORD')
                    )
                
                pubsub = self.redis.pubsub()
                await pubsub.subscribe('weather_data')
                
                # Đợi và xử lý tin nhắn trong 1 giờ
                start_time = datetime.now()
                while (datetime.now() - start_time).total_seconds() < 3600:  # 1 giờ = 3600 giây
                    message = await pubsub.get_message(ignore_subscribe_messages=True)
                    if message:
                        data = json.loads(message['data'])
                        logger.info(f"Received new data: dt={datetime.fromtimestamp(data['dt'])}")
                        
                        predictions = await self.predict([data])
                        if predictions:
                            formatted_predictions = []
                            created_at = int(datetime.now().timestamp())
                            
                            for pred in predictions:
                                formatted_predictions.append({
                                    'dt': pred['dt'],
                                    'temp': float(pred['temp']),
                                    'hour': pred['hour'],
                                    'day': pred['day'],
                                    'month': pred['month'],
                                    'year': pred['year'],
                                    'created_at': created_at,
                                    'formatted_time': pred['formatted_time'],
                                    'prediction_hour': pred['prediction_hour']
                                })
                            
                            async with self.session.post(
                                f"{self.db_api_url}/api/weather/predictions",
                                json=formatted_predictions
                            ) as response:
                                if response.status == 200:
                                    logger.info(f"Saved predictions")
                                else:
                                    error_text = await response.text()
                                    logger.error(f"Error saving predictions: {error_text}")
                    
                    await asyncio.sleep(1)
                
                # Đóng Redis connection sau mỗi giờ
                await pubsub.unsubscribe('weather_data')
                await self.redis.aclose()
                self.redis = None
                
                # Chờ đến đầu giờ tiếp theo
                current_time = datetime.now()
                next_hour = current_time.replace(minute=10, second=0, microsecond=0) + timedelta(hours=1)
                wait_seconds = (next_hour - current_time).total_seconds()
                logger.info(f"Waiting {wait_seconds:.0f} seconds until next hour")
                await asyncio.sleep(wait_seconds)
            
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
        finally:
            await self.close()

async def main():
    predictor = WeatherPredictor()
    await predictor.run()

if __name__ == "__main__":
    asyncio.run(main())
