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
from aiohttp import ClientResponseError, ServerDisconnectedError
import os
from typing import List, Dict, Any

load_dotenv()


class WeatherCluster:
    def __init__(self):
        """
        Initialize WeatherCluster with key components:
        - KMeans for clustering.
        - StandardScaler for data normalization.
        - RandomForest models for regression and classification tasks.
        """
        self.db_api_url = os.getenv("DB_API_URL")
        self.session = None
        self.scaler = StandardScaler()
        self.kmeans_model = KMeans(n_clusters=4, random_state=42)
        self.temperature_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.season_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

    async def connect(self):
        """Initialize the HTTP session."""
        if self.session is None:
            self.session = aiohttp.ClientSession()

    async def close(self):
        """Close the HTTP session."""
        if self.session:
            await self.session.close()
            self.session = None

    async def get_weather_data(self) -> pd.DataFrame:
        """
        Fetch weather data from the API.

        Returns:
            pd.DataFrame: Raw weather data.
        """
        try:
            if self.session is None:
                await self.connect()

            headers = {"Content-Type": "application/json", "Accept": "application/json"}

            async with self.session.get(f"{self.db_api_url}/api/weather", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return pd.DataFrame(data)
                else:
                    error = await response.text()
                    raise HTTPException(status_code=response.status, detail=f"API error: {error}")
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            raise HTTPException(status_code=500, detail="Error fetching weather data.")

    def process_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process weather data:
        - Normalize temperature to Celsius.
        - Fill missing values.

        Args:
            df (pd.DataFrame): Raw weather data.

        Returns:
            pd.DataFrame: Processed weather data.
        """
        try:
            df["date"] = pd.to_datetime(df["dt"], unit="s")
            df["month"] = df["date"].dt.month
            df["temp"] = df["temp"] - 273.15

            for col in df.select_dtypes(include=["number"]).columns:
                df[col] = df[col].fillna(method="ffill").fillna(df[col].mean())

            return df
        except Exception as e:
            logger.error(f"Error processing weather data: {e}")
            raise HTTPException(status_code=500, detail="Error processing weather data.")

    def cluster_data(self, df: pd.DataFrame) -> (pd.DataFrame, pd.DataFrame):
        """
        Perform KMeans clustering on weather data.

        Args:
            df (pd.DataFrame): Processed weather data.

        Returns:
            pd.DataFrame: Weather data with cluster labels.
            pd.DataFrame: Centroid information with cluster labels.
        """
        try:
            df["scaled_temp"] = self.scaler.fit_transform(df[["temp"]])
            df["kmean_label"] = self.kmeans_model.fit_predict(df[["scaled_temp"]])

            centroids = self.kmeans_model.cluster_centers_
            centroid_df = pd.DataFrame(
                centroids, columns=["scaled_temp"], index=[f"cluster_{i}" for i in range(len(centroids))]
            )
            centroid_df["temp"] = self.scaler.inverse_transform(centroid_df[["scaled_temp"]])

            return df, centroid_df
        except Exception as e:
            logger.error(f"Error clustering weather data: {e}")
            raise HTTPException(status_code=500, detail="Error clustering weather data.")

    def customize_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Customize cluster labels based on month for seasonal clustering:
        - Spring: March to May.
        - Summer: June to August.
        - Autumn: September to November.
        - Winter: December to February.

        Args:
            df (pd.DataFrame): Weather data with cluster labels.

        Returns:
            pd.DataFrame: Weather data with customized seasonal labels.
        """
        def assign_season(month):
            if 3 <= month <= 5:
                return 0  # Spring
            elif 6 <= month <= 8:
                return 1  # Summer
            elif 9 <= month <= 11:
                return 2  # Autumn
            else:
                return 3  # Winter

        df["custom_label"] = df["month"].apply(assign_season)
        return df

    def plot_temperature(self, df: pd.DataFrame):
        """
        Plot temperature over time grouped by seasonal labels.

        Args:
            df (pd.DataFrame): Weather data with seasonal labels.
        """
        try:
            plt.figure(figsize=(14, 7))
            colors = ["green", "orange", "brown", "blue"]
            seasons = ["Spring", "Summer", "Autumn", "Winter"]

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
        Save centroids to the database.

        Args:
            centroids (List[Dict[str, Any]]): Serialized centroids.

        Returns:
            bool: Success status.
        """
        try:
            if self.session is None:
                await self.connect()

            delete_url = f"{self.db_api_url}/api/centroids"
            insert_url = f"{self.db_api_url}/api/centroids"
            headers = {"Content-Type": "application/json"}

            # Delete old centroids
            async with self.session.delete(delete_url, headers=headers) as delete_response:
                if delete_response.status != 200:
                    logger.error(f"Failed to delete old centroids. Status: {delete_response.status}")
                    return False

            # Insert new centroids
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

    @staticmethod
    def serialize_centroids(centroids: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Serialize centroids for database insertion.

        Args:
            centroids (List[Dict[str, Any]]): Raw centroid data.

        Returns:
            List[Dict[str, Any]]: Serialized centroids.
        """
        try:
            serialized_data = [
                {
                    "cluster_name": f"cluster_{i}",
                    "temp": float(record["temp"]),
                    "scaled_temp": float(record["scaled_temp"]),
                }
                for i, record in enumerate(centroids)
            ]
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
        processed_data = cluster.process_data(weather_data)

        # Step 3: Perform clustering
        clustered_data, centroids = cluster.cluster_data(processed_data)

        # Step 4: Serialize and save centroids
        centroids_serialized = cluster.serialize_centroids(centroids.to_dict("records"))
        await cluster.save_centroids(centroids_serialized)

        # Step 5: Customize cluster labels and save data
        customized_data = cluster.customize_labels(clustered_data)
        cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
        await cluster.save_data_cluster(cluster_data_serialized)
    finally:
        await cluster.close()


if __name__ == "__main__":
    asyncio.run(main())
