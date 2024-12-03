import React, { useState } from 'react'
import { predictSeasonForDay } from '../../../store/seasonForDayStore'
import styles from './WeatherPrediction.module.css' // Sử dụng CSS Module

const WeatherSeasonPredictor = () => {
  const [weatherData, setWeatherData] = useState({
    temp: '',
    pressure: '',
    humidity: '',
    clouds: '',
    visibility: '',
    wind_speed: '',
    wind_deg: '',
  })
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setWeatherData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPrediction(null)

    try {
      // Chuyển đổi dữ liệu từ chuỗi sang số trước khi gửi
      const parsedData = {
        temp: parseFloat(weatherData.temp),
        pressure: parseInt(weatherData.pressure),
        humidity: parseInt(weatherData.humidity),
        clouds: parseInt(weatherData.clouds),
        visibility: parseInt(weatherData.visibility),
        wind_speed: parseFloat(weatherData.wind_speed),
        wind_deg: parseInt(weatherData.wind_deg),
      }

      const result = await predictSeasonForDay(parsedData)
      setPrediction(result.season || 'Unknown')
    } catch (err) {
      setError('Failed to predict season. Please check your input and try again.')
    }
  }

  return (
    <div className={styles['weather-predictor-container']}>
      <h1 className={styles['weather-predictor-title']}>Weather Season Predictor</h1>
      <form className={styles['weather-predictor-form']} onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Temperature (°C):</label>
          <input
            type="number"
            name="temp"
            value={weatherData.temp}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Pressure (hPa):</label>
          <input
            type="number"
            name="pressure"
            value={weatherData.pressure}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Humidity (%):</label>
          <input
            type="number"
            name="humidity"
            value={weatherData.humidity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Cloud Cover (%):</label>
          <input
            type="number"
            name="clouds"
            value={weatherData.clouds}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Visibility (m):</label>
          <input
            type="number"
            name="visibility"
            value={weatherData.visibility}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Wind Speed (m/s):</label>
          <input
            type="number"
            name="wind_speed"
            value={weatherData.wind_speed}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Wind Direction (°):</label>
          <input
            type="number"
            name="wind_deg"
            value={weatherData.wind_deg}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className={styles['submit-button']} type="submit">
          Predict Season
        </button>
      </form>

      {error && <div className={styles['error-message']}>{error}</div>}
      {prediction && (
        <div className={styles['result']}>
          <h2>Predicted Season: {prediction}</h2>
        </div>
      )}
    </div>
  )
}

export default WeatherSeasonPredictor
