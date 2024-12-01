import asyncio
import aiohttp
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from math import pi
from dotenv import load_dotenv
from src.logger import logger
import os
from typing import List, Dict, Any
from fastapi import HTTPException

load_dotenv()


class Spider:
    def __init__(self):
        self.db_api_url = os.getenv("DB_API_URL")
        self.session = None
        self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

    def process_data_for_spider_chart(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Xử lý dữ liệu để chuẩn bị cho việc vẽ Spider Chart cho 2 năm gần nhất.

        Args:
            df (pd.DataFrame): Dữ liệu thời tiết đã xử lý, bao gồm các cột:
                - 'dt': Ngày (datetime).
                - 'temp': Nhiệt độ (float).
                - 'pressure': Áp suất (float).
                - 'humidity': Độ ẩm (float).
                - 'clouds': Độ bao phủ mây (float).
                - 'wind_speed': Tốc độ gió (float).

        Returns:
            pd.DataFrame: Dữ liệu trung bình cho 2 năm gần nhất với các cột:
                - 'year': Năm.
                - 'temp', 'pressure', 'humidity', 'clouds', 'wind_speed': Các giá trị trung bình cho từng năm.
        """
        try:
            # Bước 1: Thêm cột 'year' từ cột 'dt'
            if 'dt' not in df.columns:
                raise ValueError("Dữ liệu đầu vào không chứa cột 'dt'.")

            df['year'] = pd.to_datetime(df['dt']).dt.year

            # Bước 2: Lấy danh sách 2 năm gần nhất
            latest_years = sorted(df['year'].unique())[-2:]
            if len(latest_years) < 2:
                logger.warning("Không đủ dữ liệu cho 2 năm gần nhất. Sử dụng tất cả các năm có sẵn.")

            # Bước 3: Lọc dữ liệu cho 2 năm gần nhất
            df_latest_years = df[df['year'].isin(latest_years)]

            # Bước 4: Tính trung bình các thông số thời tiết cho từng năm
            features = ['temp', 'pressure', 'humidity', 'clouds', 'wind_speed']
            missing_features = [col for col in features if col not in df.columns]
            if missing_features:
                raise ValueError(f"Các cột sau đang thiếu trong dữ liệu: {missing_features}")

            yearly_data = df_latest_years.groupby('year')[features].mean().reset_index()

            logger.info(f"Processed data for Spider Chart:\n{yearly_data}")
            return yearly_data

        except Exception as e:
            logger.error(f"Error processing data for Spider Chart: {e}")
            raise HTTPException(status_code=500, detail="Error processing data for Spider Chart.")

    def plot_spider_charts(self, yearly_data: pd.DataFrame):
        """
        Vẽ biểu đồ Spider Chart từ dữ liệu trung bình của 2 năm gần nhất.

        Args:
            yearly_data (pd.DataFrame): Dữ liệu đã xử lý, bao gồm các cột:
                - 'year': Năm.
                - 'temp', 'pressure', 'humidity', 'clouds', 'wind_speed': Các giá trị trung bình.

        Returns:
            None: Hiển thị biểu đồ.
        """
        try:
            # Kiểm tra dữ liệu đầu vào
            if yearly_data.empty:
                raise ValueError("Dữ liệu đầu vào để vẽ Spider Chart là rỗng.")
            
            # Lấy danh sách các năm và các thông số
            years = yearly_data['year'].tolist()
            categories = ['temp', 'pressure', 'humidity', 'clouds', 'wind_speed']
            num_vars = len(categories)

            # Chuẩn bị góc cho các biểu đồ
            angles = [n / float(num_vars) * 2 * pi for n in range(num_vars)]
            angles += angles[:1]  # Đóng vòng tròn

            # Tạo hình và các trục
            fig, axes = plt.subplots(1, len(years), figsize=(12, 6), subplot_kw={'polar': True})
            fig.suptitle("Spider Charts for 2 Latest Years", fontsize=16, y=1.05)

            # Vẽ biểu đồ cho từng năm
            for i, year in enumerate(years):
                values = yearly_data[yearly_data['year'] == year][categories].values.flatten().tolist()
                values += values[:1]  # Đóng vòng tròn

                ax = axes[i] if len(years) > 1 else axes  # Xử lý trường hợp chỉ có 1 năm
                ax.set_theta_offset(pi / 2)
                ax.set_theta_direction(-1)
                ax.set_xticks(angles[:-1])
                ax.set_xticklabels(categories)

                # Plot dữ liệu
                ax.plot(angles, values, linewidth=2, linestyle='solid', label=f"Year {year}")
                ax.fill(angles, values, alpha=0.4)

                # Thêm tiêu đề cho từng biểu đồ
                ax.set_title(f"Year {year}", fontsize=12, pad=20)

            plt.tight_layout()
            plt.show()
            logger.info("Spider charts for the 2 latest years generated successfully.")

        except Exception as e:
            logger.error(f"Error generating spider charts: {e}")
            raise HTTPException(status_code=500, detail="Error generating spider charts.")


async def main():
    """
    Pipeline chính:
    - Kết nối API để lấy dữ liệu thời tiết.
    - Xử lý dữ liệu để chuẩn bị cho Spider Chart.
    - Vẽ biểu đồ Spider Chart cho 2 năm gần nhất.
    """
    try:
        spider = Spider()
        
        # Tạo kết nối HTTP session
        spider.session = aiohttp.ClientSession()

        # Lấy dữ liệu từ API
        async with spider.session.get(f"{spider.db_api_url}/api/weather") as response:
            if response.status == 200:
                data = await response.json()
                df = pd.DataFrame(data)

                # Kiểm tra dữ liệu đầu vào
                if df.empty:
                    logger.error("Dữ liệu từ API là rỗng.")
                    raise HTTPException(status_code=204, detail="No data retrieved from API.")

                # Đảm bảo cột 'dt' được định dạng đúng
                df['dt'] = pd.to_datetime(df['dt'], errors='coerce')

                # Xử lý dữ liệu để vẽ Spider Chart
                processed_data = spider.process_data_for_spider_chart(df)

                # Vẽ biểu đồ Spider Chart
                spider.plot_spider_charts(processed_data)
            else:
                error_detail = await response.text()
                logger.error(f"Failed to fetch data from API. Status: {response.status}, Error: {error_detail}")
                raise HTTPException(status_code=response.status, detail="Error fetching weather data.")

    except Exception as e:
        logger.error(f"Error in main pipeline: {e}")
    finally:
        # Đóng HTTP session
        if spider.session:
            await spider.session.close()

if __name__ == "__main__":
    asyncio.run(main())
