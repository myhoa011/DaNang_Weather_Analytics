import React, { useEffect } from 'react'
import Plot from 'react-plotly.js'
import { useWeatherStore } from '../../../store/weatherStore'

const TemperaturePlot = () => {
  const { weatherData, getWeatherData } = useWeatherStore()
  useEffect(() => {
    getWeatherData()
  }, [getWeatherData])
  // Theo dõi sự thay đổi của weatherData
  useEffect(() => {
    console.log('Updated weatherData: ', weatherData)
  }, [weatherData])

  if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
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
      name: seasonName,
      marker: { color: colors[index], size: 10 },
    }
  })

  return (
    <Plot
      data={seasonTraces}
      layout={{
        title: 'Temperature Over Time by Season',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Temperature (°C)' },
        legend: { orientation: 'h' },
        margin: { l: 50, r: 50, t: 50, b: 50 },
        width: 1200,
        height: 800,
      }}
    />
  )
}

export default TemperaturePlot
