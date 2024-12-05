import requests
import pandas as pd
from datetime import datetime
from typing import List, Dict

class ClusterToSpiderProcessor:
    def __init__(self, source_api_url: str, target_api_url: str):
        """
        Khởi tạo lớp ClusterToSpiderProcessor.

        :param source_api_url: URL API để lấy dữ liệu nguồn (`/api/data_cluster`).
        :param target_api_url: URL API để lưu dữ liệu (`/api/spider`).
        """
        self.source_api_url = source_api_url
        self.target_api_url = target_api_url
        self.dataframe = None
        self.processed_data = None
        self.label_to_season = {0: "Spring", 1: "Winter", 2: "Summer", 3: "Autumn"}

    def fetch_data(self):
        """Gọi API nguồn để lấy dữ liệu."""
        try:
            response = requests.get(self.source_api_url)
            if response.status_code != 200:
                raise Exception(f"Failed to fetch data: {response.status_code}, {response.text}")

            data = response.json()
            self.dataframe = pd.DataFrame(data)
            self.dataframe["date"] = pd.to_datetime(self.dataframe["date"])  # Chuyển đổi cột 'date' thành datetime
        except Exception as e:
            raise Exception(f"Error fetching data: {e}")

    def process_data(self):
        """Xử lý dữ liệu thành format phù hợp để gửi đến API `/api/spider`."""
        if self.dataframe is None:
            raise ValueError("No data fetched. Call fetch_data() first.")

        # Nhóm dữ liệu theo `custom_label` và `year`
        grouped_data = (
            self.dataframe.groupby(["custom_label", self.dataframe["date"].dt.year])
            .size()
            .reset_index(name="days")
        )

        # Thêm cột 'season' từ `custom_label`
        grouped_data["season"] = grouped_data["custom_label"].map(self.label_to_season)

        # Đổi tên cột `date` thành `year`
        grouped_data = grouped_data.rename(columns={"date": "year"})

        # Lưu kết quả đã xử lý
        self.processed_data = grouped_data

    def get_processed_data(self) -> List[Dict[str, any]]:
        """
        Trả về dữ liệu đã xử lý dưới dạng danh sách từ điển.

        :return: Danh sách từ điển (season, days, year).
        """
        if self.processed_data is None:
            raise ValueError("Data has not been processed. Call process_data() first.")

        return [
            {"season": row["season"], "days": int(row["days"]), "year": int(row["year"])}
            for _, row in self.processed_data.iterrows()
        ]

    def save_to_spider_api(self):
        """Gửi dữ liệu đã xử lý đến API `/api/spider`."""
        if self.processed_data is None:
            raise ValueError("Data has not been processed. Call process_data() first.")

        data_to_send = self.get_processed_data()

        try:
            response = requests.post(self.target_api_url, json=data_to_send)
            if response.status_code == 200:
                print(f"Success: {response.json()}")
            else:
                print(f"Failed to save data: {response.text}")
        except Exception as e:
            raise Exception(f"Error saving data to API: {e}")


# URL API
source_api_url = "http://localhost:8000/api/data_cluster"
target_api_url = "http://localhost:8000/api/spider"

# Sử dụng lớp ClusterToSpiderProcessor
processor = ClusterToSpiderProcessor(source_api_url, target_api_url)

# Thực hiện các bước xử lý và lưu dữ liệu
processor.fetch_data()         # Lấy dữ liệu từ API nguồn
processor.process_data()       # Xử lý dữ liệu
print(processor.get_processed_data())  # In dữ liệu đã xử lý
processor.save_to_spider_api() # Gửi dữ liệu đã xử lý đến API đích
