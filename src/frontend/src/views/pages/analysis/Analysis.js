import React, { useEffect, useState } from 'react'
import {
  Chart_Filter_Temp_Day,
  Chart_Filter_Temp_Week,
  Chart_Filter_Temp_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'
import {
  Chart_Filter_Humidity_Day,
  Chart_Filter_Humidity_Week,
  Chart_Filter_Humidity_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Wind_Deg_Day,
  Chart_Filter_Wind_Deg_Week,
  Chart_Filter_Wind_Deg_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Wind_Speed_Day,
  Chart_Filter_Wind_Speed_Week,
  Chart_Filter_Wind_Speed_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Visibility_Day,
  Chart_Filter_Visibility_Week,
  Chart_Filter_Visibility_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Clouds_Day,
  Chart_Filter_Clouds_Week,
  Chart_Filter_Clouds_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Pressure_Day,
  Chart_Filter_Pressure_Week,
  Chart_Filter_Pressure_Month,
} from 'src/views/pages/analysis/Filter_analysiss.js'

import { Chart_Correlation } from 'src/views/pages/analysis/Correlation_analysiss.js'

import {
  Chart_Trend_Temp_Month,
  Chart_Trend_Pressure_Month,
  Chart_Trend_Humidity_Month,
  Chart_Trend_Clouds_Month,
  Chart_Trend_Visibility_Month,
  Chart_Trend_Wind_Speed_Month,
  Chart_Trend_Wind_Deg_Month,
} from 'src/views/pages/analysis/Trend_analysiss.js'

import {
  Chart_Observed_Temp,
  Chart_Trend_Temp,
  Chart_Seasonal_Temp,
  Chart_Residual_Temp,
  Chart_Observed_Pressure,
  Chart_Trend_Pressure,
  Chart_Seasonal_Pressure,
  Chart_Residual_Pressure,
  Chart_Observed_Humidity,
  Chart_Trend_Humidity,
  Chart_Seasonal_Humidity,
  Chart_Residual_Humidity,
  Chart_Observed_Clouds,
  Chart_Trend_Clouds,
  Chart_Seasonal_Clouds,
  Chart_Residual_Clouds,
  Chart_Observed_Visibility,
  Chart_Trend_Visibility,
  Chart_Seasonal_Visibility,
  Chart_Residual_Visibility,
  Chart_Observed_Wind_Speed,
  Chart_Trend_Wind_Speed,
  Chart_Seasonal_Wind_Speed,
  Chart_Residual_Wind_Speed,
  Chart_Observed_Wind_Deg,
  Chart_Trend_Wind_Deg,
  Chart_Seasonal_Wind_Deg,
  Chart_Residual_Wind_Deg,
} from 'src/views/pages/analysis/Seasonal_analysiss.js'

import './Analysis.css'

const ChartComponent = () => {
  const [selectedChart, setSelectedChart] = useState('') // Trạng thái lưu biểu đồ được chọn

  // Danh sách biểu đồ trong combobox
  const chartOptions = [
    { value: '', label: 'Select a chart' },
    { value: 'correlation', label: 'Correlation Heatmap' },
    { value: 'filter', label: 'Filter Chart' },
    { value: 'seasonal', label: 'Seasonal Chart' },
    { value: 'trend', label: 'Trend Month Chart' },
  ]

  // Hàm render biểu đồ dựa trên lựa chọn
  const renderChart = () => {
    switch (selectedChart) {
      case 'trend':
        return (
          <div>
            {/* //trend */}
            <div class="box_component">
              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Temp</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Temp_Month />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Pressure</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Pressure_Month />
                </div>
              </div>
              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Humidity</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Humidity_Month />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Clouds</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Clouds_Month />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Visibility</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Visibility_Month />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Wind Speed</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Wind_Speed_Month />
                </div>
              </div>
              <div style={{ marginBottom: '30px' }}>
                <h2>
                  <strong>Trend Wind Deg</strong>
                </h2>
                <div style={{ marginTop: '15px' }}>
                  <Chart_Trend_Wind_Deg_Month />
                </div>
              </div>
            </div>
          </div>
        )

      case 'seasonal':
        return (
          <div>
            <div class="box_component">
              <h2>
                <strong>Chart Temp</strong>
              </h2>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Temp</h2>
                <Chart_Observed_Temp />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Temp</h2>
                <Chart_Trend_Temp />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Temp</h2>
                <Chart_Seasonal_Temp />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Temp</h2>
                <Chart_Residual_Temp />
              </div>
            </div>
            {/* // pressure */}
            <div class="box_component">
              <h2>
                <strong>Chart Pressure</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Pressure</h2>
                <Chart_Observed_Pressure />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Pressure</h2>
                <Chart_Trend_Pressure />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Pressure</h2>
                <Chart_Seasonal_Pressure />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Pressure</h2>
                <Chart_Residual_Pressure />
              </div>
            </div>
            {/* // humidity */}
            <div class="box_component">
              <h2>
                <strong>Chart Humidity</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Humidity</h2>
                <Chart_Observed_Humidity />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Humidity</h2>
                <Chart_Trend_Humidity />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Humidity</h2>
                <Chart_Seasonal_Humidity />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Humidity</h2>
                <Chart_Residual_Humidity />
              </div>
            </div>
            {/* // clouds */}
            <div class="box_component">
              <h2>
                <strong>Chart Clouds</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Clouds</h2>
                <Chart_Observed_Clouds />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Clouds</h2>
                <Chart_Trend_Clouds />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Clouds</h2>
                <Chart_Seasonal_Clouds />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Clouds</h2>
                <Chart_Residual_Clouds />
              </div>
            </div>
            {/* // visibility */}
            <div class="box_component">
              <h2>
                <strong>Chart Visibility</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Visibility</h2>
                <Chart_Observed_Visibility />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Visibility</h2>
                <Chart_Trend_Visibility />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Visibility</h2>
                <Chart_Seasonal_Visibility />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Visibility</h2>
                <Chart_Residual_Visibility />
              </div>
            </div>
            {/* // wind speed */}
            <div class="box_component">
              <h2>
                <strong>Chart Wind Speed</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Wind Speed</h2>
                <Chart_Observed_Wind_Speed />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Wind Speed</h2>
                <Chart_Trend_Wind_Speed />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Wind Speed</h2>
                <Chart_Seasonal_Wind_Speed />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Wind Speed</h2>
                <Chart_Residual_Wind_Speed />
              </div>
            </div>
            {/* // wind deg */}
            <div class="box_component">
              <h2>
                <strong>Chart Wind Deg</strong>
              </h2>
              <div style={{ marginTop: '35px' }}>
                <h2>Chart Observed Wind Deg</h2>
                <Chart_Observed_Wind_Deg />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Trend Wind Deg</h2>
                <Chart_Trend_Wind_Deg />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Seasonal Wind Deg</h2>
                <Chart_Seasonal_Wind_Deg />
              </div>

              <div style={{ marginTop: '35px' }}>
                <h2>Chart Residual Wind Deg</h2>
                <Chart_Residual_Wind_Deg />
              </div>
            </div>
          </div>
        )
      case 'correlation':
        return (
          <div>
            <div>
              <h2>
                <strong>Correlation Chart</strong>
              </h2>
              <div style={{ marginTop: '40px' }}>
                <Chart_Correlation />
              </div>
            </div>
          </div>
        )
      case 'filter':
        return (
          <div>
            {/* <!-- nhiệt độ --> */}
            <div class="box_component">
              <h2>
                <strong>Temperature Chart</strong>
              </h2>
              <div>
                <h2>Daily Temperature</h2>

                <Chart_Filter_Temp_Day />
              </div>
              <div>
                <h2>Weekly Temperature</h2>

                <Chart_Filter_Temp_Week />
              </div>

              <div>
                <h2>Monthly Temperature</h2>

                <Chart_Filter_Temp_Month />
              </div>
            </div>

            {/* <!-- độ ẩm --> */}
            <div class="box_component">
              <h2>
                <strong>Humidity Chart</strong>
              </h2>
              <div>
                <h2>Daily Humidity</h2>

                <Chart_Filter_Humidity_Day />
              </div>
              <div>
                <h2>Weekly Humidity</h2>

                <Chart_Filter_Humidity_Week />
              </div>

              <div>
                <h2>Monthly Humidity</h2>

                <Chart_Filter_Humidity_Month />
              </div>
            </div>

            {/* <!-- hướng gió --> */}
            <div class="box_component">
              <h2>
                <strong>Wind Deg Chart</strong>
              </h2>
              <div>
                <h2>Daily Wind Deg</h2>

                <Chart_Filter_Wind_Deg_Day />
              </div>
              <div>
                <h2>Weekly Wind Deg</h2>

                <Chart_Filter_Wind_Deg_Week />
              </div>

              <div>
                <h2>Monthly Wind Deg</h2>

                <Chart_Filter_Wind_Deg_Month />
              </div>
            </div>

            {/* <!-- tốc độ gió --> */}
            <div class="box_component">
              <h2>
                <strong>Wind Speed Chart</strong>
              </h2>
              <div>
                <h2>Daily Wind Speed</h2>

                <Chart_Filter_Wind_Speed_Day />
              </div>
              <div>
                <h2>Weekly Wind Speed</h2>

                <Chart_Filter_Wind_Speed_Week />
              </div>

              <div>
                <h2>Monthly Wind Speed</h2>

                <Chart_Filter_Wind_Speed_Month />
              </div>
            </div>

            {/* <!-- tầm nhìn xa --> */}
            <div class="box_component">
              <h2>
                <strong>Visibility Chart</strong>
              </h2>
              <div>
                <h2>Daily Visibility</h2>

                <Chart_Filter_Visibility_Day />
              </div>
              <div>
                <h2>Weekly Visibility</h2>

                <Chart_Filter_Visibility_Week />
              </div>

              <div>
                <h2>Monthly Visibility</h2>

                <Chart_Filter_Visibility_Month />
              </div>
            </div>

            {/* <!-- độ che phủ mây --> */}
            <div class="box_component">
              <h2>
                <strong>Clouds Chart</strong>
              </h2>
              <div>
                <h2>Daily Clouds</h2>

                <Chart_Filter_Clouds_Day />
              </div>
              <div>
                <h2>Weekly Clouds</h2>

                <Chart_Filter_Clouds_Week />
              </div>

              <div>
                <h2>Monthly Clouds</h2>

                <Chart_Filter_Clouds_Month />
              </div>
            </div>

            {/* <!-- áp suất --> */}
            <div class="box_component">
              <h2>
                <strong>Pressure Chart</strong>
              </h2>
              <div>
                <h2>Daily Pressure</h2>

                <Chart_Filter_Pressure_Day />
              </div>
              <div>
                <h2>Weekly Pressure</h2>

                <Chart_Filter_Pressure_Week />
              </div>

              <div>
                <h2>Monthly Pressure</h2>

                <Chart_Filter_Pressure_Month />
              </div>
            </div>
          </div>
        )

      default:
        return <p>Please select a chart to display.</p>
    }
  }

  return (
    <div>
      {/* Combobox */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="chart-select" style={{ marginRight: '10px' }}>
          Select Chart:
        </label>
        <select
          id="chart-select"
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
        >
          {chartOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hiển thị biểu đồ */}
      <div>{renderChart()}</div>
    </div>
  )
}

export default ChartComponent
