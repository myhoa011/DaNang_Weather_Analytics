-- Create database
CREATE DATABASE IF NOT EXISTS weather_db;
USE weather_db;

-- Create weather data table
CREATE TABLE IF NOT EXISTS raw_weather_data (
    dt INT PRIMARY KEY,
    temp FLOAT,
    pressure INT,
    humidity INT,
    clouds INT,
    visibility INT,
    wind_speed FLOAT,
    wind_deg INT
); 

CREATE TABLE IF NOT EXISTS processed_weather_data (
    dt INT PRIMARY KEY,
    temp FLOAT NOT NULL,
    pressure INT NOT NULL,
    humidity INT NOT NULL,
    clouds INT NOT NULL,
    visibility INT NOT NULL,
    wind_speed FLOAT NOT NULL,
    wind_deg INT NOT NULL
); 

CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dt INT NOT NULL,
    temp FLOAT NOT NULL,
    prediction_hour INT NOT NULL,
    hour INT,
    day INT,
    month INT,
    year INT,
    created_at INT,
    formatted_time VARCHAR(20),
    UNIQUE KEY `unique_prediction` (dt, prediction_hour)
);

-- create seasonal tanle
CREATE TABLE IF NOT EXISTS seasonal_table (
	dt DATETIME,
    observed_temp FLOAT NOT NULL,
    trend_temp FLOAT NOT NULL,
    seasonal_temp FLOAT NOT NULL,
    residual_temp FLOAT NOT NULL,
    observed_pressure FLOAT NOT NULL,
    trend_pressure FLOAT NOT NULL,
    seasonal_pressure FLOAT NOT NULL,
    residual_pressure FLOAT NOT NULL,
    
    observed_humidity FLOAT NOT NULL,
    trend_humidity FLOAT NOT NULL,
    seasonal_humidity FLOAT NOT NULL,
    residual_humidity FLOAT NOT NULL,
    
    observed_clouds FLOAT NOT NULL,
    trend_clouds FLOAT NOT NULL,
    seasonal_clouds FLOAT NOT NULL,
    residual_clouds FLOAT NOT NULL,
    
    observed_visibility FLOAT NOT NULL,
    trend_visibility FLOAT NOT NULL,
    seasonal_visibility FLOAT NOT NULL,
    residual_visibility FLOAT NOT NULL,
    
    observed_wind_speed FLOAT NOT NULL,
    trend_wind_speed FLOAT NOT NULL,
    seasonal_wind_speed FLOAT NOT NULL,
    residual_wind_speed FLOAT NOT NULL,
    
    observed_wind_deg FLOAT NOT NULL,
    trend_wind_deg FLOAT NOT NULL,
    seasonal_wind_deg FLOAT NOT NULL,
    residual_wind_deg FLOAT NOT NULL
);

-- Create weather data table
CREATE TABLE IF NOT EXISTS correlation_table (
    temp FLOAT NOT NULL,
    pressure FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    clouds FLOAT NOT NULL,
    visibility FLOAT,
    wind_speed FLOAT NOT NULL,
    wind_deg FLOAT NOT NULL
);

CREATE TABLE cluster_data (
    dt INT PRIMARY KEY,                  
    temp FLOAT NOT NULL,               
    pressure INT NOT NULL,             
    humidity INT NOT NULL,             
    clouds INT NOT NULL,               
    visibility INT DEFAULT NULL,     
    wind_speed FLOAT NOT NULL,        
    wind_deg INT NOT NULL,            
    date DATETIME NOT NULL,            
    month INT NOT NULL,               
    scaled_temp FLOAT NOT NULL,      
    kmean_label INT NOT NULL,         
    custom_label INT NOT NULL         
);
CREATE TABLE centroids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cluster_name VARCHAR(255) NOT NULL,
    scaled_temp FLOAT NOT NULL,
    temp FLOAT NOT NULL
);


CREATE TABLE IF NOT EXISTS temp_tomorrow_predict(
    id INT AUTO_INCREMENT PRIMARY KEY,
    temp_predict FLOAT,
    prediction_date INT,
    date DATETIME
);

CREATE TABLE IF NOT EXISTS spider(
     id INT AUTO_INCREMENT PRIMARY KEY,
     season varchar(255),
    days int,
    year int
);

