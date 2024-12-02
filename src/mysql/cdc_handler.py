from pymysqlreplication import BinLogStreamReader
from pymysqlreplication.row_event import (
    WriteRowsEvent,
    UpdateRowsEvent,
    DeleteRowsEvent
)
import asyncio
from datetime import datetime
import os
import sys

sys.path.append(".")
from src.logger import logger

class CDCHandler:
    def __init__(self, pool):
        """Initialize CDC handler with database pool"""
        self.mysql_settings = {
            "host": os.getenv('DB_HOST'),
            "port": int(os.getenv('DB_PORT')),
            "user": os.getenv('DB_USER'),
            "passwd": os.getenv('DB_PASSWORD')
        }
        self.pool = pool
        self.tables_to_watch = ['processed_weather_data', 'raw_weather_data']
        self.is_running = False

    async def handle_change(self, table: str, data: dict, change_type: str):
        """Handle database changes"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    if table == 'processed_weather_data':
                        # Insert into changes table
                        query = """
                        INSERT INTO processed_weather_changes 
                        (dt, temp, pressure, humidity, clouds, visibility, wind_speed, wind_deg)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        values = (
                            data['dt'],
                            data['temp'],
                            data['pressure'],
                            data['humidity'],
                            data['clouds'],
                            data['visibility'],
                            data['wind_speed'],
                            data['wind_deg']
                        )
                        await cur.execute(query, values)
                        logger.info(f"CDC: Recorded {change_type} for dt={data['dt']}")

    async def process_binlog_event(self, event):
        """Process individual binlog events"""
        try:
            if isinstance(event, (WriteRowsEvent, UpdateRowsEvent, DeleteRowsEvent)):
                table = event.table
                schema = event.schema

                if schema == 'weather_db' and table in self.tables_to_watch:
                    if isinstance(event, WriteRowsEvent):
                        for row in event.rows:
                            await self.handle_change(table, row['values'], 'INSERT')
                    elif isinstance(event, UpdateRowsEvent):
                        for row in event.rows:
                            await self.handle_change(table, row['after_values'], 'UPDATE')
                    elif isinstance(event, DeleteRowsEvent):
                        for row in event.rows:
                            await self.handle_change(table, row['values'], 'DELETE')

        except Exception as e:
            logger.error(f"CDC: Error processing binlog event: {e}")

    async def start_streaming(self):
        """Start streaming binlog events"""
        try:
            if self.is_running:
                logger.warning("CDC: Already running")
                return

            self.is_running = True
            logger.info("CDC: Starting binlog streaming...")
            
            stream = BinLogStreamReader(
                connection_settings=self.mysql_settings,
                server_id=100,
                only_events=[WriteRowsEvent, UpdateRowsEvent, DeleteRowsEvent],
                only_schemas=['weather_db'],
                only_tables=self.tables_to_watch,
                resume_stream=True,
                blocking=False
            )

            while self.is_running:
                for event in stream:
                    if not self.is_running:
                        break
                    await self.process_binlog_event(event)
                await asyncio.sleep(1)  # Prevent CPU overload

        except Exception as e:
            logger.error(f"CDC: Error in binlog streaming: {e}")
            raise
        finally:
            stream.close()
            self.is_running = False
            logger.info("CDC: Streaming stopped")

    def stop_streaming(self):
        """Stop streaming binlog events"""
        self.is_running = False
        logger.info("CDC: Stopping streaming...") 