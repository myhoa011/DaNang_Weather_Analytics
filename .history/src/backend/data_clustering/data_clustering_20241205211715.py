from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import AsyncExitStack
from sklearn.cluster import KMeans
from src.backend.data_clustering.cluster_service import WeatherCluster
from src.backend.data_clustering.predict import Predict
from src.logger import logger
from contextlib import asynccontextmanager, suppress
from src.backend.data_clustering.weather_model import WeatherData
from typing import Dict, Any
import pandas as pd
from src.db_api.controid import Centroid, CentroidsResponse

# Initialize global objects
cluster = WeatherCluster()
predict = Predict()


@asynccontextmanager
async def lifespan(app: FastAPI):
    tasks = []
    try:
        # Startup: Initialize WeatherCluster and Predictor
        logger.info("Initializing WeatherCluster and Predictor...")
        await cluster.connect()
        logger.info("WeatherCluster initialized successfully.")

        # Define background tasks
        async def periodic_training():
            while True:
                try:
                    logger.info("Starting periodic training for temperature model...")
                    await predict.train_temperature_model()
                    logger.info("Temperature model trained successfully.")
                except Exception as e:
                    logger.error(f"Error during periodic training: {e}")
                await asyncio.sleep(24 * 3600)

        async def periodic_prediction():
            while True:
                try:
                    # Thêm delay trước khi bắt đầu để đảm bảo các service khác đã sẵn sàng
                    await asyncio.sleep(5)
                    
                    while True:
                        try:
                            # Thực hiện dự đoán
                            prediction_result = await predict.predict_next_day_temperature()
                            logger.info(f"Prediction completed: {prediction_result}")
                            
                            # Đợi 24 giờ trước lần dự đoán tiếp theo
                            await asyncio.sleep(24 * 60 * 60)  # 24 hours
                            
                        except Exception as inner_e:
                            logger.error(f"Error during prediction cycle: {inner_e}")
                            # Đợi một khoảng thời gian ngắn trước khi thử lại
                            await asyncio.sleep(60)  # 1 minute
                except Exception as e:
                    logger.error(f"Critical error in periodic prediction: {e}")
                    # Đợi trước khi khởi động lại vòng lặp
                    await asyncio.sleep(60)


        # Start background tasks
        training_task = asyncio.create_task(periodic_training())
        prediction_task = asyncio.create_task(periodic_prediction())
        tasks.extend([training_task, prediction_task])

        yield  # Yield control back to FastAPI

    finally:
        # Cancel background tasks
        logger.info("Shutting down background tasks...")
        for task in tasks:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task
        logger.info("Background tasks have been shut down.")

        # Cleanup on shutdown
        logger.info("Shutting down WeatherCluster and cleaning up resources...")
        await cluster.close()
        logger.info("WeatherCluster shutdown complete.")
        
# Create FastAPI app with lifespan management
app = FastAPI(
    title="Weather Prediction Service",
    description="Microservice for weather prediction using machine learning models.",
    version="1.0.0",
    lifespan=lifespan,  # Attach lifecycle manager
)

origins = [
    "http://localhost:3000",  # Domain của frontend
    # Thêm các domain khác nếu cần
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Chỉ định domain được phép
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, ...)
    allow_headers=["*"],  # Cho phép tất cả các headers
)

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.get("/api/predict-temp-tomorrow")
async def get_predict_temp_tomorrow():
    """
    API to predict tomorrow's temperature.
    """
    try:
        logger.info("Processing API request to predict tomorrow's temperature...")
        temp_tomorrow = await predict.predict_next_day_temperature()
        logger.info(f"Predicted temperature for tomorrow: {temp_tomorrow:.2f}°C")
        return {"temperature_tomorrow": temp_tomorrow}
    except Exception as e:
        logger.error(f"Error predicting tomorrow's temperature: {e}")
        raise HTTPException(status_code=500, detail="Error predicting tomorrow's temperature.")

@app.get("/api/distances-probabilities")
async def predict_temp_prob() -> Dict[str, Any]:
    try:
        logger.info("Processing API request to manually calculate probabilities...")
        
        kmeans_model = KMeans(n_clusters=3, random_state=42)
        raw_data = await cluster.get_weather_data()
        processed_data = await cluster.process_data(raw_data)
        kmeans_model.fit(processed_data[["temp"]])
        
        predicted_temp = await predict.predict_next_day_temperature()
        # Calculate cluster probabilities
        cluster_probs = predict.calculate_cluster_probabilities(predicted_temp, kmeans_model)
        
        logger.info("Models predicted successfully.")
        return {"result": cluster_probs}
    except Exception as e:
        logger.error(f"Error training models: {e}")
        raise HTTPException(status_code=500, detail="Error training models.")

@app.post("/api/predict-season-for-day")
async def predict_season_for_day(data: WeatherData) -> Dict[str, str]:
    try:
        logger.info(f"Received data: {data}")
        await predict.train_season_model()
        logger.info("Processing API request to predict season for a day...")
        season_predict = await predict.predict_season_for_day(data.dict())
        logger.info("Predicted season for day successfully.")
        return {"season": season_predict}
    except Exception as e:
        logger.error(f"Error predicting season: {e}")
        raise HTTPException(status_code=500, detail="Error predicting season.")

@app.post("/api/cluster")
async def cluster_weather_data():
    """
    API nhận dữ liệu thời tiết, xử lý phân cụm và trả về kết quả cùng với centroids.
    """
    try:
        # Lấy dữ liệu thời tiết
        logger.info("Fetching weather data...")
        weather_data = await cluster.get_weather_data()

        # Kiểm tra nếu weather_data là None hoặc DataFrame rỗng
        if weather_data is None or weather_data.empty:
            logger.warning("No weather data received from source.")
            raise ValueError("No weather data available for clustering.")

        # Xử lý dữ liệu
        logger.info("Processing weather data...")
        processed_data = await cluster.process_data(weather_data)

        # Kiểm tra nếu DataFrame rỗng sau khi xử lý
        if processed_data.empty:
            logger.warning("Processed data is empty after processing.")
            raise ValueError("Processed weather data is empty.")

        # Phân cụm dữ liệu
        logger.info("Clustering weather data...")
        clustered_data, centroids = cluster.cluster_data(processed_data)

        # Ghi log kết quả
        logger.info(f"Clustering completed. Found {len(centroids)} centroids.")
        
        centroids_serialized =  cluster.serialize_centroids(centroids.to_dict("records"))
        success = await cluster.save_centroids(centroids_serialized)
        if success:
            logger.info("centroids saved successfully.")
        else:
            logger.error("Failed to save centroids to database.")
        
        customized_data = cluster.customize_labels(clustered_data)    
        cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
        # Save cluster data
        cluster_success = await cluster.save_data_cluster(cluster_data_serialized)
        if cluster_success:
            logger.info("Clustered data saved successfully.")
        else:
            logger.error("Failed to save clustered data to database.")
        
        clustered_data = clustered_data.head(10)
        # Trả về kết quả
        return {
            "status": "success",
            "clustered_data": clustered_data.to_dict(orient="records"),
            "centroids": centroids.to_dict(orient="records"),
        }

    except ValueError as ve:
        logger.error(f"Validation error during clustering: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"Unexpected error during clustering: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during clustering.")

@app.get("/api/get-data-cluster")
async def get_all_data_cluster():
    """
    API để lấy toàn bộ dữ liệu cluster từ cơ sở dữ liệu thông qua hàm `get_all_data_cluster`.
    """
    try:
        logger.info("Processing API request to get all data cluster...")
        
        # Gọi hàm để lấy dữ liệu cluster
        data_cluster = await cluster.get_all_data_cluster()
        
        # Chuyển đổi dữ liệu DataFrame sang danh sách dictionary để trả về JSON
        data_cluster_json = data_cluster.to_dict(orient="records")
        
        logger.info(f"Successfully retrieved {len(data_cluster)} cluster records.")
        return {"data_cluster": data_cluster_json}

    except HTTPException as he:
        logger.error(f"HTTPException while fetching data cluster: {he.detail}")
        raise he

    except Exception as e:
        logger.error(f"Unexpected error while fetching data cluster: {e}")
        raise HTTPException(status_code=500, detail="Error fetching data cluster.")

@app.get("/api/centroids", response_model=CentroidsResponse)
async def get_centroids():
    """
    API để lấy thông tin các centroids của cụm.
    """
    try:
        logger.info("Processing API request to get centroids...")

        # Gọi hàm cluster.get_centroids() để lấy dữ liệu
        centroids = await cluster.get_centroids()
        
        print(centroids)

        # Kiểm tra nếu không có centroids
        if centroids.empty:
            logger.warning("No centroids found in database.")
            return {"status": "success", "data_cluster": []}

        # Chọn các cột cần thiết
        centroids = centroids[['cluster_name', 'scaled_temp', 'temp']]

        # Chuyển đổi DataFrame thành JSON
        centroids_json = centroids.to_dict(orient="records")

        logger.info(f"Successfully retrieved {len(centroids)} centroid records.")

        # Trả về dữ liệu
        return {
            "status": "success",
            "data_cluster": centroids_json
        }

    except ValueError as ve:
        # Log lỗi ValueError
        logger.error(f"ValueError while fetching centroids: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))

    except Exception as e:
        # Log lỗi bất ngờ
        logger.exception(f"Unexpected error while fetching centroids: {e}")
        raise HTTPException(status_code=500, detail="Error fetching centroids.")

@app.get("/api/predict-probability-season")
async def predict_probability_season(temp: float):
    try:
        result = await predict.predict_season_probability(temp)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error.")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.backend.data_clustering.data_clustering:app",
        host="localhost",
        port=8004,
        reload=True
    )
