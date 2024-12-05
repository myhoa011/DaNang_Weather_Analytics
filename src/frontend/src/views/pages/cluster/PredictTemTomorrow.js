import React, { useEffect, useState } from 'react'
import styles from './TempTomorrow.module.css'
import { predictTempTomorrow, calculateSeasonProbabilities } from '../../../store/tempPredictStore'

// Ánh xạ cluster sang mùa
const clusterToSeason = {
  cluster_0: 'Spring',
  cluster_1: 'Winter',
  cluster_2: 'Summer',
  cluster_3: 'Autumn',
}

const TempTomorrow = () => {
  const [predictedTemp, setPredictedTemp] = useState(null)
  const [distances, setDistances] = useState({})
  const [probabilities, setProbabilities] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy nhiệt độ dự đoán
        const temp = await predictTempTomorrow()
        if (!temp) {
          setError('Failed to fetch predicted temperature.')
          return
        }
        setPredictedTemp(temp)

        // Lấy distances và probabilities từ API
        const result = await calculateSeasonProbabilities()
        if (!result || !result.result || !result.result.distances || !result.result.probabilities) {
          setError('Failed to fetch distances and probabilities.')
          return
        }
        setDistances(result.result.distances)
        setProbabilities(result.result.probabilities)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('An error occurred while fetching data.')
      }
    }

    fetchData()
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Temperature Prediction for Tomorrow</h1>

      {error && <div className={styles.error}>{error}</div>}

      {!error && predictedTemp !== null ? (
        <div className={styles.predictionCard}>
          <h2 className={styles.subtitle}>Predicted Temperature</h2>
          <div className={styles.tempValue}>{predictedTemp.toFixed(2)}°C</div>
        </div>
      ) : (
        !error && <div className={styles.loading}>Loading predicted temperature...</div>
      )}

      {!error && Object.keys(distances).length > 0 && Object.keys(probabilities).length > 0 ? (
        <div className={styles.results}>
          <h2 className={styles.subtitle}>Analysis</h2>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Distances to Centroids</h3>
            <ul className={styles.list}>
              {Object.entries(distances).map(([key, value]) => (
                <li key={key} className={styles.listItem}>
                  <strong>{clusterToSeason[key]}:</strong> {value.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Season Probabilities</h3>
            <ul className={styles.list}>
              {Object.entries(probabilities).map(([key, value]) => (
                <li key={key} className={styles.listItem}>
                  <strong>{clusterToSeason[key]}:</strong> {(value * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        !error && <div className={styles.loading}>Calculating distances and probabilities...</div>
      )}
    </div>
  )
}

export default TempTomorrow
