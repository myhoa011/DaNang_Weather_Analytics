import os
import sys
import json
import aiohttp
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import aiofiles
import pandas as pd
from filelock import FileLock
from dotenv import load_dotenv

sys.path.append(".")
from src.logger import logger

# Load environment variables
load_dotenv()

class DataIngestion:
    def __init__(self):
        """Initialize DataIngestion"""
        self.api_url = os.getenv('DB_API_URL')
        self.scheduler = AsyncIOScheduler()
        self.data_path = os.getenv('DATA_PATH', 'data')
        self.data_file = f"{self.data_path}/weather_data.json"
        self.processed_file = f"{self.data_path}/processed_data.json"
        self.session = None
        
        # Create the data directory if it does not exist
        os.makedirs(self.data_path, exist_ok=True)
        
        # Initialize files
        self._init_files()

    def _init_files(self):
        if not os.path.exists(self.processed_file):
            with open(self.processed_file, 'w') as f:
                json.dump({"last_processed_dt": 0}, f)

    async def load_weather_data(self):
        """Load weather data from file"""
        lock = FileLock(f"{self.data_file}.lock")
        
        try:
            with lock:
                if not os.path.exists(self.data_file):
                    logger.warning(f"Data file {self.data_file} not found")
                    return []

                async with aiofiles.open(self.data_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    if not content:
                        logger.warning("Data file is empty")
                        return []
                        
                    data = json.loads(content)
                    logger.info(f"Loaded {len(data)} weather records")
                    return data

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            return []
        except Exception as e:
            logger.error(f"Error loading weather data: {e}")
            return []

    @staticmethod
    def convert_to_vietnam_time(utc_timestamp: int) -> int:
        VIETNAM_OFFSET = 25200  # 7 hours * 3600 seconds
        return utc_timestamp + VIETNAM_OFFSET

    def handle_missing_data(self, weather_data: dict) -> dict:
        """
        Handle missing values using median from entire dataset
        """
        try:
            # Load all weather data
            with open(self.data_file, 'r') as f:
                all_data = json.load(f)
            
            # Extract all entries and convert to DataFrame
            all_entries = [entry.get("data", [{}])[0] for entry in all_data]
            df_all = pd.DataFrame(all_entries)
            
            # Create DataFrame for current entry
            df_current = pd.DataFrame([weather_data])

            # Define columns and their types
            column_types = {
                "temp": "float64",
                "pressure": "int64",
                "humidity": "int64",
                "clouds": "int64",
                "visibility": "int64",
                "wind_speed": "float64",
                "wind_deg": "int64"
            }

            # Calculate medians from all data and fill missing values
            for col, dtype in column_types.items():
                if col in df_all.columns:
                    # Convert all data to numeric for median calculation
                    df_all[col] = pd.to_numeric(df_all[col], errors='coerce')
                    # Calculate median from all data
                    median_value = df_all[col].median()
                    
                    # Convert and fill current entry
                    if col in df_current.columns:
                        df_current[col] = pd.to_numeric(df_current[col], errors='coerce')
                        df_current[col] = df_current[col].fillna(median_value)
                        
                        # Convert to correct type
                        if dtype == "int64":
                            df_current[col] = df_current[col].round().astype(dtype)
                        else:
                            df_current[col] = df_current[col].astype(dtype)

            logger.debug(f"Processed entry with medians from full dataset")
            return df_current.iloc[0].to_dict()

        except Exception as e:
            logger.error(f"Error handling missing data: {e}")
            logger.exception("Full traceback:")
            return weather_data

    def filter_data(self, raw_data):
        """Only filter necessary fields while preserving null values"""
        try:
            weather_data = raw_data.get("data", [{}])[0]
            utc_timestamp = weather_data.get("dt")
            vietnam_timestamp = self.convert_to_vietnam_time(utc_timestamp)
            
            filtered_data = {
                "dt": vietnam_timestamp,
                "temp": weather_data.get("temp"),
                "pressure": weather_data.get("pressure"),
                "humidity": weather_data.get("humidity"),
                "clouds": weather_data.get("clouds"),
                "visibility": weather_data.get("visibility"),
                "wind_speed": weather_data.get("wind_speed"),
                "wind_deg": weather_data.get("wind_deg")
            }

            return filtered_data

        except Exception as e:
            logger.error(f"Error filtering data: {e}")
            return None

    async def _load_processed_data(self):
        """
        Load the last processed timestamp from file
        """
        try:
            async with aiofiles.open(self.processed_file, 'r') as f:
                content = await f.read()
                return json.loads(content)
        except Exception as e:
            logger.error(f"Error loading processed data: {e}")
            return {"last_processed_dt": 0}

    async def _save_processed_data(self, data: dict):
        """
        Save the last processed timestamp to file
        """
        try:
            async with aiofiles.open(self.processed_file, 'w') as f:
                await f.write(json.dumps(data))
                await f.flush()
        except Exception as e:
            logger.error(f"Error saving processed data: {e}")
            raise

    async def send_to_api(self, raw_data_list: list, processed_data_list: list):
        """Send bulk data to API"""
        if self.session is None:
            self.session = aiohttp.ClientSession()

        try:
            if not self.api_url:
                raise ValueError("API URL is not set")

            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            logger.info(f"Sending bulk data with {len(raw_data_list)} entries")

            async with self.session.post(
                f"{self.api_url}/api/weather/bulk",
                json={
                    "raw_data_list": raw_data_list,
                    "processed_data_list": processed_data_list
                },
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Successfully saved {result['count']} entries")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to send bulk data: {response.status}, error: {error}")
                    return False

        except Exception as e:
            logger.error(f"Error sending bulk data to API: {e}")
            return False

    def handle_missing_data_bulk(self, weather_data_list: list) -> list:
        """
        Handle missing values for multiple entries using median from entire dataset
        
        Args:
            weather_data_list (list): List of weather data entries to process
            
        Returns:
            list: List of processed weather data entries with missing values filled
        """
        try:
            # Load all historical data for median calculation
            with open(self.data_file, 'r') as f:
                all_data = json.load(f)
            
            # Extract all entries and convert to DataFrame
            all_entries = [entry.get("data", [{}])[0] for entry in all_data]
            df_all = pd.DataFrame(all_entries)
            
            # Convert current entries to DataFrame
            df_current = pd.DataFrame(weather_data_list)

            # Define columns and their types
            column_types = {
                "temp": "float64",
                "pressure": "int64",
                "humidity": "int64",
                "clouds": "int64",
                "visibility": "int64",
                "wind_speed": "float64",
                "wind_deg": "int64"
            }

            # Calculate medians once for all columns
            medians = {}
            for col, dtype in column_types.items():
                if col in df_all.columns:
                    df_all[col] = pd.to_numeric(df_all[col], errors='coerce')
                    medians[col] = df_all[col].median()

            logger.debug(f"Calculated medians from {len(df_all)} historical entries")

            # Fill missing values for all current entries at once
            for col, dtype in column_types.items():
                if col in df_current.columns:
                    df_current[col] = pd.to_numeric(df_current[col], errors='coerce')
                    df_current[col] = df_current[col].fillna(medians.get(col, 0))
                    
                    if dtype == "int64":
                        df_current[col] = df_current[col].round().astype(dtype)
                    else:
                        df_current[col] = df_current[col].astype(dtype)

            logger.info(f"Processed {len(df_current)} entries with missing data")
            return df_current.to_dict('records')

        except Exception as e:
            logger.error(f"Error handling missing data in bulk: {e}")
            logger.exception("Full traceback:")
            return weather_data_list

    async def ingest(self, is_initial_run: bool = False):
        try:
            weather_data = await self.load_weather_data()
            if not weather_data:
                if is_initial_run:
                    logger.info("No weather data found during initial run")
                else:
                    logger.info("No weather data found during scheduled check")
                return

            # Get last processed timestamp
            processed_data = await self._load_processed_data()
            last_processed_dt = processed_data.get("last_processed_dt", 0)

            if is_initial_run:
                logger.info(f"Initial run - Last processed timestamp: {last_processed_dt}")
            else:
                logger.info(f"Checking for data newer than: {last_processed_dt}")

            # Filter only new data
            raw_data_list = []
            latest_dt = last_processed_dt

            for entry in weather_data:
                raw_data = self.filter_data(entry)
                if raw_data and raw_data["dt"] > last_processed_dt:
                    raw_data_list.append(raw_data)
                    latest_dt = max(latest_dt, raw_data["dt"])

            if raw_data_list:
                count = len(raw_data_list)
                if is_initial_run:
                    logger.info(f"Initial run - Found {count} entries to process")
                else:
                    logger.info(f"Found {count} new entries to process")

                processed_data_list = self.handle_missing_data_bulk(raw_data_list)
                success = await self.send_to_api(raw_data_list, processed_data_list)
                
                if success:
                    await self._save_processed_data({"last_processed_dt": latest_dt})
                    if is_initial_run:
                        logger.info(f"Initial run - Successfully processed {count} entries")
                    else:
                        logger.info(f"Successfully processed {count} new entries")
                else:
                    logger.error("Failed to send bulk data")
            else:
                if is_initial_run:
                    logger.info("Initial run - No new data to process")
                else:
                    logger.info("No new data to process")

        except Exception as e:
            if is_initial_run:
                logger.error(f"Error during initial ingestion: {e}")
            else:
                logger.error(f"Error during scheduled ingestion: {e}")
            logger.exception("Full traceback:")

    async def start(self):
        """Start the Weather Data Ingestion service"""
        try:
            logger.info("Starting Weather Data Ingestion service")
            
            # First run - process all existing data
            await self.ingest(is_initial_run=True)
            
            # Schedule future runs
            self.scheduler.add_job(
                self.ingest,
                'interval',
                minutes=1,
                id='weather_data_ingestion'
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
            logger.info("Weather Data Ingestion service stopped")
        except Exception as e:
            logger.error(f"Error stopping service: {e}")

async def main():
    service = DataIngestion()
    await service.start()

if __name__ == "__main__":
    asyncio.run(main()) 