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
    visibility INTL,
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