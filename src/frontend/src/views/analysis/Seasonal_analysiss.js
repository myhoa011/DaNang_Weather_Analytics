import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'

const environment_data = {
  BACKEND_DATA_API: 'http://localhost:8000',
}

//TEMP
//Observed
export const Chart_Observed_Temp = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Phân đoạn dữ liệu theo xu hướng tăng/giảm
  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < tempValues.length - 1; i++) {
    if (tempValues[i + 1] > tempValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_temp: item.observed_temp,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.observed_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Temp = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < tempValues.length - 1; i++) {
    if (tempValues[i + 1] > tempValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_temp: item.trend_temp,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.trend_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}


//seasonal
export const Chart_Seasonal_Temp = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < tempValues.length - 1; i++) {
    if (tempValues[i + 1] > tempValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_temp: item.seasonal_temp,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.seasonal_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Temp = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < tempValues.length - 1; i++) {
    if (tempValues[i + 1] > tempValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_temp: item.residual_temp,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.residual_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//PRESSURE
//Observed
export const Chart_Observed_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < pressureValues.length - 1; i++) {
    if (pressureValues[i + 1] > pressureValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(pressureValues[i], pressureValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(pressureValues[i], pressureValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_pressure: item.observed_pressure,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.observed_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Pressure (hPa)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < pressureValues.length - 1; i++) {
    if (pressureValues[i + 1] > pressureValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(pressureValues[i], pressureValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(pressureValues[i], pressureValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_pressure: item.trend_pressure,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.trend_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Pressure (hPa)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < pressureValues.length - 1; i++) {
    if (pressureValues[i + 1] > pressureValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(pressureValues[i], pressureValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(pressureValues[i], pressureValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_pressure: item.seasonal_pressure,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.seasonal_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Pressure (hPa)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < pressureValues.length - 1; i++) {
    if (pressureValues[i + 1] > pressureValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(pressureValues[i], pressureValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(pressureValues[i], pressureValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_pressure: item.residual_pressure,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.residual_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Pressure (hPa)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}


//HUMIDITY
//Observed
export const Chart_Observed_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [humidityValues, setHumidityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < humidityValues.length - 1; i++) {
    if (humidityValues[i + 1] > humidityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(humidityValues[i], humidityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(humidityValues[i], humidityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_humidity: item.observed_humidity,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.observed_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Humidity (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [humidityValues, setHumidityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < humidityValues.length - 1; i++) {
    if (humidityValues[i + 1] > humidityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(humidityValues[i], humidityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(humidityValues[i], humidityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_humidity: item.trend_humidity,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.trend_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Humidity (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [humidityValues, setHumidityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < humidityValues.length - 1; i++) {
    if (humidityValues[i + 1] > humidityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(humidityValues[i], humidityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(humidityValues[i], humidityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_humidity: item.seasonal_humidity,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.seasonal_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Humidity (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [humidityValues, setHumidityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < humidityValues.length - 1; i++) {
    if (humidityValues[i + 1] > humidityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(humidityValues[i], humidityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(humidityValues[i], humidityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_humidity: item.residual_humidity,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.residual_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Humidity (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}



//CLOUDS
//Observed
export const Chart_Observed_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < cloudsValues.length - 1; i++) {
    if (cloudsValues[i + 1] > cloudsValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_clouds: item.observed_clouds,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.observed_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Clouds (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < cloudsValues.length - 1; i++) {
    if (cloudsValues[i + 1] > cloudsValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_clouds: item.trend_clouds,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.trend_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Clouds (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < cloudsValues.length - 1; i++) {
    if (cloudsValues[i + 1] > cloudsValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_clouds: item.seasonal_clouds,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.seasonal_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Clouds (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < cloudsValues.length - 1; i++) {
    if (cloudsValues[i + 1] > cloudsValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(cloudsValues[i], cloudsValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_clouds: item.residual_clouds,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.residual_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Clouds (%)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}


//VISIBILITY
//Observed
export const Chart_Observed_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < visibilityValues.length - 1; i++) {
    if (visibilityValues[i + 1] > visibilityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_visibility: item.observed_visibility,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.observed_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Visibility (km)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < visibilityValues.length - 1; i++) {
    if (visibilityValues[i + 1] > visibilityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_visibility: item.trend_visibility,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.trend_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Visibility (km)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < visibilityValues.length - 1; i++) {
    if (visibilityValues[i + 1] > visibilityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_visibility: item.seasonal_visibility,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.seasonal_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Visibility (km)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < visibilityValues.length - 1; i++) {
    if (visibilityValues[i + 1] > visibilityValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(visibilityValues[i], visibilityValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_visibility: item.residual_visibility,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.residual_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Visibility (km)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//WIND_SPEED
//Observed
export const Chart_Observed_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windSpeedValues, setWindSpeedValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windSpeedValues.length - 1; i++) {
    if (windSpeedValues[i + 1] > windSpeedValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_wind_speed: item.observed_wind_speed,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindSpeedValues(extractedData.map((item) => item.observed_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Speed (m/s)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windSpeedValues, setWindSpeedValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windSpeedValues.length - 1; i++) {
    if (windSpeedValues[i + 1] > windSpeedValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_wind_speed: item.trend_wind_speed,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindSpeedValues(extractedData.map((item) => item.trend_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Speed (m/s)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windSpeedValues, setWindSpeedValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windSpeedValues.length - 1; i++) {
    if (windSpeedValues[i + 1] > windSpeedValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_wind_speed: item.seasonal_wind_speed,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindSpeedValues(extractedData.map((item) => item.seasonal_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Speed (m/s)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windSpeedValues, setWindSpeedValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windSpeedValues.length - 1; i++) {
    if (windSpeedValues[i + 1] > windSpeedValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windSpeedValues[i], windSpeedValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_wind_speed: item.residual_wind_speed,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindSpeedValues(extractedData.map((item) => item.residual_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Speed (m/s)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}


//WIND_DEG
//Observed
export const Chart_Observed_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windDegValues, setWindDegValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windDegValues.length - 1; i++) {
    if (windDegValues[i + 1] > windDegValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windDegValues[i], windDegValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windDegValues[i], windDegValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_wind_deg: item.observed_wind_deg,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindDegValues(extractedData.map((item) => item.observed_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Direction (°)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//trend
export const Chart_Trend_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windDegValues, setWindDegValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windDegValues.length - 1; i++) {
    if (windDegValues[i + 1] > windDegValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windDegValues[i], windDegValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windDegValues[i], windDegValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_wind_deg: item.trend_wind_deg,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindDegValues(extractedData.map((item) => item.trend_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Direction (°)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//seasonal
export const Chart_Seasonal_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windDegValues, setWindDegValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windDegValues.length - 1; i++) {
    if (windDegValues[i + 1] > windDegValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windDegValues[i], windDegValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windDegValues[i], windDegValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_wind_deg: item.seasonal_wind_deg,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindDegValues(extractedData.map((item) => item.seasonal_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Direction (°)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

//residual
export const Chart_Residual_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [windDegValues, setWindDegValues] = useState([])

  let upSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'green' },
    name: 'Up',
  }
  let downSegments = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' },
    name: 'Down',
  }

  for (let i = 0; i < windDegValues.length - 1; i++) {
    if (windDegValues[i + 1] > windDegValues[i]) {
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(windDegValues[i], windDegValues[i + 1])
      downSegments.x.push(null)
      downSegments.y.push(null)
    } else {
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(windDegValues[i], windDegValues[i + 1])
      upSegments.x.push(null)
      upSegments.y.push(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_wind_deg: item.residual_wind_deg,
        }))

        setChartData(extractedData)
        setDtValues(extractedData.map((item) => item.dt))
        setWindDegValues(extractedData.map((item) => item.residual_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Plot
      data={[upSegments, downSegments]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 30, b: 50 },
        height: 280,
        xaxis: {
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Wind Direction (°)',
          },
        },
        showlegend: true,
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}