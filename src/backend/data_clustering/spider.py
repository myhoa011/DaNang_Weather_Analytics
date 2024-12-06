import os
import asyncio
import json
from datetime import datetime
import aiohttp
import pandas as pd
from typing import List, Dict, Any
import redis.asyncio as aioredis
from src.logger import logger

class SpiderProcessor:
    def __init__(self):
        self.session = None
        self.db_api_url = os.getenv("DB_API_URL")
        self.redis = None
        self.dataframe = None
        self.processed_data = None
        self.label_to_season = {0: "Spring", 1: "Winter", 2: "Summer", 3: "Autumn"}

    async def connect(self):
        """Initialize HTTP session and Redis connection"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
            logger.info("Created new HTTP session")
        
        if self.redis is None:
            self.redis = await aioredis.from_url('redis://redis:6379')
            logger.info("Connected to Redis")

    async def get_weather_data(self):
        """Fetch weather data from API"""
        try:
            if self.session is None or self.session.closed:
                await self.connect()

            async with self.session.get(f"{self.db_api_url}/api/data_cluster") as response:
                if response.status == 200:
                    data = await response.json()
                    self.dataframe = pd.DataFrame(data)
                    self.dataframe["date"] = pd.to_datetime(self.dataframe["date"])
                    logger.info(f"Retrieved {len(self.dataframe)} weather records")
                else:
                    error = await response.text()
                    logger.error(f"Failed to fetch data: {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")

    async def process_data(self):
        """Process data into spider chart format"""
        if self.dataframe is None:
            logger.warning("No data fetched. Call get_weather_data() first.")
            return

        try:
            # Nhóm dữ liệu theo season và year
            grouped_data = (
                self.dataframe.groupby(["custom_label", self.dataframe["date"].dt.year])
                .size()
                .reset_index(name="days")
            )

            # Thêm cột season từ custom_label
            grouped_data["season"] = grouped_data["custom_label"].map(self.label_to_season)

            # Đổi tên cột date thành year
            grouped_data = grouped_data.rename(columns={"date": "year"})

            self.processed_data = grouped_data
            logger.info("Data processed successfully for spider chart")

        except Exception as e:
            logger.error(f"Error processing data: {e}")

    async def save_spider_data(self) -> bool:
        """Save processed data to database"""
        if self.processed_data is None:
            logger.warning("No processed data available")
            return False

        try:
            if self.session is None or self.session.closed:
                await self.connect()

            data_to_send = [
                {"season": row["season"], "days": int(row["days"]), "year": int(row["year"])}
                for _, row in self.processed_data.iterrows()
            ]

            headers = {"Content-Type": "application/json"}
            async with self.session.post(
                f"{self.db_api_url}/api/spider", 
                json=data_to_send,
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Successfully saved spider data: {result}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to save spider data: {error}")
                    return False

        except Exception as e:
            logger.error(f"Error saving spider data: {e}")
            return False

    async def start_redis_listener(self):
        """Listen for new weather data and update spider chart"""
        try:
            await self.connect()
            
            # Xử lý dữ liệu ban đầu
            await self.get_weather_data()
            if self.dataframe is not None:
                await self.process_data()
                await self.save_spider_data()
                logger.info("Initial spider data processed and saved")

            # Bắt đầu lắng nghe Redis
            pubsub = self.redis.pubsub()
            await pubsub.subscribe('weather_data')
            logger.info("Started Redis listener for spider data")

            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    try:
                        data = json.loads(message['data'])
                        current_time = datetime.fromtimestamp(data['dt'])
                        logger.info(f"Received new weather data at: {current_time}")

                        # Đợi một chút để đảm bảo dữ liệu đã được xử lý bởi clustering
                        await asyncio.sleep(2)

                        # Cập nhật spider chart
                        await self.get_weather_data()
                        await self.process_data()
                        await self.save_spider_data()
                        logger.info("Spider data updated successfully")

                    except json.JSONDecodeError as e:
                        logger.error(f"Error decoding JSON: {e}")
                    except Exception as e:
                        logger.error(f"Error processing new data: {e}")

                await asyncio.sleep(1)

        except Exception as e:
            logger.error(f"Error in Redis listener: {e}")
            # Thử kết nối lại
            await asyncio.sleep(5)
            await self.start_redis_listener()

# Khởi tạo và chạy spider processor
async def main():
    processor = SpiderProcessor()
    await processor.start_redis_listener()

if __name__ == "__main__":
    asyncio.run(main())
