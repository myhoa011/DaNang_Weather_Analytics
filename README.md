# **Da Nang Weather Analytics**

A comprehensive project for mining, analyzing, and predicting weather data in Da Nang using OpenWeatherMap API. This system automates data ingestion, storage, and backend services for clustering, classification, and prediction.

---

## **Project Overview**
This project aims to build a data pipeline for weather data in Da Nang, from data collection to advanced analysis and prediction. Key features include:
- **Data Ingestion**: Collects data every 1 hour from OpenWeatherMap API.
- **Database Management**: Stores raw and processed weather data.
- **Backend Services**: Includes analysis, clustering and prediction modules.
- **Front-End Interface**: A React-based web interface to visualize and explore weather data.

---

## **Features**
1. **Data Ingestion**
   - Periodically fetches weather data from OpenWeatherMap API every 1 hour.
   - Logs and handles errors during data collection.
2. **Database API**
   - Provides endpoints for querying raw and processed weather data.
3. **Backend Services**
   - **Data Analysis**: Aggregates and analyzes weather patterns.
   - **Clustering**: Groups weather data into meaningful clusters.
   - **Prediction**: Predicts future weather patterns using historical data.
4. **Visualization**
   - A React-based front-end interface to visualize weather trends and insights.
   - Displays interactive charts and tables for better understanding of weather data.

---

## **Technologies Used**
- **Programming Languages**: Python, JavaScript (React)
- **Frameworks**: 
  - Backend: FastAPI (API development)
  - Frontend: ReactJS (for building user interfaces)
  - Docker/Docker Compose (Containerization)
- **Databases**: MySQL
- **Libraries**:
  - Pandas, NumPy (Data Processing)
  - Scikit-learn (Machine Learning)
- **APIs**: OpenWeatherMap API

---

## **System Architecture**
![System Architecture](https://via.placeholder.com/800x400?text=System+Architecture)

- **Data Source**: OpenWeatherMap API
- **Data Ingestion**: Collects and stores raw weather data.
- **Database API**: Handles interaction with the database.
- **Backend Services**:
  - Data Analysis
  - Clustering
  - Prediction
- **Front End**: React-based interface to display weather insights in a user-friendly format.
---

## **Initialization**
The database tables are initialized using an SQL script located in `mysql/init_db/`. When the MySQL container starts, this script is executed automatically.

To initialize manually:
```bash
docker exec -i mysql_container_name mysql -u root -pweather_db < mysql/init_db/init.sql
```
---

## **Folder Structure**
```plaintext
project/
│
├── configs/                
├── data/                   
├── logs/                   
├── src/                   
│   ├── backend/            
│   ├── crawl_data/         
│   ├── data_ingestion/     
│   ├── db_api/             
│   ├── frontend/           
│   └── mysql/              
│       └── init_db/        
├── docker-compose.yml  
├── .env
├── .gitignore              
├── README.md               
└── requirements.txt        
```
---

## **Getting Started**

### **System Requirements**
- **Python** >= 3.10
- **Node.js** >= 20.x (for React frontend)
- **Docker** and **Docker Compose**
- **MySQL**
---

### **Configuration**

1. Create a `.env` file based on the template:
   ```bash
   cp .env.example .env
   ```
   Edit the .env file with the necessary configuration information.
---

### **Start the Project**
1. Start all services using Docker Compose:
    ```bash
    docker-compose up --build
    ```
2. The project will run at:
    - Frontend: http://localhost:3000
    - API: http://localhost:8000

### **Processing Schedule**
- Data Collection: Every 1 hour.
- Backend Processing:
    - Analysis: Every 1 hour.
    - Prediction: Once per day.