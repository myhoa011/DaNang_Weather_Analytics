from dotenv import load_dotenv
import os
import json
from datetime import datetime, timedelta, timezone
import aiohttp
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import aiofiles
import sys

sys.path.append(".")
from src.logger import logger

# Load environment variables
load_dotenv()

# Load constants from environment variables
API_KEY = os.getenv('API_KEY')
BASE_URL = os.getenv('BASE_URL')
LAT = float(os.getenv('LAT'))
LON = float(os.getenv('LON'))
MAX_API_CALLS_PER_DAY = int(os.getenv('MAX_API_CALLS_PER_DAY'))
MAX_REQUESTS_PER_MINUTE = int(os.getenv('MAX_REQUESTS_PER_MINUTE'))
MAX_RETRIES = int(os.getenv('MAX_RETRIES'))

class WeatherCrawler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.total_calls_today = 0
        self.calls_in_current_minute = 0
        self.minute_start_time = datetime.now()
        self.data_dir = "data"
        self.data_file = os.path.join(self.data_dir, "weather_data.json")
        self.timestamp_file = os.path.join(self.data_dir, "last_timestamp.json")
        self.session = None
        self._init_data_file()
        self._init_timestamp_file()

    def _init_data_file(self):
        """Initialize data directory and file if they don't exist"""
        # Create data directory if it does not exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Create JSON file if it does not exist
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump([], f)

    def _init_timestamp_file(self):
        """Initialize timestamp file if it doesn't exist"""
        if not os.path.exists(self.timestamp_file):
            with open(self.timestamp_file, 'w') as f:
                # Set initial timestamp to 2020-12-31 17:00:00
                initial_date = datetime(2020, 12, 31, 17, 0, 0, tzinfo=timezone.utc)
                initial_timestamp = int(initial_date.timestamp())
                json.dump({"last_timestamp": initial_timestamp}, f)
                logger.info(f"Initialized timestamp file with date: {initial_date.strftime('%Y-%m-%d %H:%M:%S')}")

    async def load_weather_data(self):
        """Load existing weather data"""
        try:
            async with aiofiles.open(self.data_file, 'r') as file:
                content = await file.read()
                data = json.loads(content)
                logger.info(f"Loaded {len(data)} existing records")
                return data
        except FileNotFoundError:
            logger.warning(f"Data file not found: {self.data_file}")
            return []
        except json.JSONDecodeError as e:
            # Backup corrupted file instead of losing data
            backup_file = f"{self.data_file}.corrupted"
            logger.error(f"JSON decode error. Backing up to {backup_file}")
            os.rename(self.data_file, backup_file)
            return []

    async def save_weather_data(self, data):
        """Save raw weather data to JSON file"""
        backup_file = None
        try:
            # Load existing data
            weather_data = await self.load_weather_data()
            
            # Check duplicate before saving
            new_timestamp = data['data'][0]['dt']
            exists = any(
                entry.get('data', [{}])[0].get('dt') == new_timestamp 
                for entry in weather_data
            )
            
            if exists:
                logger.info(f"Data for timestamp {new_timestamp} already exists, skipping save...")
                return True
            
            # Create backup before saving new data
            if os.path.exists(self.data_file):
                backup_file = f"{self.data_file}.bak"
                async with aiofiles.open(self.data_file, 'r') as src, \
                          aiofiles.open(backup_file, 'w') as dst:
                    content = await src.read()
                    await dst.write(content)
            
            # Add new data and sort by timestamp
            weather_data.append(data)
            weather_data.sort(key=lambda x: x['data'][0]['dt'])
            
            # Save to file
            async with aiofiles.open(self.data_file, 'w') as file:
                await file.write(json.dumps(weather_data, indent=4))
            
            # Remove backup if save successful    
            if os.path.exists(backup_file):
                os.remove(backup_file)
            
            logger.info(f"Successfully saved new data. Total records: {len(weather_data)}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving weather data: {e}")
            # Restore from backup if available
            if os.path.exists(backup_file):
                os.replace(backup_file, self.data_file)
                logger.info("Restored data from backup")
            return False

    async def init_session(self):
        """Initialize aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()

    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None
            
    @staticmethod
    def get_historical_timestamp():
        """Get timestamp for historical data (previous hour)"""
        now = datetime.now()
        previous_hour = now - timedelta(hours=1)
        return int(previous_hour.replace(minute=0, second=0, microsecond=0).timestamp())

    @staticmethod
    def get_current_timestamp():
        """Get timestamp for current hour"""
        now = datetime.now()
        return int(now.replace(minute=0, second=0, microsecond=0).timestamp())

    async def fetch_weather_data(self, timestamp):
        retries = 0
        while retries < MAX_RETRIES:
            try:
                await self.init_session()
                params = {
                    "lat": LAT,
                    "lon": LON,
                    "dt": timestamp,
                    "appid": API_KEY
                }

                async with self.session.get(BASE_URL, params=params) as response:
                    if response.status == 429:  # Too Many Requests
                        logger.warning("API rate limit reached. Sleeping for 1 minute...")
                        await asyncio.sleep(60)
                        continue

                    response.raise_for_status()
                    data = await response.json()
                    logger.info(f"Successfully fetched weather data for timestamp: {timestamp}")
                    
                    # Only save if fetch was successful
                    if data and 'data' in data and data['data']:
                        await self.save_weather_data(data)
                        return data
                    else:
                        logger.error(f"Invalid data format for timestamp: {timestamp}")
                        return None

            except aiohttp.ClientError as http_err:
                logger.error(f"HTTP error occurred: {http_err}")
                if getattr(http_err, 'status', None) == 429:
                    logger.warning("API rate limit hit. Sleeping for 1 minute...")
                    await asyncio.sleep(60)
                else:
                    retries += 1
                    logger.warning(f"Retrying... ({retries}/{MAX_RETRIES})")
                    await asyncio.sleep(5)

    async def handle_rate_limits(self):
        """Handle API rate limits"""
        self.calls_in_current_minute += 1
        self.total_calls_today += 1

        if self.calls_in_current_minute >= MAX_REQUESTS_PER_MINUTE:
            elapsed_time = (datetime.now() - self.minute_start_time).total_seconds()
            if elapsed_time < 60:
                sleep_time = 60 - elapsed_time
                logger.info(f"Sleeping for {sleep_time} seconds to respect rate limit...")
                await asyncio.sleep(sleep_time)
            self.calls_in_current_minute = 0
            self.minute_start_time = datetime.now()

        if self.total_calls_today >= MAX_API_CALLS_PER_DAY:
            logger.warning("Daily API call limit reached. Waiting until reset...")
            # Wait until midnight
            tomorrow = datetime.now() + timedelta(days=1)
            tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
            wait_seconds = (tomorrow - datetime.now()).total_seconds()
            await asyncio.sleep(wait_seconds)
            self.total_calls_today = 0

    async def crawl_historical_data(self):
        """Crawl historical weather data until the current time"""
        last_timestamp = await self.load_last_timestamp()
        current_timestamp = self.get_historical_timestamp()

        logger.info("Starting to crawl historical weather data...")

        # Load existing data to check for duplicates
        weather_data = await self.load_weather_data()
        existing_timestamps = set()
        
        # Lấy tất cả timestamps từ dữ liệu hiện có
        for entry in weather_data:
            if isinstance(entry, dict) and 'data' in entry and entry['data']:
                timestamp = entry['data'][0].get('dt')
                if timestamp:
                    existing_timestamps.add(int(timestamp))

        while last_timestamp < current_timestamp:
            if last_timestamp in existing_timestamps:
                logger.info(f"Data for timestamp {last_timestamp} already exists, skipping...")
                last_timestamp += 3600  # Tăng timestamp sau khi kiểm tra
                continue

            logger.info(f"Fetching weather data for timestamp: {last_timestamp}")
            data = await self.fetch_weather_data(last_timestamp)
            if data:
                await self.save_last_timestamp(last_timestamp)
                logger.info(f"Successfully saved data for timestamp: {last_timestamp}")
                existing_timestamps.add(last_timestamp)
            else:
                logger.error(f"Failed to fetch data for timestamp: {last_timestamp}")

            last_timestamp += 3600  # Tăng timestamp sau khi fetch
            await self.handle_rate_limits()

        logger.info("Finished crawling historical data.")

    @staticmethod
    def get_current_hour_timestamp():
        now = datetime.now()
        return int(now.replace(minute=0, second=0, microsecond=0).timestamp())

    @staticmethod
    def get_previous_hour_timestamp():
        now = datetime.now()
        previous_hour = now - timedelta(hours=1)
        return int(previous_hour.replace(minute=0, second=0, microsecond=0).timestamp())

    async def crawl_current_hour(self):
        current_timestamp = self.get_current_hour_timestamp()
        
        # Kiểm tra dữ liệu đã tồn tại chưa
        weather_data = await self.load_weather_data()
        exists = any(
            entry.get('data', [{}])[0].get('dt') == current_timestamp 
            for entry in weather_data
        )
        
        if exists:
            logger.info(f"Data for timestamp {current_timestamp} already exists, skipping crawl...")
            return
        
        logger.info(f"Crawling data for current hour: {current_timestamp}")
        await self.fetch_weather_data(current_timestamp)

    async def start(self):
        """Main function to start crawling and scheduling"""
        try:
            await self.crawl_historical_data()  # Crawl historical data first
            
            now = datetime.now()
            if now.minute < 5:
                # Nếu chưa đến phút thứ 5, cào dữ liệu của giờ trước
                previous_timestamp = self.get_previous_hour_timestamp()
                await self.fetch_weather_data(previous_timestamp)
            elif now.minute > 5:
                # Nếu đã qua phút thứ 5, cào dữ liệu của giờ hiện tại
                await self.crawl_current_hour()
            # Nếu đúng phút thứ 5, không cần làm gì vì hourly_job sẽ chạy

            self.start_scheduler()
            
            # Giữ chương trình chạy
            while True:
                await asyncio.sleep(3600)  # Đợi 1 giờ
                
        except asyncio.CancelledError:
            logger.info("Crawler is shutting down...")
        except Exception as e:
            logger.error(f"Error while running crawler: {e}")
        finally:
            await self.close_session()
            if self.scheduler.running:
                self.scheduler.shutdown()

    async def hourly_job(self):
        """Job to fetch current weather data every hour"""
        try:
            current_timestamp = self.get_current_hour_timestamp()
            
            logger.info(f"Fetching weather data for current timestamp: {current_timestamp}")
            data = await self.fetch_weather_data(current_timestamp)
            if data:
                await self.save_last_timestamp(current_timestamp)
                logger.info("Hourly weather data fetch completed successfully")
            else:
                logger.error("Failed to fetch hourly weather data")

            await self.handle_rate_limits()

        except Exception as e:
            logger.error(f"Error in hourly job: {e}")

    async def reset_daily_counter(self):
        """Reset the daily API call counter"""
        self.total_calls_today = 0
        logger.info("Reset daily API call counter")

    def start_scheduler(self):
        """Start the scheduler for hourly jobs"""
        # Xóa tất cả các job cũ nếu có
        self.scheduler.remove_all_jobs()
        
        # Thêm job mới
        self.scheduler.add_job(
            self.hourly_job,
            CronTrigger(minute='5'),   # Run at minute 5 of every hour
            id='weather_crawler_hourly'
        )
        logger.info("Added hourly job to scheduler")

        self.scheduler.add_job(
            self.reset_daily_counter,
            CronTrigger(hour='0', minute='0'),  # Run at midnight
            id='reset_daily_counter'
        )
        logger.info("Added daily counter reset job to scheduler")

        logger.info("Starting the scheduler...")
        self.scheduler.start()

    async def load_last_timestamp(self):
        """Load the last processed timestamp"""
        async with aiofiles.open(self.timestamp_file, 'r') as file:
            content = await file.read()
            data = json.loads(content)
            return data.get("last_timestamp")

    async def save_last_timestamp(self, timestamp):
        """Save the last processed timestamp"""
        try:
            async with aiofiles.open(self.timestamp_file, 'w') as file:
                await file.write(json.dumps({"last_timestamp": timestamp}))
            logger.info(f"Saved last timestamp: {timestamp}")
            return True
        except Exception as e:
            logger.error(f"Error saving last timestamp: {e}")
            return False

async def main():
    crawler = WeatherCrawler()
    try:
        await crawler.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt. Shutting down...")
    finally:
        await crawler.close_session()
        if crawler.scheduler.running:
            crawler.scheduler.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
