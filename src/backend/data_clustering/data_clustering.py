from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from sklearn.cluster import KMeans
from .cluster_service import WeatherCluster
from .predict import Predict
from src.logger import logger
from contextlib import asynccontextmanager, suppress
from .weather_model import WeatherData
from typing import Dict, Any
import redis.asyncio as aioredis
import json
import os
from dotenv import load_dotenv
from datetime import datetime
from .spider import SpiderProcessor

# Load environment variables
load_dotenv()

# Initialize Redis connection
redis = None

async def init_redis():
    """Initialize Redis connection"""
    global redis
    if redis is None:
        redis = await aioredis.from_url(
            f'redis://redis:6379',
            password=os.getenv('REDIS_PASSWORD')
        )
    return redis

async def wait_for_initial_data():
    """Wait for initial data to be loaded in db"""
    redis_client = await init_redis()
    logger.info("Waiting for initial data load...")
    while True:
        try:
            is_ready = await redis_client.get('db_initial_load_complete')
            if is_ready:
                logger.info("Initial data is ready")
                return True
                
            # Subscribe để nhận thông báo realtime
            pubsub = redis_client.pubsub()
            await pubsub.subscribe('db_status')
            
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    if message['data'] == b'initial_load_complete':
                        logger.info("Received initial data ready signal")
                        await pubsub.unsubscribe('db_status')
                        return True
            
            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Error waiting for initial data: {e}")
            await asyncio.sleep(5)

async def start_redis_listener():
    """Start listening for new weather data and perform clustering"""
    redis_client = await init_redis()
    try:
        pubsub = redis_client.pubsub()
        await pubsub.subscribe('weather_data')
        
        logger.info("Started Redis listener for new weather data")
        
        # Lấy dữ liệu ban đầu và thực hiện clustering
        weather_data = await cluster.get_weather_data()
        if not weather_data.empty:
            # Process and cluster initial data
            processed_data = await cluster.process_data(weather_data)
            clustered_data, centroids = cluster.cluster_data(processed_data)
            customized_data = cluster.customize_labels(clustered_data)
            
            # Save initial centroids
            centroids_serialized = cluster.serialize_centroids(centroids.to_dict("records"))
            centroid_success = await cluster.save_centroids(centroids_serialized)
            if centroid_success:
                logger.info("Lưu centroids ban đầu thành công")
            
            # Save initial cluster data
            cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
            cluster_success = await cluster.save_data_cluster(cluster_data_serialized)
            if cluster_success:
                logger.info("Lưu dữ liệu cluster ban đầu thành công")

            # Process and save initial spider data
            await spider.get_weather_data()
            await spider.process_data()
            await spider.save_spider_data()
            logger.info("Lưu dữ liệu spider ban đầu thành công")
        
        # Bắt đầu lắng nghe dữ liệu mới
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                try:
                    # Parse new data
                    data = json.loads(message['data'])
                    current_time = datetime.fromtimestamp(data['dt'])
                    logger.info(f"Received new weather data at {current_time}")
                    
                    # Get latest data including new record
                    weather_data = await cluster.get_weather_data()
                    if not weather_data.empty:
                        # Process and cluster new data
                        processed_data = await cluster.process_data(weather_data)
                        clustered_data, centroids = cluster.cluster_data(processed_data)
                        customized_data = cluster.customize_labels(clustered_data)
                        
                        # Save new centroids
                        centroids_serialized = cluster.serialize_centroids(centroids.to_dict("records"))
                        centroid_success = await cluster.save_centroids(centroids_serialized)
                        if centroid_success:
                            logger.info("New centroids saved successfully")
                        
                        # Save new cluster data
                        cluster_data_serialized = cluster.serialize_cluster_data(customized_data.to_dict("records"))
                        cluster_success = await cluster.save_data_cluster(cluster_data_serialized)
                        if cluster_success:
                            logger.info("New cluster data saved successfully")

                        # Update spider data
                        await spider.get_weather_data()
                        await spider.process_data()
                        await spider.save_spider_data()
                        logger.info("Cập nhật dữ liệu spider thành công")
                        
                        logger.info("Completed clustering with new data")
                    else:
                        logger.warning("No data available for clustering")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Error decoding message: {e}")
                except Exception as e:
                    logger.error(f"Error processing new data: {e}")
            
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"Error in Redis listener: {e}")
        # Attempt to reconnect
        await asyncio.sleep(5)
        await start_redis_listener()

# Initialize global objects
cluster = WeatherCluster()
predict = Predict()
spider = SpiderProcessor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    tasks = []
    try:
        # Initialize Redis
        await init_redis()
        
        # Wait for initial data
        await wait_for_initial_data()
        
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
        redis_listener_task = asyncio.create_task(start_redis_listener())
        tasks.extend([training_task, prediction_task, redis_listener_task])

        yield

    finally:
        # Cancel background tasks
        logger.info("Shutting down background tasks...")
        for task in tasks:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task
        logger.info("Background tasks have been shut down.")

        # Close Redis connection
        if redis:
            await redis.close()
        
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
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
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

@app.get("/api/centroids")
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
