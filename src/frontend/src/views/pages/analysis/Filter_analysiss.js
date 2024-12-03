import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'

const environment_data = {
  BACKEND_DATA_API: 'http://localhost:8000',
}

//Filter Day Tem
export const Chart_Filter_Temp_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên nhiệt độ
  const getColorForTemperature = (temp) => {
    if (temp < 15) {
      return 'blue' // Màu xanh cho nhiệt độ thấp
    } else if (temp >= 15 && temp <= 30) {
      return 'green' // Màu xanh lá cho nhiệt độ thường
    } else {
      return 'red' // Màu đỏ cho nhiệt độ cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.date,
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: tempValues.map(getColorForTemperature),
              size: 8,
            },
            line: {
              color: tempValues.map(getColorForTemperature),
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Temperature Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Temperature (°C)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Temperature Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 15°C (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 15-30°C (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 30°C (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Filter_Week_Temp
export const Chart_Filter_Temp_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên nhiệt độ
  const getColorForTemperature = (temp) => {
    if (temp < 15) {
      return 'blue' // Màu xanh cho nhiệt độ thấp
    } else if (temp >= 15 && temp <= 30) {
      return 'green' // Màu xanh lá cho nhiệt độ thường
    } else {
      return 'red' // Màu đỏ cho nhiệt độ cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.year_week,
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: tempValues.map(getColorForTemperature),
              size: 8,
            },
            line: {
              color: tempValues.map(getColorForTemperature),
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Temperature Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Temperature (°C)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Temperature Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 15°C (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 15-30°C (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 30°C (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//Filter_Month_Temp
export const Chart_Filter_Temp_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên nhiệt độ
  const getColorForTemperature = (temp) => {
    if (temp < 15) {
      return 'blue' // Màu xanh cho nhiệt độ thấp
    } else if (temp >= 15 && temp <= 30) {
      return 'green' // Màu xanh lá cho nhiệt độ thường
    } else {
      return 'red' // Màu đỏ cho nhiệt độ cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: tempValues.map(getColorForTemperature),
              size: 8,
            },
            line: {
              color: tempValues.map(getColorForTemperature),
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Temperature Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Temperature (°C)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Temperature Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 15°C (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 15-30°C (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 30°C (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//độ ẩm
//ĐỘ ẨM DAY
export const Chart_Filter_Humidity_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên độ ẩm
  function getColorForHumidity(humidity) {
    if (humidity < 40) {
      return 'blue' // Màu xanh cho độ ẩm thấp
    } else if (humidity >= 40 && humidity <= 70) {
      return 'green' // Màu xanh lá cho độ ẩm trung bình
    } else {
      return 'red' // Màu đỏ cho độ ẩm cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.date,
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng humidity
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Humidity',

            marker: {
              color: tempValues.map(getColorForHumidity), // Màu sắc từng điểm dựa trên độ ẩm
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Humidity Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Humidity (%)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Humidity Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 40% (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 40-70% (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 70% (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//ĐỘ ẨM WEEK
export const Chart_Filter_Humidity_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên độ ẩm
  function getColorForHumidity(humidity) {
    if (humidity < 40) {
      return 'blue' // Màu xanh cho độ ẩm thấp
    } else if (humidity >= 40 && humidity <= 70) {
      return 'green' // Màu xanh lá cho độ ẩm trung bình
    } else {
      return 'red' // Màu đỏ cho độ ẩm cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.year_week,
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng humidity
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Humidity',

            marker: {
              color: tempValues.map(getColorForHumidity), // Màu sắc từng điểm dựa trên độ ẩm
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Humidity Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Humidity (%)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Humidity Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 40% (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 40-70% (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 70% (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//ĐỘ ẨM MONTH
export const Chart_Filter_Humidity_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên độ ẩm
  function getColorForHumidity(humidity) {
    if (humidity < 40) {
      return 'blue' // Màu xanh cho độ ẩm thấp
    } else if (humidity >= 40 && humidity <= 70) {
      return 'green' // Màu xanh lá cho độ ẩm trung bình
    } else {
      return 'red' // Màu đỏ cho độ ẩm cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng humidity
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Humidity',

            marker: {
              color: tempValues.map(getColorForHumidity), // Màu sắc từng điểm dựa trên độ ẩm
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Humidity Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Humidity (%)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Humidity Color Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Low: < 40% (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Normal: 40-70% (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• High: > 70% (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//hướng gió
//HƯỚNG GIÓ DAY
export const Chart_Filter_Wind_Deg_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])
  const [windDirections, setwindDirections] = useState([])

  // Màu sắc dựa trên hướng gió
  const directionColors = {
    N: 'blue',
    NE: 'cyan',
    E: 'green',
    SE: 'lime',
    S: 'yellow',
    SW: 'orange',
    W: 'red',
    NW: 'purple',
  }

  // Hàm chuyển đổi từ wind_deg sang hướng gió
  function getWindDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(deg / 45) % 8 // Mỗi hướng chiếm 45 độ
    return directions[index]
  }

  const pointColors = windDirections.map((dir) => directionColors[dir])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.date,
          temp: item.wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
        setwindDirections(extractedData.map((item) => getWindDirection(item.temp)))
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers+text', // Hiển thị cả đường, điểm và text
            name: 'Wind Degree',
            marker: {
              color: pointColors, // Màu sắc từng điểm dựa trên hướng gió
              size: 8,
            },
            text: windDirections, // Text hiển thị hướng gió
            textposition: 'top center', // Vị trí text trên điểm
            line: {
              color: 'grey',
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Daily Wind Direction and Degree',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Wind Degree (°)' },
          showlegend: true,
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//HƯỚNG GIÓ WEEK
export const Chart_Filter_Wind_Deg_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])
  const [windDirections, setwindDirections] = useState([])

  // Màu sắc dựa trên hướng gió
  const directionColors = {
    N: 'blue',
    NE: 'cyan',
    E: 'green',
    SE: 'lime',
    S: 'yellow',
    SW: 'orange',
    W: 'red',
    NW: 'purple',
  }

  // Hàm chuyển đổi từ wind_deg sang hướng gió
  function getWindDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(deg / 45) % 8 // Mỗi hướng chiếm 45 độ
    return directions[index]
  }

  const pointColors = windDirections.map((dir) => directionColors[dir])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.year_week,
          temp: item.wind_deg,
        }))

        setChartData(extractedData)

        // Tách riêng dt và temp thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setTempValues(extractedData.map((item) => item.temp))
        setwindDirections(extractedData.map((item) => getWindDirection(item.temp)))
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers+text', // Hiển thị cả đường, điểm và text
            name: 'Wind Degree',
            marker: {
              color: pointColors, // Màu sắc từng điểm dựa trên hướng gió
              size: 8,
            },
            text: windDirections, // Text hiển thị hướng gió
            textposition: 'top center', // Vị trí text trên điểm
            line: {
              color: 'grey',
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Weekly Wind Direction and Degree',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Wind Degree (°)' },
          showlegend: true,
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//HƯỚNG GIÓ MONTH
export const Chart_Filter_Wind_Deg_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])
  const [windDirections, setwindDirections] = useState([])

  // Màu sắc dựa trên hướng gió
  const directionColors = {
    N: 'blue',
    NE: 'cyan',
    E: 'green',
    SE: 'lime',
    S: 'yellow',
    SW: 'orange',
    W: 'red',
    NW: 'purple',
  }

  // Hàm chuyển đổi từ wind_deg sang hướng gió
  function getWindDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(deg / 45) % 8 // Mỗi hướng chiếm 45 độ
    return directions[index]
  }

  const pointColors = windDirections.map((dir) => directionColors[dir])

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
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
        setwindDirections(extractedData.map((item) => getWindDirection(item.temp)))
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
            x: dtValues,
            y: tempValues,
            type: 'scatter',
            mode: 'lines+markers+text', // Hiển thị cả đường, điểm và text
            name: 'Wind Degree',
            marker: {
              color: pointColors, // Màu sắc từng điểm dựa trên hướng gió
              size: 8,
            },
            text: windDirections, // Text hiển thị hướng gió
            textposition: 'top center', // Vị trí text trên điểm
            line: {
              color: 'grey',
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Monthly Wind Direction and Degree',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Wind Degree (°)' },
          showlegend: true,
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//tốc độ gió
// SPEED DAY
export const Chart_Filter_Wind_Speed_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên tốc độ gió
  function getColorForWindSpeed(speed) {
    if (speed < 5) {
      return 'blue' // Màu xanh cho gió nhẹ
    } else if (speed >= 5 && speed <= 10) {
      return 'green' // Màu xanh lá cho gió vừa
    } else {
      return 'red' // Màu đỏ cho gió mạnh
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.date,
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng wind_speed
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Wind Speed',

            marker: {
              color: tempValues.map(getColorForWindSpeed), // Màu sắc từng điểm dựa trên tốc độ gió
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Wind Speed Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Wind Speed (m/s)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Wind Speed Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Light: < 5 m/s (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Moderate: 5-10 m/s (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Strong: > 10 m/s (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// SPEED WEEk
export const Chart_Filter_Wind_Speed_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên tốc độ gió
  function getColorForWindSpeed(speed) {
    if (speed < 5) {
      return 'blue' // Màu xanh cho gió nhẹ
    } else if (speed >= 5 && speed <= 10) {
      return 'green' // Màu xanh lá cho gió vừa
    } else {
      return 'red' // Màu đỏ cho gió mạnh
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và temp
        const extractedData = data.map((item) => ({
          dt: item.year_week,
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng wind_speed
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Wind Speed',

            marker: {
              color: tempValues.map(getColorForWindSpeed), // Màu sắc từng điểm dựa trên tốc độ gió
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Wind Speed Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Wind Speed (m/s)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Wind Speed Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Light: < 5 m/s (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Moderate: 5-10 m/s (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Strong: > 10 m/s (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// SPEED MONTH
export const Chart_Filter_Wind_Speed_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  // Hàm để xác định màu dựa trên tốc độ gió
  function getColorForWindSpeed(speed) {
    if (speed < 5) {
      return 'blue' // Màu xanh cho gió nhẹ
    } else if (speed >= 5 && speed <= 10) {
      return 'green' // Màu xanh lá cho gió vừa
    } else {
      return 'red' // Màu đỏ cho gió mạnh
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
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
            x: dtValues, // Sử dụng mảng date
            y: tempValues, // Sử dụng mảng wind_speed
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Wind Speed',

            marker: {
              color: tempValues.map(getColorForWindSpeed), // Màu sắc từng điểm dựa trên tốc độ gió
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Wind Speed Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Wind Speed (m/s)' },

          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Wind Speed Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Light: < 5 m/s (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Moderate: 5-10 m/s (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Strong: > 10 m/s (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//tầm nhìn xa
// TẦM NHÌN XA DAY
export const Chart_Filter_Visibility_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  // Hàm để xác định màu dựa trên tầm nhìn
  const getColorForVisibility = (visibility) => {
    if (visibility < 1) {
      return 'red' // Tầm nhìn ngắn: Dưới 1 km (Màu đỏ)
    } else if (visibility >= 1 && visibility < 3) {
      return 'orange' // Tầm nhìn trung bình: 1-3 km (Màu cam)
    } else if (visibility >= 3 && visibility <= 10) {
      return 'green' // Tầm nhìn xa: 3-10 km (Màu xanh lá)
    } else {
      return 'blue' // Tầm nhìn rất xa: Trên 10 km (Màu xanh dương)
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và visibility
        const extractedData = data.map((item) => ({
          dt: item.date,
          visibility: item.visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.visibility))
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
            x: dtValues, // Sử dụng mảng date
            y: visibilityValues, // Sử dụng mảng visibility
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Visibility',
            marker: {
              color: visibilityValues.map(getColorForVisibility), // Màu sắc từng điểm dựa trên tầm nhìn
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Visibility Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Visibility (km)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Visibility Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Short: < 1 km (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Medium: 1-3 km (Orange)',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Far: 3-10 km (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Far: > 10 km (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// TẦM NHÌN XA WEEK
export const Chart_Filter_Visibility_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  // Hàm để xác định màu dựa trên tầm nhìn
  const getColorForVisibility = (visibility) => {
    if (visibility < 1) {
      return 'red' // Tầm nhìn ngắn: Dưới 1 km (Màu đỏ)
    } else if (visibility >= 1 && visibility < 3) {
      return 'orange' // Tầm nhìn trung bình: 1-3 km (Màu cam)
    } else if (visibility >= 3 && visibility <= 10) {
      return 'green' // Tầm nhìn xa: 3-10 km (Màu xanh lá)
    } else {
      return 'blue' // Tầm nhìn rất xa: Trên 10 km (Màu xanh dương)
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và visibility
        const extractedData = data.map((item) => ({
          dt: item.year_week,
          visibility: item.visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.visibility))
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
            x: dtValues, // Sử dụng mảng date
            y: visibilityValues, // Sử dụng mảng visibility
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Visibility',
            marker: {
              color: visibilityValues.map(getColorForVisibility), // Màu sắc từng điểm dựa trên tầm nhìn
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Visibility Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Visibility (km)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Visibility Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Short: < 1 km (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Medium: 1-3 km (Orange)',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Far: 3-10 km (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Far: > 10 km (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//TẦM NHÌN XA MONTH
export const Chart_Filter_Visibility_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [visibilityValues, setVisibilityValues] = useState([])

  // Hàm để xác định màu dựa trên tầm nhìn
  const getColorForVisibility = (visibility) => {
    if (visibility < 1) {
      return 'red' // Tầm nhìn ngắn: Dưới 1 km (Màu đỏ)
    } else if (visibility >= 1 && visibility < 3) {
      return 'orange' // Tầm nhìn trung bình: 1-3 km (Màu cam)
    } else if (visibility >= 3 && visibility <= 10) {
      return 'green' // Tầm nhìn xa: 3-10 km (Màu xanh lá)
    } else {
      return 'blue' // Tầm nhìn rất xa: Trên 10 km (Màu xanh dương)
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và visibility
        const extractedData = data.map((item) => ({
          dt: item.month,
          visibility: item.visibility,
        }))

        setChartData(extractedData)

        // Tách riêng dt và visibility thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setVisibilityValues(extractedData.map((item) => item.visibility))
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
            x: dtValues, // Sử dụng mảng date
            y: visibilityValues, // Sử dụng mảng visibility
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Visibility',
            marker: {
              color: visibilityValues.map(getColorForVisibility), // Màu sắc từng điểm dựa trên tầm nhìn
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Visibility Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Visibility (km)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Visibility Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Short: < 1 km (Red)',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Medium: 1-3 km (Orange)',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Far: 3-10 km (Green)',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Far: > 10 km (Blue)',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//độ che phủ mây
// ĐỘ CHE PHỦ DAY
export const Chart_Filter_Clouds_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  // Hàm để xác định màu dựa trên độ che phủ mây
  const getColorForCloudCoverage = (cloudCoverage) => {
    if (cloudCoverage === 0) {
      return 'blue' // Không có mây: Trời quang đãng
    } else if (cloudCoverage > 0 && cloudCoverage <= 25) {
      return 'lightblue' // Rải rác: Vài đám mây nhỏ
    } else if (cloudCoverage > 25 && cloudCoverage <= 50) {
      return 'yellow' // Ít: Một phần bầu trời bị che
    } else if (cloudCoverage > 50 && cloudCoverage <= 75) {
      return 'orange' // Trung bình: Phần lớn bầu trời bị che
    } else {
      return 'gray' // Nhiều: Gần như hoàn toàn bị mây che phủ
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và clouds
        const extractedData = data.map((item) => ({
          dt: item.date,
          clouds: item.clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.clouds))
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
            x: dtValues, // Sử dụng mảng date
            y: cloudsValues, // Sử dụng mảng clouds
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Cloud Coverage',
            marker: {
              color: cloudsValues.map(getColorForCloudCoverage), // Màu sắc từng điểm dựa trên độ che phủ mây
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Cloud Coverage Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Cloud Coverage (%)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Cloud Coverage Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Clear (0%): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Scattered (1-25%): Light Blue',
              showarrow: false,
              font: { color: 'lightblue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Few (26-50%): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Mostly Cloudy (51-75%): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Overcast (76-100%): Gray',
              showarrow: false,
              font: { color: 'gray', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//DỘ CHE PHU WEEK
export const Chart_Filter_Clouds_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  // Hàm để xác định màu dựa trên độ che phủ mây
  const getColorForCloudCoverage = (cloudCoverage) => {
    if (cloudCoverage === 0) {
      return 'blue' // Không có mây: Trời quang đãng
    } else if (cloudCoverage > 0 && cloudCoverage <= 25) {
      return 'lightblue' // Rải rác: Vài đám mây nhỏ
    } else if (cloudCoverage > 25 && cloudCoverage <= 50) {
      return 'yellow' // Ít: Một phần bầu trời bị che
    } else if (cloudCoverage > 50 && cloudCoverage <= 75) {
      return 'orange' // Trung bình: Phần lớn bầu trời bị che
    } else {
      return 'gray' // Nhiều: Gần như hoàn toàn bị mây che phủ
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và clouds
        const extractedData = data.map((item) => ({
          dt: item.year_week,
          clouds: item.clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.clouds))
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
            x: dtValues, // Sử dụng mảng date
            y: cloudsValues, // Sử dụng mảng clouds
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Cloud Coverage',
            marker: {
              color: cloudsValues.map(getColorForCloudCoverage), // Màu sắc từng điểm dựa trên độ che phủ mây
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Cloud Coverage Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Cloud Coverage (%)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Cloud Coverage Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Clear (0%): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Scattered (1-25%): Light Blue',
              showarrow: false,
              font: { color: 'lightblue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Few (26-50%): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Mostly Cloudy (51-75%): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Overcast (76-100%): Gray',
              showarrow: false,
              font: { color: 'gray', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// ĐỘ CHE PHỦ MONTH
export const Chart_Filter_Clouds_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [cloudsValues, setCloudsValues] = useState([])

  // Hàm để xác định màu dựa trên độ che phủ mây
  const getColorForCloudCoverage = (cloudCoverage) => {
    if (cloudCoverage === 0) {
      return 'blue' // Không có mây: Trời quang đãng
    } else if (cloudCoverage > 0 && cloudCoverage <= 25) {
      return 'lightblue' // Rải rác: Vài đám mây nhỏ
    } else if (cloudCoverage > 25 && cloudCoverage <= 50) {
      return 'yellow' // Ít: Một phần bầu trời bị che
    } else if (cloudCoverage > 50 && cloudCoverage <= 75) {
      return 'orange' // Trung bình: Phần lớn bầu trời bị che
    } else {
      return 'gray' // Nhiều: Gần như hoàn toàn bị mây che phủ
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và clouds
        const extractedData = data.map((item) => ({
          dt: item.month,
          clouds: item.clouds,
        }))

        setChartData(extractedData)

        // Tách riêng dt và clouds thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setCloudsValues(extractedData.map((item) => item.clouds))
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
            x: dtValues, // Sử dụng mảng date
            y: cloudsValues, // Sử dụng mảng clouds
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Cloud Coverage',
            marker: {
              color: cloudsValues.map(getColorForCloudCoverage), // Màu sắc từng điểm dựa trên độ che phủ mây
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Cloud Coverage Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Cloud Coverage (%)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Cloud Coverage Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Clear (0%): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• Scattered (1-25%): Light Blue',
              showarrow: false,
              font: { color: 'lightblue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Few (26-50%): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Mostly Cloudy (51-75%): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Overcast (76-100%): Gray',
              showarrow: false,
              font: { color: 'gray', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

//áp suất
// ÁP SUẤT DAY
export const Chart_Filter_Pressure_Day = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  // Hàm để xác định màu dựa trên áp suất
  const getColorForPressure = (pressure) => {
    if (pressure < 980) {
      return 'red' // Áp suất cực thấp (nguy hiểm)
    } else if (pressure >= 980 && pressure < 990) {
      return 'orange' // Áp suất rất thấp (bão)
    } else if (pressure >= 990 && pressure < 1013) {
      return 'yellow' // Áp suất thấp
    } else if (pressure >= 1013 && pressure <= 1022) {
      return 'green' // Áp suất bình thường
    } else {
      return 'blue' // Áp suất cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterDay`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và pressure
        const extractedData = data.map((item) => ({
          dt: item.date,
          pressure: item.pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.pressure))
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
            x: dtValues, // Sử dụng mảng date
            y: pressureValues, // Sử dụng mảng áp suất
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Pressure',
            marker: {
              color: pressureValues.map(getColorForPressure), // Màu sắc từng điểm dựa trên áp suất
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Pressure Over Time',
          xaxis: { title: 'Day' },
          yaxis: { title: 'Pressure (hPa)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Pressure Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Normal (1013-1022 hPa): Green',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• High (> 1022 hPa): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Low (990-1013 hPa): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Low (980-990 hPa): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Extremely Low (< 980 hPa): Red',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// ÁP SUẤT WEEK
export const Chart_Filter_Pressure_Week = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  // Hàm để xác định màu dựa trên áp suất
  const getColorForPressure = (pressure) => {
    if (pressure < 980) {
      return 'red' // Áp suất cực thấp (nguy hiểm)
    } else if (pressure >= 980 && pressure < 990) {
      return 'orange' // Áp suất rất thấp (bão)
    } else if (pressure >= 990 && pressure < 1013) {
      return 'yellow' // Áp suất thấp
    } else if (pressure >= 1013 && pressure <= 1022) {
      return 'green' // Áp suất bình thường
    } else {
      return 'blue' // Áp suất cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterWeek`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và pressure
        const extractedData = data.map((item) => ({
          dt: item.year_week,
          pressure: item.pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.pressure))
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
            x: dtValues, // Sử dụng mảng date
            y: pressureValues, // Sử dụng mảng áp suất
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Pressure',
            marker: {
              color: pressureValues.map(getColorForPressure), // Màu sắc từng điểm dựa trên áp suất
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Pressure Over Time',
          xaxis: { title: 'Week' },
          yaxis: { title: 'Pressure (hPa)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Pressure Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Normal (1013-1022 hPa): Green',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• High (> 1022 hPa): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Low (990-1013 hPa): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Low (980-990 hPa): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Extremely Low (< 980 hPa): Red',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}

// ÁP SUẤT MONTH
export const Chart_Filter_Pressure_Month = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [pressureValues, setPressureValues] = useState([])

  // Hàm để xác định màu dựa trên áp suất
  const getColorForPressure = (pressure) => {
    if (pressure < 980) {
      return 'red' // Áp suất cực thấp (nguy hiểm)
    } else if (pressure >= 980 && pressure < 990) {
      return 'orange' // Áp suất rất thấp (bão)
    } else if (pressure >= 990 && pressure < 1013) {
      return 'yellow' // Áp suất thấp
    } else if (pressure >= 1013 && pressure <= 1022) {
      return 'green' // Áp suất bình thường
    } else {
      return 'blue' // Áp suất cao
    }
  }

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/filterMonth`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Lấy danh sách chỉ chứa dt và pressure
        const extractedData = data.map((item) => ({
          dt: item.month,
          pressure: item.pressure,
        }))

        setChartData(extractedData)

        // Tách riêng dt và pressure thành 2 mảng
        setDtValues(extractedData.map((item) => item.dt))
        setPressureValues(extractedData.map((item) => item.pressure))
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
            x: dtValues, // Sử dụng mảng date
            y: pressureValues, // Sử dụng mảng áp suất
            type: 'scatter',
            mode: 'lines+markers', // Hiển thị cả đường và điểm
            name: 'Pressure',
            marker: {
              color: pressureValues.map(getColorForPressure), // Màu sắc từng điểm dựa trên áp suất
              size: 8,
            },
            line: {
              color: 'grey', // Màu đường trung tính
              width: 2,
            },
          },
        ]}
        layout={{
          title: 'Pressure Over Time',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Pressure (hPa)' },
          annotations: [
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 1,
              text: 'Pressure Guide:',
              showarrow: false,
              font: { size: 12 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.9,
              text: '• Normal (1013-1022 hPa): Green',
              showarrow: false,
              font: { color: 'green', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.8,
              text: '• High (> 1022 hPa): Blue',
              showarrow: false,
              font: { color: 'blue', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.7,
              text: '• Low (990-1013 hPa): Yellow',
              showarrow: false,
              font: { color: 'yellow', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.6,
              text: '• Very Low (980-990 hPa): Orange',
              showarrow: false,
              font: { color: 'orange', size: 10 },
            },
            {
              xref: 'paper',
              yref: 'paper',
              x: 1.05,
              y: 0.5,
              text: '• Extremely Low (< 980 hPa): Red',
              showarrow: false,
              font: { color: 'red', size: 10 },
            },
          ],
        }}
        config={{ scrollZoom: true }}
      />
    </div>
  )
}


//Corelation

