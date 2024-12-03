const URL = `http://localhost:8004/api`

export const predictTempTomorrow = async () => {
  try {
    const response = await fetch(`${URL}/predict-temp-tomorrow`)
    if (!response.ok) {
      throw new Error('Failed to fetch temperature prediction')
    }
    const data = await response.json()
    return data.temperature_tomorrow || null
  } catch (error) {
    console.error('Error fetching predicted temperature:', error)
    return null
  }
}

import { useCentroidsStore } from './centroidsStore'

export const calculateSeasonProbabilities = async () => {
  try {
    // Access the centroids store
    const centroidsStore = useCentroidsStore

    // Fetch and update centroids in the store
    await centroidsStore.getState().getCentroids()

    // Retrieve the updated centroids from the store
    const centroids = centroidsStore.getState().centroids

    if (!centroids || centroids.length === 0) {
      throw new Error('Centroids data is empty.')
    }

    // Get the predicted temperature from the API
    const temp = await predictTempTomorrow()
    if (temp === null) {
      throw new Error('Predicted temperature is invalid.')
    }

    // Calculate distances from temp to each centroid
    const distances = centroids.reduce((acc, centroid) => {
      acc[centroid.cluster_name] = Math.abs(temp - centroid.temp)
      return acc
    }, {})

    // Calculate the total inverse distance
    const totalInverseDistance = Object.values(distances).reduce(
      (sum, distance) => sum + 1 / distance,
      0,
    )

    // Calculate probabilities
    const probabilities = Object.entries(distances).reduce((acc, [cluster, distance]) => {
      acc[cluster] = (1 / distance) / totalInverseDistance
      return acc
    }, {})

    // Return the result in the desired format
    return {
      result: {
        distances,
        probabilities,
      },
    }
  } catch (error) {
    console.error('Error calculating probabilities:', error)
    return {
      result: {
        distances: {},
        probabilities: {},
      },
    }
  }
}
