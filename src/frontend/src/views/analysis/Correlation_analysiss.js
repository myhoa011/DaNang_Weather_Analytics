import { CCard, CCardBody, CCol, CRow, CButton, CButtonGroup } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'

const environment_data = {
  BACKEND_DATA_API: 'http://localhost:8000',
}

//CORRELATION
export const Chart_Correlation = () => {
  const [chartData, setChartData] = useState([])
  const [dtValues, setDtValues] = useState([])
  const [tempValues, setTempValues] = useState([])

  const variables = [
    'temp',
    'pressure',
    'humidity',
    'clouds',
    'visibility',
    'wind_speed',
    'wind_deg',
  ]

  useEffect(() => {
    // Gọi API
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment_data.BACKEND_DATA_API}/correlation`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const extractedData = data.map((item) => Object.values(item))

        setChartData(extractedData)

        setTempValues(data.map((item) => Object.values(item)))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <CCard className="mb-4">
        <CCardBody className="mb-4">
        <CRow >
          <CCol sm={5}>
            <h4 id="traffic" className="card-title mb-0">
              Correlation Chart
            </h4>
          </CCol>
          <CCol sm={7} className="d-none d-md-block">
          </CCol>
        </CRow>
        <Plot className='d-flex justify-content-center align-items-center'
        data={[
          {
            z: tempValues, // Ma trận giá trị tương quan
            x: variables, // Tên các cột
            y: variables, // Tên các dòng
            type: 'heatmap',
            colorscale: 'Viridis', // Bảng màu giống hình gốc
            hoverongaps: false, // Không cho phép hover trên ô trống
            text: tempValues, // Hiển thị giá trị trong từng ô vuông
            texttemplate: '%{text}', // Định dạng text trong mỗi ô
            textfont: {
              size: 10, // Kích cỡ chữ trong ô
            },
            showscale: true, // Hiển thị thanh màu bên phải
            colorbar: {
              title: 'Correlation', // Tiêu đề cho thanh màu
              titleside: 'right',
            },
          },
        ]}
        layout={{
          title: {
            y: 0.05, // Dịch tiêu đề lên trên
            x: 0.5, // Căn giữa tiêu đề
            xanchor: 'center', // Căn giữa tiêu đề
            yanchor: 'bottom', // Căn tiêu đề từ dưới lên
          },
          xaxis: {
            side: 'top', // Hiển thị tên biến trên cùng
            tickangle: 0, // Góc xoay nhãn x
          },
          yaxis: {
            autorange: 'reversed', // Đảo ngược trục y để thứ tự giống hình
          },
          margin: { t: 25, b: 50, l: 50, r: 25 }, // Căn lề
          width: 700, // Chiều rộng biểu đồ
          height: 700, // Chiều cao biểu đồ,
          plot_bgcolor: 'rgba(0, 0, 0, 0)',  // Nền trong suốt của biểu đồ
          paper_bgcolor: 'rgba(0, 0, 0, 0)', // Nền trong suốt của toàn bộ paper
        }}
        config={{ scrollZoom: true }}
      />
        </CCardBody>
      </CCard>
    </div>
  )
}
