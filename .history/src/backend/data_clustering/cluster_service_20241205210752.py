<<<<<<< HEAD
import asyncio
import aiohttp
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from fastapi import HTTPException
from dotenv import load_dotenv
from src.logger import logger
from aiohttp import ClientSession, ClientResponseError, ServerDisconnectedError
import os
from typing import List, Dict, Any, Tuple
from src.backend.data_clustering.weather_model import ClusterData

load_dotenv()

class WeatherCluster:
    def __init__(self):
        """
        Khởi tạo WeatherCluster với các thành phần:
        - KMeans: Thuật toán phân cụm.
        - StandardScaler: Chuẩn hóa dữ liệu.
        """
        self.db_api_url = os.getenv("DB_API_URL")
        self.session = None
        self.scaler = StandardScaler()
        self.kmeans_model = KMeans(n_clusters=4, random_state=42)
        self.temperature_model = RandomForestRegressor(n_estimators=100, random_state=42)  # Mô hình hồi quy
        self.season_model = RandomForestClassifier(n_estimators=100, random_state=42)  # Mô hình phân loại mùa
        self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

    async def connect(self):
        if self.session is None or getattr(self.session, 'closed', True):
            self.session = aiohttp.ClientSession()

    async def close(self):
        if self.session is not None and not self.session.closed:
            await self.session.close()

    async def get_weather_data(self) -> pd.DataFrame:
        try:
            await self.connect()
            
            # Logging statements
            logger.info(f"Session: {self.session}")
            logger.info(f"Session.get type: {type(self.session.get)}")

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            async with self.session.get(f"{self.db_api_url}/api/weather", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if not data:
                        logger.warning("No weather data retrieved.")
                        raise HTTPException(status_code=204, detail="No content retrieved from API.")
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} weather records.")
                    return df
                else:
                    error = await response.text()
                    raise HTTPException(status_code=response.status, detail=f"API error: {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise HTTPException(status_code=500, detail="Error fetching weather data.")
        # finally:
        #     await self.close()

    async def get_all_data_cluster(self) -> pd.DataFrame:
        try:
            await self.connect()
            # Logging statements
            logger.info(f"Session: {self.session}")
            logger.info(f"Session.get type: {type(self.session.get)}")

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            async with self.session.get(f"{self.db_api_url}/api/data_cluster", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if not data:
                        logger.warning("No cluster data retrieved.")
                        raise HTTPException(status_code=204, detail="No content retrieved from API.")
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} cluster records.")
                    columns = ['date', 'temp', 'custom_label']
                    if columns:
                        missing_columns = [col for col in columns if col not in df.columns]
                        if missing_columns:
                            logger.warning(f"Missing columns in API response: {missing_columns}")
                        df = df[columns]
                    return df
                else:
                    error = await response.text()
                    raise HTTPException(status_code=response.status, detail=f"API error: {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise HTTPException(status_code=500, detail="Error fetching cluster data.")
        finally:
            await self.close()

    async def get_centroids(self) -> pd.DataFrame:
        """
        Fetch centroid data from the API and return it as a pandas DataFrame.
        """
        try:
            await self.connect()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            url = f"{self.db_api_url}/api/get_centroids"
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if not data:
                        logger.warning("No centroid data retrieved.")
                        raise ValueError("No centroid data retrieved.")
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} centroid records.")
                    return df
                else:
                    error_text = await response.text()
                    error_msg = f"API error {response.status}: {error_text}"
                    logger.error(error_msg)
                    raise Exception(error_msg)
        except Exception as e:
            logger.exception(f"Error fetching centroids: {e}")
            raise
        finally:
            await self.close()

    async def process_data(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty.")

            df["date"] = pd.to_datetime(df["dt"], unit="s")
            df["month"] = df["date"].dt.month
            df["temp"] = df["temp"] - 273.15

            logger.info("Weather data processed successfully.")
            return df
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            raise HTTPException(status_code=500, detail="Error processing weather data.")

    def cluster_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty for clustering.")

            df["scaled_temp"] = self.scaler.fit_transform(df[["temp"]])
            df["kmean_label"] = self.kmeans_model.fit_predict(df[["scaled_temp"]])

            centroids = self.kmeans_model.cluster_centers_
            centroid_df = pd.DataFrame(
                centroids, columns=["scaled_temp"], index=[f"cluster_{i}" for i in range(len(centroids))]
            )
            centroid_df["temp"] = self.scaler.inverse_transform(centroid_df[["scaled_temp"]])
            centroid_df.reset_index(inplace=True)
            centroid_df.rename(columns={"index": "cluster_name"}, inplace=True)

            logger.info(f"Weather data clustered successfully. Centroids:\n{centroid_df}")
            return df, centroid_df
        except Exception as e:
            logger.error(f"Error clustering data: {e}")
            raise HTTPException(status_code=500, detail="Error clustering weather data.")

    def customize_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Tùy chỉnh nhãn cụm dựa trên tháng để phân thành 4 mùa:
        - Mùa Xuân: Tháng 3 - 5.
        - Mùa Hạ: Tháng 6 - 8.
        - Mùa Thu: Tháng 9 - 11.
        - Mùa Đông: Tháng 12 - 2.

        Args:
            df (pd.DataFrame): Dữ liệu với nhãn cụm.

        Returns:
            pd.DataFrame: Dữ liệu với nhãn cụm tùy chỉnh.
        """
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty for customizing labels.")

            def assign_season(month):
                if 3 <= month <= 5:
                    return 0  # Mùa Xuân
                elif 6 <= month <= 8:
                    return 1  # Mùa Hạ
                elif 9 <= month <= 11:
                    return 2  # Mùa Thu
                else:
                    return 3  # Mùa Đông

            df["custom_label"] = df["month"].apply(assign_season)
            logger.info("Labels customized successfully.")
            return df
        except Exception as e:
            logger.error(f"Error customizing labels: {e}")
            raise HTTPException(status_code=500, detail="Error customizing labels.")

    def plot_temperature(self, df: pd.DataFrame):
        """
        Vẽ biểu đồ nhiệt độ theo thời gian.

        Args:
            df (pd.DataFrame): Dữ liệu đã xử lý và phân cụm.
        """
        try:
            plt.figure(figsize=(14, 7))
            colors = ['green', 'orange', 'brown', 'blue']
            seasons = ['Spring', 'Summer', 'Autumn', 'Winter']

            for season_label, color, season_name in zip(range(4), colors, seasons):
                season_data = df[df["custom_label"] == season_label]
                plt.scatter(season_data["date"], season_data["temp"], label=season_name, color=color, s=10)

            plt.title("Temperature Over Time by Season")
            plt.xlabel("Date")
            plt.ylabel("Temperature (°C)")
            plt.legend()
            plt.grid()
            plt.show()
            logger.info("Temperature plot by season generated successfully.")
        except Exception as e:
            logger.error(f"Error plotting temperature: {e}")

    async def save_centroids(self, centroids: List[Dict[str, Any]]) -> bool:
        """
        Lưu centroids vào cơ sở dữ liệu.

        Args:
            centroids (List[Dict[str, Any]]): Centroids đã serialize.

        Returns:
            bool: Trạng thái thành công hay thất bại.
        """
        try:
            await self.connect()

            delete_url = f"{self.db_api_url}/api/centroids"
            insert_url = f"{self.db_api_url}/api/centroids"
            headers = {"Content-Type": "application/json"}

            async with self.session.delete(delete_url, headers=headers) as delete_response:
                if delete_response.status != 200:
                    logger.warning(f"Failed to delete old centroids: {delete_response.status}")
                    return False

            async with self.session.post(insert_url, json=centroids, headers=headers) as insert_response:
                if insert_response.status == 200:
                    logger.info("Centroids saved successfully.")
                    return True
                else:
                    error = await insert_response.text()
                    logger.error(f"Failed to save centroids: {error}")
                    return False
        except Exception as e:
            logger.error(f"Error saving centroids: {e}")
            return False
        finally:
            await self.close()

    async def save_data_cluster(self, cluster_data: List[Dict[str, Any]]) -> bool:
        """
        Xóa dữ liệu cũ và lưu dữ liệu phân cụm mới vào cơ sở dữ liệu thông qua API.
        
        Args:
            cluster_data (List[Dict[str, Any]]): Dữ liệu phân cụm đã được serialize.
        
        Returns:
            bool: Trạng thái thành công hay thất bại.
        """
        try:
            await self.connect()

            # Xóa tất cả dữ liệu cũ
            delete_url = f"{self.db_api_url}/api/delete_all_data"
            delete_headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            async with self.session.delete(delete_url, headers=delete_headers) as delete_response:
                if delete_response.status == 200:
                    logger.info("Successfully deleted old cluster data.")
                else:
                    delete_error = await delete_response.text()
                    logger.error(f"Failed to delete old cluster data: {delete_response.status}, error: {delete_error}")
                    return False
            
            if self.session is None:
                await self.connect()

            # Thêm dữ liệu mới
            insert_url = f"{self.db_api_url}/api/cluster_data/bulk"
            insert_headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            async with self.session.post(insert_url, json=cluster_data, headers=insert_headers) as insert_response:
                if insert_response.status == 200:
                    result = await insert_response.json()
                    logger.info(f"Successfully saved {result['count']} cluster data.")
                    return True
                else:
                    insert_error = await insert_response.text()
                    logger.error(f"Failed to save cluster data: {insert_response.status}, error: {insert_error}")
                    return False

        except Exception as e:
            logger.error(f"Error saving cluster data: {e}")
            return False
        finally:
            await self.close()

    @staticmethod
    def serialize_cluster_data(cluster_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Chuyển đổi danh sách các bản ghi phân cụm thành dạng serializable để lưu vào cơ sở dữ liệu.

        Args:
            cluster_data (List[Dict[str, Any]]): Danh sách các bản ghi phân cụm.

        Returns:
            List[Dict[str, Any]]: Dữ liệu đã serialize.
        """
        try:
            serialized_data = [
                {
                    "dt": record["dt"],
                    "temp": record["temp"],
                    "pressure": record["pressure"],
                    "humidity": record["humidity"],
                    "clouds": record["clouds"],
                    "visibility": record["visibility"],
                    "wind_speed": record["wind_speed"],
                    "wind_deg": record["wind_deg"],
                    "date": record["date"].isoformat() if isinstance(record["date"], pd.Timestamp) else record["date"],
                    "month": record["month"],
                    "scaled_temp": record["scaled_temp"],
                    "kmean_label": record["kmean_label"],
                    "custom_label": record["custom_label"],
                }
                for record in cluster_data
            ]
            logger.info(f"Serialized {len(serialized_data)} records for database insertion.")
            return serialized_data
        except Exception as e:
            logger.error(f"Error serializing cluster data: {e}")
            raise HTTPException(status_code=500, detail="Error serializing cluster data.")

    @staticmethod
    def serialize_centroids(centroids: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Serialize centroids for database insertion.

        Args:
            centroids (List[Dict[str, Any]]): Danh sách centroids.

        Returns:
            List[Dict[str, Any]]: Dữ liệu đã serialize.
        """
        try:
            serialized_data = [
                {
                    "cluster_name": record["cluster_name"],
                    "temp": float(record["temp"]),
                    "scaled_temp": float(record["scaled_temp"]),
                }
                for record in centroids
            ]
            logger.info(f"Serialized {len(serialized_data)} centroids for database insertion.")
            return serialized_data
        except Exception as e:
            logger.error(f"Error serializing centroids: {e}")
            raise HTTPException(status_code=500, detail="Error serializing centroids.")

async def main():
    """
    Main pipeline:
    - Fetch weather data.
    - Process and cluster data.
    - Serialize and save centroids and cluster data.
    """
    cluster = WeatherCluster()
    await cluster.connect()
    try:
        # Step 1: Fetch data
        weather_data = await cluster.get_weather_data()

        # Step 2: Process data
        processed_data = await cluster.process_data(weather_data)

        # Step 3: Perform clustering
        clustered_data, centroids = cluster.cluster_data(processed_data)
        print(clustered_data.head())

        # Step 4: Customize labels
        customized_data = cluster.customize_labels(clustered_data)
        
        cluster.plot_temperature(processed_data)

        # Step 5: Serialize and save centroids
        centroids_serialized =  cluster.serialize_centroids(centroids.to_dict("records"))
        success = await cluster.save_centroids(centroids_serialized)
        if success:
            logger.info("centroids saved successfully.")
        else:
            logger.error("Failed to save centroids to database.")

        # Step 6: Serialize and save clustered data
        cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
        
        # Save cluster data
        cluster_success = await cluster.save_data_cluster(cluster_data_serialized)
        if cluster_success:
            logger.info("Clustered data saved successfully.")
        else:
            logger.error("Failed to save clustered data to database.")
    finally:
        await cluster.close()


if __name__ == "__main__":
    asyncio.run(main())
=======
import asyncio
import aiohttp
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from dotenv import load_dotenv
from src.logger import logger
import os
from typing import List, Dict, Any, Tuple

load_dotenv()

class WeatherCluster:
    def __init__(self):
        """
        Khởi tạo WeatherCluster với các thành phần:
        - KMeans: Thuật toán phân cụm.
        - StandardScaler: Chuẩn hóa dữ liệu.
        """
        self.db_api_url = os.getenv("DB_API_URL")
        self.session = None
        self.scaler = StandardScaler()
        self.kmeans_model = KMeans(n_clusters=4, random_state=42)
        self.temperature_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.season_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

    async def connect(self):
        if self.session is None or getattr(self.session, 'closed', True):
            self.session = aiohttp.ClientSession()

    async def close(self):
        if self.session is not None and not self.session.closed:
            await self.session.close()

    async def get_weather_data(self) -> pd.DataFrame:
        try:
            await self.connect()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            async with self.session.get(f"{self.db_api_url}/api/weather", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if not data:
                        logger.warning("No weather data retrieved.")
                        raise Exception("No content retrieved from API.")
                    df = pd.DataFrame(data)
                    logger.info(f"Retrieved {len(df)} weather records.")
                    return df
                else:
                    error = await response.text()
                    raise Exception(f"API error: {error}")
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            raise
        finally:
            await self.close()

    async def process_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Xử lý dữ liệu thời tiết:
        - Chuyển đổi cột thời gian.
        - Thêm cột tháng.
        - Thay thế giá trị thiếu bằng giá trị trung bình hoặc gần nhất.

        Args:
            df (pd.DataFrame): Dữ liệu gốc từ API.

        Returns:
            pd.DataFrame: Dữ liệu đã xử lý.
        """
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty.")

            df["date"] = pd.to_datetime(df["dt"], unit="s")
            df["month"] = df["date"].dt.month
            df["temp"] = df["temp"] - 273.15

            for col in df.select_dtypes(include=["number"]).columns:
                df[col] = df[col].bfill().fillna(df[col].mean())

            logger.info("Weather data processed successfully.")
            return df
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            raise

    def cluster_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Phân cụm dữ liệu thời tiết bằng KMeans.

        Args:
            df (pd.DataFrame): Dữ liệu đã xử lý.

        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: 
                - Dữ liệu với nhãn cụm.
                - Điểm centroid của từng cụm với nhãn mùa.
        """
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty for clustering.")

            df["scaled_temp"] = self.scaler.fit_transform(df[["temp"]])
            df["kmean_label"] = self.kmeans_model.fit_predict(df[["scaled_temp"]])

            centroids = self.kmeans_model.cluster_centers_
            centroid_df = pd.DataFrame(
                centroids, columns=["scaled_temp"], index=[f"cluster_{i}" for i in range(len(centroids))]
            )
            centroid_df["temp"] = self.scaler.inverse_transform(centroid_df[["scaled_temp"]])
            centroid_df.reset_index(inplace=True)
            centroid_df.rename(columns={"index": "cluster_name"}, inplace=True)

            logger.info(f"Weather data clustered successfully. Centroids:\n{centroid_df}")
            return df, centroid_df
        except Exception as e:
            logger.error(f"Error clustering data: {e}")
            raise

    def customize_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Tùy chỉnh nhãn cụm dựa trên tháng để phân thành 4 mùa:
        - Mùa Xuân: Tháng 3 - 5.
        - Mùa Hạ: Tháng 6 - 8.
        - Mùa Thu: Tháng 9 - 11.
        - Mùa Đông: Tháng 12 - 2.

        Args:
            df (pd.DataFrame): Dữ liệu với nhãn cụm.

        Returns:
            pd.DataFrame: Dữ liệu với nhãn cụm tùy chỉnh.
        """
        try:
            if df.empty:
                raise ValueError("Input DataFrame is empty for customizing labels.")

            def assign_season(month):
                if 3 <= month <= 5:
                    return 0  # Mùa Xuân
                elif 6 <= month <= 8:
                    return 1  # Mùa Hạ
                elif 9 <= month <= 11:
                    return 2  # Mùa Thu
                else:
                    return 3  # Mùa Đông

            df["custom_label"] = df["month"].apply(assign_season)
            logger.info("Labels customized successfully.")
            return df
        except Exception as e:
            logger.error(f"Error customizing labels: {e}")
            raise

    def plot_temperature(self, df: pd.DataFrame):
        """
        Vẽ biểu đồ nhiệt độ theo thời gian.

        Args:
            df (pd.DataFrame): Dữ liệu đã xử lý và phân cụm.
        """
        try:
            plt.figure(figsize=(14, 7))
            colors = ['green', 'orange', 'brown', 'blue']
            seasons = ['Spring', 'Summer', 'Autumn', 'Winter']

            for season_label, color, season_name in zip(range(4), colors, seasons):
                season_data = df[df["custom_label"] == season_label]
                plt.scatter(season_data["date"], season_data["temp"], label=season_name, color=color, s=10)

            plt.title("Temperature Over Time by Season")
            plt.xlabel("Date")
            plt.ylabel("Temperature (°C)")
            plt.legend()
            plt.grid()
            plt.show()
            logger.info("Temperature plot by season generated successfully.")
        except Exception as e:
            logger.error(f"Error plotting temperature: {e}")

    async def save_centroids(self, centroids: List[Dict[str, Any]]) -> bool:
        """
        Lưu centroids vào cơ sở dữ liệu.

        Args:
            centroids (List[Dict[str, Any]]): Centroids đã serialize.

        Returns:
            bool: Trạng thái thành công hay thất bại.
        """
        try:
            await self.connect()

            delete_url = f"{self.db_api_url}/api/centroids"
            insert_url = f"{self.db_api_url}/api/centroids"
            headers = {"Content-Type": "application/json"}

            async with self.session.delete(delete_url, headers=headers) as delete_response:
                if delete_response.status != 200:
                    logger.warning(f"Failed to delete old centroids: {delete_response.status}")
                    return False

            async with self.session.post(insert_url, json=centroids, headers=headers) as insert_response:
                if insert_response.status == 200:
                    logger.info("Centroids saved successfully.")
                    return True
                else:
                    error = await insert_response.text()
                    logger.error(f"Failed to save centroids: {error}")
                    return False
        except Exception as e:
            logger.error(f"Error saving centroids: {e}")
            return False
        finally:
            await self.close()

    async def save_data_cluster(self, cluster_data: List[Dict[str, Any]]) -> bool:
        """
        Xóa dữ liệu cũ và lưu dữ liệu phân cụm mới vào cơ sở dữ liệu thông qua API.
        
        Args:
            cluster_data (List[Dict[str, Any]]): Dữ liệu phân cụm đã được serialize.
        
        Returns:
            bool: Trạng thái thành công hay thất bại.
        """
        try:
            await self.connect()

            # Xóa tất cả dữ liệu cũ
            delete_url = f"{self.db_api_url}/api/delete_all_data"
            delete_headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            async with self.session.delete(delete_url, headers=delete_headers) as delete_response:
                if delete_response.status == 200:
                    logger.info("Successfully deleted old cluster data.")
                else:
                    delete_error = await delete_response.text()
                    logger.error(f"Failed to delete old cluster data: {delete_response.status}, error: {delete_error}")
                    return False
            
            if self.session is None:
                await self.connect()

            # Thêm dữ liệu mới
            insert_url = f"{self.db_api_url}/api/cluster_data/bulk"
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            async with self.session.post(insert_url, json=cluster_data, headers=headers) as insert_response:
                if insert_response.status == 200:
                    result = await insert_response.json()
                    logger.info(f"Successfully saved {result['count']} cluster data.")
                    return True
                else:
                    insert_error = await insert_response.text()
                    logger.error(f"Failed to save cluster data: {insert_response.status}, error: {insert_error}")
                    return False

        except Exception as e:
            logger.error(f"Error saving cluster data: {e}")
            return False
        finally:
            await self.close()

    @staticmethod
    def serialize_cluster_data(cluster_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Chuyển đổi danh sách các bản ghi phân cụm thành dạng serializable để lưu vào cơ sở dữ liệu.

        Args:
            cluster_data (List[Dict[str, Any]]): Danh sách các bản ghi phân cụm.

        Returns:
            List[Dict[str, Any]]: Dữ liệu đã serialize.
        """
        try:
            serialized_data = [
                {
                    "dt": record["dt"],
                    "temp": record["temp"],
                    "pressure": record["pressure"],
                    "humidity": record["humidity"],
                    "clouds": record["clouds"],
                    "visibility": record["visibility"],
                    "wind_speed": record["wind_speed"],
                    "wind_deg": record["wind_deg"],
                    "date": record["date"].isoformat() if isinstance(record["date"], pd.Timestamp) else record["date"],
                    "month": record["month"],
                    "scaled_temp": record["scaled_temp"],
                    "kmean_label": record["kmean_label"],
                    "custom_label": record["custom_label"],
                }
                for record in cluster_data
            ]
            logger.info(f"Serialized {len(serialized_data)} records for database insertion.")
            return serialized_data
        except Exception as e:
            logger.error(f"Error serializing cluster data: {e}")
            raise

    @staticmethod
    def serialize_centroids(centroids: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Serialize centroids for database insertion.

        Args:
            centroids (List[Dict[str, Any]]): Danh sách centroids.

        Returns:
            List[Dict[str, Any]]: Dữ liệu đã serialize.
        """
        try:
            serialized_data = [
                {
                    "cluster_name": record["cluster_name"],
                    "temp": float(record["temp"]),
                    "scaled_temp": float(record["scaled_temp"]),
                }
                for record in centroids
            ]
            logger.info(f"Serialized {len(serialized_data)} centroids for database insertion.")
            return serialized_data
        except Exception as e:
            logger.error(f"Error serializing centroids: {e}")
            raise

async def main():
    """
    Main pipeline:
    - Fetch weather data.
    - Process and cluster data.
    - Serialize and save centroids and cluster data.
    """
    cluster = WeatherCluster()
    await cluster.connect()
    try:
        # Step 1: Fetch data
        weather_data = await cluster.get_weather_data()

        # Step 2: Process data
        processed_data = cluster.process_data(weather_data)

        # Step 3: Perform clustering
        clustered_data, centroids = cluster.cluster_data(processed_data)
        print(clustered_data.head())

        # Step 4: Customize labels
        customized_data = cluster.customize_labels(clustered_data)
        
        cluster.plot_temperature(processed_data)

        # Step 5: Serialize and save centroids
        centroids_serialized = cluster.serialize_centroids(centroids.to_dict("records"))
        success = await cluster.save_centroids(centroids_serialized)
        if success:
            logger.info("Centroids saved successfully.")
        else:
            logger.error("Failed to save centroids to database.")

        # Step 6: Serialize and save clustered data
        cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
        
        # Save cluster data
        cluster_success = await cluster.save_data_cluster(cluster_data_serialized)
        if cluster_success:
            logger.info("Clustered data saved successfully.")
        else:
            logger.error("Failed to save clustered data to database.")
    finally:
        await cluster.close()

if __name__ == "__main__":
    asyncio.run(main())
>>>>>>> 0c94dc3c2626d7e712a5fc148b9c44bc8508079e
