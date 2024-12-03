import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'

const environment_data = {
  BACKEND_DATA_API: 'http://localhost:8000',
}

//TREND MONTH
//Trend Temp
export const Chart_Trend_Temp_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.temp,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Temp',
          },
        ]}
        layout={{
          title: 'Trend Temperature Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Temperature (°C)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend pressure
export const Chart_Trend_Pressure_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Pressure',
          },
        ]}
        layout={{
          title: 'Trend Pressure Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Pressure (hPa)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend humidity
export const Chart_Trend_Humidity_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.humidity,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Humidity',
          },
        ]}
        layout={{
          title: 'Trend Humidity Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Humidity (%)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend clouds
export const Chart_Trend_Clouds_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Clouds',
          },
        ]}
        layout={{
          title: 'Trend Clouds Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Clouds (%)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend visibility
export const Chart_Trend_Visibility_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Visibility',
          },
        ]}
        layout={{
          title: 'Trend Visibility Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Visibility (km)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend wind_speed
export const Chart_Trend_Wind_Speed_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.wind_speed,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Wind Speed',
          },
        ]}
        layout={{
          title: 'Trend Wind Speed Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Wind Speed (m)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Trend wind_deg
export const Chart_Trend_Wind_Deg_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/resampleMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.month,
          temp: item.wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <Plot
        data={[
          {
            x: dtValues, // Sử dụng mảng dt
            y: tempValues, // Sử dụng mảng temp
            type: 'line',
            mode: 'lines', // Hiển thị cả đường và điểm
            name: 'Trend Wind Deg',
          },
        ]}
        layout={{
          title: 'Trend Wind Deg Over Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Wind Deg (°)' },
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}
