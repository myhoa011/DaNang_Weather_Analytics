import React, { useEffect } from 'react'
import Plot from 'react-plotly.js'
import { useWeatherStore } from '../../../store/weatherStore'
import { useCentroidsStore } from '../../../store/centroidsStore'

const TemperaturePlot = () => {
  const { weatherData, getWeatherData } = useWeatherStore()
  const { centroids, getCentroids } = useCentroidsStore()

  useEffect(() => {
    getWeatherData()
    getCentroids()
  }, [getWeatherData, getCentroids])

  useEffect(() => {
    console.log('Updated weatherData: ', weatherData)
    console.log('Updated centroids: ', centroids)
  }, [weatherData, centroids])

  if (
    !weatherData ||
    !Array.isArray(weatherData) ||
    weatherData.length === 0 ||
    !centroids ||
    !Array.isArray(centroids) ||
    centroids.length === 0
  ) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div className="spinner" style={{ marginBottom: '10px' }}></div>
        <div>Loading... ĐỢI NHIỀU TÍ</div>
        <div>Góc đỗ lỗi: do data nhiều load lâu chớ không phải bug đâu. Tính năng cả đấy</div>
        <div>Tí load lên rồi, vẫn còn lag đấy. Hãy thật bình tĩnh khi sử dụng tính năng</div>
      </div>
    )
  }

  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
  const colors = ['green', 'orange', 'brown', 'blue']

  const seasonTraces = seasons.map((seasonName, index) => {
    const seasonData = weatherData.filter((item) => item.custom_label === index)

    return {
      x: seasonData.map((item) => item.date),
      y: seasonData.map((item) => item.temp),
      mode: 'markers',
      type: 'scattergl', // Sử dụng 'scattergl' để kích hoạt WebGL
      name: seasonName,
      marker: { color: colors[index], size: 5 },
    }
  })

  // Chuẩn bị dữ liệu centroids để hiển thị
  const centroidsTraces = centroids.map((centroid, index) => {
    return {
      x: [centroid.date],
      y: [centroid.temp],
      mode: 'markers',
      type: 'scatter',
      name: `Centroid ${index + 1}`,
      marker: { color: 'red', size: 10, symbol: 'star' },
    }
  })

  const clusterNameToSeason = {
    cluster_0: 'Winter',
    cluster_1: 'Spring',
    cluster_2: 'Summer',
    cluster_3: 'Autumn',
  }

  return (
    <>
      <Plot
        data={[...seasonTraces, ...centroidsTraces]}
        layout={{
          title: 'Temperature Over Time by Season with Centroids',
          xaxis: { title: 'Date' },
          yaxis: { title: 'Temperature (°C)' },
          legend: { orientation: 'h' },
          margin: { l: 50, r: 50, t: 50, b: 50 },
          width: 1200,
          height: 800,
        }}
        config={{ responsive: true }}
      />

      <div style={{ padding: '20px' }}>
        <h3>Centroids</h3>
        {centroids.map((centroid, index) => {
          const seasonName = clusterNameToSeason[centroid.cluster_name] || 'Unknown'
          return (
            <div key={index}>
              <strong>{seasonName}</strong> Temp: {centroid.temp}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default TemperaturePlot
