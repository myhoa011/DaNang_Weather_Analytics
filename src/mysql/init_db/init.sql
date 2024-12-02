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