# <<<<<<< HEAD
# import asyncio
# import logging
# import pandas as pd
# import numpy as np
# import time
# from typing import Dict, Any
# from src.backend.data_clustering.cluster_service import WeatherCluster
# from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
# from sklearn.preprocessing import StandardScaler
# from sklearn.model_selection import train_test_split
# from fastapi import HTTPException
# from sklearn.cluster import KMeans
# import httpx

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# class Predict:
#     def __init__(self):
#         """
#         Initialize Predict class with RandomForest models and other utilities for weather data predictions.
#         """
#         self.base_url = "http://localhost:8000/api"
#         self.is_trained_temp = False
#         self.is_trained_season = False
#         self.last_trained_temp = None
#         self.last_trained_season = None
#         self.data_service = WeatherCluster()
#         self.scaler = StandardScaler()
#         self.temperature_model = RandomForestRegressor(n_estimators=100, random_state=42)
#         self.season_model = RandomForestClassifier(n_estimators=100, random_state=42)
#         self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

#     async def train_temperature_model(self) -> None:
#         """
#         Train the temperature prediction model if not trained in the last 24 hours.
#         """
#         try:
#             current_time = time.time()
#             if not self.last_trained_temp or (current_time - self.last_trained_temp) >= 24 * 3600:
#                 df = await self.data_service.get_weather_data()
#                 df = await self.data_service.process_data(df)
#                 df["temp_shifted"] = df["temp"].shift(-1)
#                 df.dropna(inplace=True)

#                 X, y = df[self.features], df["temp_shifted"]
#                 X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#                 self.temperature_model.fit(X_train, y_train)
#                 mae = np.mean(np.abs(y_test - self.temperature_model.predict(X_test)))
#                 logger.info(f"Temperature prediction model trained. MAE: {mae:.2f}")

#                 self.is_trained_temp = True
#                 self.last_trained_temp = current_time
#         except Exception as e:
#             logger.error(f"Error training temperature model: {e}")
#             raise

#     async def predict_next_day_temperature(self) -> float:
#         """
#         Predict the next day's temperature using the trained model and save it to the database.
#         """
#         try:
#             if not self.is_trained_temp:
#                 await self.train_temperature_model()

#             df = await self.data_service.get_weather_data()
#             df = await self.data_service.process_data(df)
#             today_features = df[self.features].iloc[-1].to_frame().T
#             predicted_temp = self.temperature_model.predict(today_features)[0]

#             # Lấy ngày hiện tại
#             current_date = pd.to_datetime('now').strftime('%Y-%m-%d')

#             data_save = {
#                         "temp_predict": float(predicted_temp),
#                         "date": current_date
#                     }
#             print(data_save)

#             # Gọi API để lưu nhiệt độ dự đoán và ngày hiện tại vào database
#             async with httpx.AsyncClient() as client:
#                 response = await client.post(
#                     f"{self.base_url}/temp_pred_save",
#                     json= data_save
#                 )
#                 response.raise_for_status()

#             return predicted_temp

#         except Exception as e:
#             logger.error(f"Error predicting temperature: {e}")
#             raise

#     async def train_season_model(self) -> None:
#         """
#         Train the season classification model if not trained in the last 24 hours.
#         """
#         try:
#             current_time = time.time()
#             if not self.last_trained_season or (current_time - self.last_trained_season) >= 24 * 3600:
#                 df = await self.data_service.get_weather_data()
#                 df = await self.data_service.process_data(df)
#                 df = self.data_service.customize_labels(df)

#                 X, y = df[self.features], df["custom_label"]
#                 self.scaler.fit(X)
#                 X_scaled = self.scaler.transform(X)

#                 X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

#                 self.season_model.fit(X_train, y_train)
#                 accuracy = self.season_model.score(X_test, y_test)
#                 logger.info(f"Season classification model trained. Accuracy: {accuracy:.2f}")

#                 self.is_trained_season = True
#                 self.last_trained_season = current_time
#         except Exception as e:
#             logger.error(f"Error training season model: {e}")
#             raise

#     async def calculate_season_centroids_by_temp(self):
#         try: 
#             data = await self.data_service.get_all_data_cluster()
            
#             # Chuyển đổi cột 'date' sang dạng tháng
#             data['month'] = pd.to_datetime(data['date']).dt.month
            
#             # Xác định mùa
#             def get_season(month):
#                 if month in [3, 4, 5]:
#                     return 'spring'
#                 elif month in [6, 7, 8]:
#                     return 'summer'
#                 elif month in [9, 10, 11]:
#                     return 'autumn'
#                 else:
#                     return 'winter'
            
#             data['season'] = data['month'].apply(get_season)
            
#             # Tính centroids (trung bình nhiệt độ theo mùa)
#             centroids = data.groupby('season')['temp'].mean().to_dict()
            
#             return centroids
#         except Exception as e:
#             logger.error(f"Error in calculate_season_centroids_by_temp: {e}")
#             raise

    
#     async def predict_season_probability(self, temp):
#         try:
#             centroids = await self.calculate_season_centroids_by_temp()
            
#             if not centroids:
#                 logger.error("Centroids are empty, unable to predict season probability.")
#                 raise ValueError("Centroids are empty.")
            
#             # Calculate distances
#             distances = {season: abs(temp - centroid) for season, centroid in centroids.items()}
            
#             # Normalize distances to calculate probabilities (inverse distance weighting)
#             total_inverse_distance = sum(1 / d if d != 0 else float('inf') for d in distances.values())
#             probabilities = {season: (1 / distances[season] if distances[season] != 0 else 1e6) / total_inverse_distance 
#                             for season in distances}
            
#             # Prepare the result
#             result = {
#                 "distances": distances,
#                 "probabilities": probabilities
#             }
#             return result
#         except Exception as e:
#             logger.error(f"Error in predict_season_probability: {e}")
#             raise

    
#     @staticmethod
#     def calculate_cluster_probabilities(predicted_temperature: float, kmeans_model: KMeans) -> Dict[str, Any]:
#         """
#         Calculate probabilities of cluster memberships for the predicted temperature.
#         """
#         try:
#             if not hasattr(kmeans_model, "cluster_centers_"):
#                 raise ValueError("Invalid KMeans model. Ensure the model is properly trained.")

#             centroids = kmeans_model.cluster_centers_
#             distances = [float(np.linalg.norm(predicted_temperature - centroid[0])) for centroid in centroids]
#             inverse_distances = [1 / d if d != 0 else 1e-9 for d in distances]
#             total_inverse = sum(inverse_distances)
#             probabilities = [float(dist / total_inverse) for dist in inverse_distances]

#             return {
#                 "distances": {f"cluster_{i}": distances[i] for i in range(len(distances))},
#                 "probabilities": {f"cluster_{i}": probabilities[i] for i in range(len(probabilities))}
#             }
#         except Exception as e:
#             logger.error(f"Error calculating cluster probabilities: {e}")
#             raise HTTPException(status_code=500, detail="Error calculating cluster probabilities.")

#     async def predict_season_probabilities(self, data: Dict[str, Any]) -> Dict[str, float]:
#         """
#         Predict season probabilities based on given weather data.
#         """
#         try:
#             df = pd.DataFrame([data])
#             missing_features = set(self.features) - set(df.columns)
#             if missing_features:
#                 raise ValueError(f"Missing features: {missing_features}")
#             df["temp"] -= 273.15
#             df_scaled = self.scaler.transform(df[self.features])
#             probabilities = self.season_model.predict_proba(df_scaled)[0]

#             return {season: prob for season, prob in zip(["Spring", "Summer", "Autumn", "Winter"], probabilities)}
#         except Exception as e:
#             logger.error(f"Error predicting season probabilities: {e}")
#             raise

#     async def predict_season_for_day(self, sample_data: Dict[str, float]) -> str:
#         """
#         Predict the season for a given day's weather data.
        
#         Args:
#             sample_data (Dict[str, float]): Weather data for the day.
        
#         Returns:
#             str: Predicted season (e.g., "Spring", "Summer", "Autumn", "Winter").
#         """
#         try:
#             # Ensure the model is trained
#             if not self.is_trained_season:
#                 raise ValueError("The season classification model has not been trained yet.")

#             # Extract features and scale the input data
#             features = [sample_data[feature] for feature in self.features]
#             scaled_features = self.scaler.transform([features])

#             # Predict the season
#             predicted_label = self.season_model.predict(scaled_features)[0]

#             # Map the predicted label to a season name
#             label_to_season = {
#                 0: "Spring",
#                 1: "Summer",
#                 2: "Autumn",
#                 3: "Winter"
#             }

#             predicted_season = label_to_season.get(predicted_label, "Unknown")
#             logger.info(f"Predicted season: {predicted_season}")
#             return predicted_season

#         except Exception as e:
#             logger.error(f"Error predicting season: {e}")
#             raise HTTPException(status_code=500, detail="Error predicting season.")

# async def main():
#     cluster = WeatherCluster()
#     predict = Predict()
#     try:
#         await cluster.connect()
#         await predict.train_temperature_model()
#         await predict.train_season_model()
        
#         result = await predict.predict_season_probability(30)
#         print(result)
#         # Train KMeans model
#         # kmeans_model = KMeans(n_clusters=3, random_state=42)
#         # raw_data = await cluster.get_weather_data()
#         # processed_data = await cluster.process_data(raw_data)
#         # kmeans_model.fit(processed_data[["temp"]])

#         # # Predict next day's temperature
#         # predicted_temp = await predict.predict_next_day_temperature()

#         # # Calculate cluster probabilities
#         # cluster_probs = predict.calculate_cluster_probabilities(predicted_temp, kmeans_model)
       
#         # # Predict season probabilities
#         # sample_data = {
#         #     "temp": 293.57,
#         #     "pressure": 1021,
#         #     "humidity": 77,
#         #     "clouds": 75,
#         #     "visibility": 10000,
#         #     "wind_speed": 2.06,
#         #     "wind_deg": 330,
#         # }
        
#         # season_probabilities = await predict.predict_season_probabilities(sample_data)
#         # logger.info(f"Season Probabilities: {season_probabilities}")
#         # for season, prob in season_probabilities.items():
#         #     logger.info(f"{season}: {prob * 100:.2f}%")
            
            
#         # # Log Predicted Temperature
#         # logger.info(f"Predicted Temperature: {predicted_temp:.1f}°C")

#         # # Log Cluster Distances
#         # logger.info("Cluster Distances:")
#         # for cluster, distance in cluster_probs["distances"].items():
#         #     logger.info(f"  {cluster}: {distance:.1f}")

#         # # Log Cluster Probabilities
#         # logger.info("Cluster Probabilities:")
#         # for cluster, probability in cluster_probs["probabilities"].items():
#         #     logger.info(f"  {cluster}: {probability * 100:.2f}%")
   
#     finally:
#         # Đảm bảo đóng cluster
#         if isinstance(cluster, WeatherCluster):
#             await cluster.close()
#             logger.info("Cluster session closed.")
#         else:
#             logger.error(f"Cluster is not a WeatherCluster instance: {type(cluster)}")

# if __name__ == "__main__":
#     asyncio.run(main())
# =======
import asyncio
import logging
import pandas as pd
import numpy as np
import time
from typing import Dict, Any
from src.backend.data_clustering.cluster_service import WeatherCluster
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from fastapi import HTTPException
from sklearn.cluster import KMeans
from src.logger import logger

class Predict:
    def __init__(self):
        """
        Initialize Predict class with RandomForest models and other utilities for weather data predictions.
        """
        self.is_trained_temp = False
        self.is_trained_season = False
        self.last_trained_temp = None
        self.last_trained_season = None
        self.data_service = WeatherCluster()
        self.scaler = StandardScaler()
        self.temperature_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.season_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.features = ["temp", "pressure", "humidity", "clouds", "visibility", "wind_speed", "wind_deg"]

    async def train_temperature_model(self) -> None:
        """
        Train the temperature prediction model if not trained in the last 24 hours.
        """
        try:
            current_time = time.time()
            if not self.last_trained_temp or (current_time - self.last_trained_temp) >= 24 * 3600:
                df = await self.data_service.get_weather_data()
                df = await self.data_service.process_data(df)
                df["temp_shifted"] = df["temp"].shift(-1)
                df.dropna(inplace=True)

                X, y = df[self.features], df["temp_shifted"]
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

                self.temperature_model.fit(X_train, y_train)
                mae = np.mean(np.abs(y_test - self.temperature_model.predict(X_test)))
                logger.info(f"Temperature prediction model trained. MAE: {mae:.2f}")

                self.is_trained_temp = True
                self.last_trained_temp = current_time
        except Exception as e:
            logger.error(f"Error training temperature model: {e}")
            raise

    async def predict_next_day_temperature(self) -> float:
        """
        Predict the next day's temperature using the trained model.
        """
        try:
            if not self.is_trained_temp:
                await self.train_temperature_model()

            df = await self.data_service.get_weather_data()
            df = await self.data_service.process_data(df)
            today_features = df[self.features].iloc[-1].to_frame().T
            return self.temperature_model.predict(today_features)[0]

        except Exception as e:
            logger.error(f"Error predicting temperature: {e}")
            raise

    async def train_season_model(self) -> None:
        """
        Train the season classification model if not trained in the last 24 hours.
        """
        try:
            current_time = time.time()
            if not self.last_trained_season or (current_time - self.last_trained_season) >= 24 * 3600:
                df = await self.data_service.get_weather_data()
                df = await self.data_service.process_data(df)
                df = self.data_service.customize_labels(df)

                X, y = df[self.features], df["custom_label"]
                self.scaler.fit(X)
                X_scaled = self.scaler.transform(X)

                X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

                self.season_model.fit(X_train, y_train)
                accuracy = self.season_model.score(X_test, y_test)
                logger.info(f"Season classification model trained. Accuracy: {accuracy:.2f}")

                self.is_trained_season = True
                self.last_trained_season = current_time
        except Exception as e:
            logger.error(f"Error training season model: {e}")
            raise

    async def calculate_season_centroids_by_temp(self):
        try: 
            data = await self.data_service.get_all_data_cluster()
            
            # Chuyển đổi cột 'date' sang dạng tháng
            data['month'] = pd.to_datetime(data['date']).dt.month
            
            # Xác định mùa
            def get_season(month):
                if month in [3, 4, 5]:
                    return 'spring'
                elif month in [6, 7, 8]:
                    return 'summer'
                elif month in [9, 10, 11]:
                    return 'autumn'
                else:
                    return 'winter'
            
            data['season'] = data['month'].apply(get_season)
            
            # Tính centroids (trung bình nhiệt độ theo mùa)
            centroids = data.groupby('season')['temp'].mean().to_dict()
            
            return centroids
        except Exception as e:
            logger.error(f"Error in calculate_season_centroids_by_temp: {e}")
            raise

    
    async def predict_season_probability(self, temp):
        try:
            centroids = await self.calculate_season_centroids_by_temp()
            
            if not centroids:
                logger.error("Centroids are empty, unable to predict season probability.")
                raise ValueError("Centroids are empty.")
            
            # Calculate distances
            distances = {season: abs(temp - centroid) for season, centroid in centroids.items()}
            
            # Normalize distances to calculate probabilities (inverse distance weighting)
            total_inverse_distance = sum(1 / d if d != 0 else float('inf') for d in distances.values())
            probabilities = {season: (1 / distances[season] if distances[season] != 0 else 1e6) / total_inverse_distance 
                            for season in distances}
            
            # Prepare the result
            result = {
                "distances": distances,
                "probabilities": probabilities
            }
            return result
        except Exception as e:
            logger.error(f"Error in predict_season_probability: {e}")
            raise

    
    @staticmethod
    def calculate_cluster_probabilities(predicted_temperature: float, kmeans_model: KMeans) -> Dict[str, Any]:
        """
        Calculate probabilities of cluster memberships for the predicted temperature.
        """
        try:
            if not hasattr(kmeans_model, "cluster_centers_"):
                raise ValueError("Invalid KMeans model. Ensure the model is properly trained.")

            centroids = kmeans_model.cluster_centers_
            distances = [float(np.linalg.norm(predicted_temperature - centroid[0])) for centroid in centroids]
            inverse_distances = [1 / d if d != 0 else 1e-9 for d in distances]
            total_inverse = sum(inverse_distances)
            probabilities = [float(dist / total_inverse) for dist in inverse_distances]

            return {
                "distances": {f"cluster_{i}": distances[i] for i in range(len(distances))},
                "probabilities": {f"cluster_{i}": probabilities[i] for i in range(len(probabilities))}
            }
        except Exception as e:
            logger.error(f"Error calculating cluster probabilities: {e}")
            raise HTTPException(status_code=500, detail="Error calculating cluster probabilities.")

    async def predict_season_probabilities(self, data: Dict[str, Any]) -> Dict[str, float]:
        """
        Predict season probabilities based on given weather data.
        """
        try:
            df = pd.DataFrame([data])
            missing_features = set(self.features) - set(df.columns)
            if missing_features:
                raise ValueError(f"Missing features: {missing_features}")
            df["temp"] -= 273.15
            df_scaled = self.scaler.transform(df[self.features])
            probabilities = self.season_model.predict_proba(df_scaled)[0]

            return {season: prob for season, prob in zip(["Spring", "Summer", "Autumn", "Winter"], probabilities)}
        except Exception as e:
            logger.error(f"Error predicting season probabilities: {e}")
            raise

    async def predict_season_for_day(self, sample_data: Dict[str, float]) -> str:
        """
        Predict the season for a given day's weather data.
        
        Args:
            sample_data (Dict[str, float]): Weather data for the day.
        
        Returns:
            str: Predicted season (e.g., "Spring", "Summer", "Autumn", "Winter").
        """
        try:
            # Ensure the model is trained
            if not self.is_trained_season:
                raise ValueError("The season classification model has not been trained yet.")

            # Extract features and scale the input data
            features = [sample_data[feature] for feature in self.features]
            scaled_features = self.scaler.transform([features])

            # Predict the season
            predicted_label = self.season_model.predict(scaled_features)[0]

            # Map the predicted label to a season name
            label_to_season = {
                0: "Spring",
                1: "Summer",
                2: "Autumn",
                3: "Winter"
            }

            predicted_season = label_to_season.get(predicted_label, "Unknown")
            logger.info(f"Predicted season: {predicted_season}")
            return predicted_season

        except Exception as e:
            logger.error(f"Error predicting season: {e}")
            raise HTTPException(status_code=500, detail="Error predicting season.")

async def main():
    cluster = WeatherCluster()
    predict = Predict()
    try:
        await cluster.connect()
        await predict.train_temperature_model()
        await predict.train_season_model()
        
        result = await predict.predict_season_probability(30)
        print(result)
   
    finally:
        # Đảm bảo đóng cluster
        if isinstance(cluster, WeatherCluster):
            await cluster.close()
            logger.info("Cluster session closed.")
        else:
            logger.error(f"Cluster is not a WeatherCluster instance: {type(cluster)}")

if __name__ == "__main__":
    asyncio.run(main())

