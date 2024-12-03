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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_temp: item.observed_temp,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.observed_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Temp = () => {
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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_temp: item.trend_temp,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.trend_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Temp = () => {
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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_temp: item.seasonal_temp,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.seasonal_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//residual
export const Chart_Residual_Temp = () => {
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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_temp: item.residual_temp,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.residual_temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//PRESSURE
//Observed
export const Chart_Observed_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_pressure: item.observed_pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPressureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_pressure: item.trend_pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.trend_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPressureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_pressure: item.seasonal_pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.seasonal_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//residual
export const Chart_Residual_Pressure = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPressureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_pressure: item.residual_pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.residual_pressure))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//HUMMIDITY
//Observed
export const Chart_Observed_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_humidity: item.observed_humidity,
        }))

        setChartData(extractedData)

        // Tách riêng dt và humidity thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setHumidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_humidity: item.trend_humidity,
        }))

        setChartData(extractedData)

        // Tách riêng dt và humidity thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.trend_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'Humidiry (%)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHmidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_humidity: item.seasonal_humidity,
        }))

        setChartData(extractedData)

        // Tách riêng dt và humidity thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHmidityValues(extractedData.map((item) => item.seasonal_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'HmidityValues (%)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//residual
export const Chart_Residual_Humidity = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHumidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_humidity: item.residual_humidity,
        }))

        setChartData(extractedData)

        // Tách riêng dt và humidity thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHumidityValues(extractedData.map((item) => item.residual_humidity))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}



//CLOUDS
//Observed
export const Chart_Observed_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_clouds: item.observed_clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setCloudsValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_clouds: item.trend_clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.trend_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHmidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_clouds: item.seasonal_clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHmidityValues(extractedData.map((item) => item.seasonal_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//residual
export const Chart_Residual_Clouds = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setCloudsValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_clouds: item.residual_clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.residual_clouds))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//VISIBILITY
//Observed
export const Chart_Observed_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_visibility: item.observed_visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setvisibilityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_visibility: item.trend_visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setvisibilityValues(extractedData.map((item) => item.trend_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHmidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_visibility: item.seasonal_visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHmidityValues(extractedData.map((item) => item.seasonal_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//residual
export const Chart_Residual_Visibility = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setvisibilityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_visibility: item.residual_visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setvisibilityValues(extractedData.map((item) => item.residual_visibility))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}




//WIND_SPEED
//Observed
export const Chart_Observed_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_wind_speed: item.observed_wind_speed,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_speed thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//trend
export const Chart_Trend_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setwind_speedValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_wind_speed: item.trend_wind_speed,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_speed thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setwind_speedValues(extractedData.map((item) => item.trend_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHmidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_wind_speed: item.seasonal_wind_speed,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_speed thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHmidityValues(extractedData.map((item) => item.seasonal_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//residual
export const Chart_Residual_Wind_Speed = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setwind_speedValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_wind_speed: item.residual_wind_speed,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_speed thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setwind_speedValues(extractedData.map((item) => item.residual_wind_speed))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
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
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//WIND_DEG
//Observed
export const Chart_Observed_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setPessureValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          observed_wind_deg: item.observed_wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_deg thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPessureValues(extractedData.map((item) => item.observed_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Observed',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'Wind Deg (°)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//trend
export const Chart_Trend_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setwind_degValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          trend_wind_deg: item.trend_wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_deg thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setwind_degValues(extractedData.map((item) => item.trend_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Trend',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'Wind Deg (°)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//seasonal
export const Chart_Seasonal_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setHmidityValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          seasonal_wind_deg: item.seasonal_wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_deg thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setHmidityValues(extractedData.map((item) => item.seasonal_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Seasonal',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'Wind Deg (°)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//residual
export const Chart_Residual_Wind_Deg = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues,setwind_degValues] = useState([])

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
      // Đi lên
      upSegments.x.push(dtValues[i], dtValues[i + 1])
      upSegments.y.push(tempValues[i], tempValues[i + 1])
      downSegments.x.push(null) // Ngắt đoạn
      downSegments.y.push(null) // Ngắt đoạn
    } else {
      // Đi xuống
      downSegments.x.push(dtValues[i], dtValues[i + 1])
      downSegments.y.push(tempValues[i], tempValues[i + 1])
      upSegments.x.push(null) // Ngắt đoạn
      upSegments.y.push(null) // Ngắt đoạn
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/seasonal`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.dt,
          residual_wind_deg: item.residual_wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và wind_deg thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setwind_degValues(extractedData.map((item) => item.residual_wind_deg))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[upSegments, downSegments]}
        layout={{
          title: {
            text: 'Residual',
          },
          xaxis: {
            title: {
              text: 'Date',
            },
          },
          yaxis: {
            title: {
              text: 'Wind Deg (°)',
            },
          },
          showlegend: true, // Hiển thị chú thích
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}