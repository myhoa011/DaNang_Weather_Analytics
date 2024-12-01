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