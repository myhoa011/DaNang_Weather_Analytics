import React, { useEffect, useState } from 'react'
import {
  Chart_Filter_Temp_Day,
  Chart_Filter_Temp_Week,
  Chart_Filter_Temp_Month,
} from 'src/views/analysis/Filter_analysiss.js'
import {
  Chart_Filter_Humidity_Day,
  Chart_Filter_Humidity_Week,
  Chart_Filter_Humidity_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Wind_Deg_Day,
  Chart_Filter_Wind_Deg_Week,
  Chart_Filter_Wind_Deg_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Wind_Speed_Day,
  Chart_Filter_Wind_Speed_Week,
  Chart_Filter_Wind_Speed_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Visibility_Day,
  Chart_Filter_Visibility_Week,
  Chart_Filter_Visibility_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Clouds_Day,
  Chart_Filter_Clouds_Week,
  Chart_Filter_Clouds_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import {
  Chart_Filter_Pressure_Day,
  Chart_Filter_Pressure_Week,
  Chart_Filter_Pressure_Month,
} from 'src/views/analysis/Filter_analysiss.js'

import { Chart_Correlation } from 'src/views/analysis/Correlation_analysiss.js'

import {
  Chart_Trend_Temp_Month,
  Chart_Trend_Pressure_Month,
  Chart_Trend_Humidity_Month,
  Chart_Trend_Clouds_Month,
  Chart_Trend_Visibility_Month,
  Chart_Trend_Wind_Speed_Month,
  Chart_Trend_Wind_Deg_Month,
} from 'src/views/analysis/Trend_analysiss.js'

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
} from 'src/views/analysis/Seasonal_analysiss.js'

import './Analysis.css'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CButtonGroup,
  CButton,
  CCardBody,
} from '@coreui/react'

const chartContainerStyle = {
  width: '100%',
  height: '300px',
  position: 'relative'
}

const ChartComponent = () => {
  const [selectedChart, setSelectedChart] = useState('') // Trạng thái lưu biểu đồ được chọn
  const [selectedPeriod, setSelectedPeriod] = useState('Day')

  // Danh sách biểu đồ trong combobox
  const chartOptions = [
    { value: '', label: 'Select a chart' },
    { value: 'correlation', label: 'Correlation Heatmap' },
    { value: 'filter', label: 'Raw Data Chart' },
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
            <div className="container-fluid">
              {/* Temperature Charts */}
              <div className="box_component">
                <h2><strong>Chart Temp</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Temp</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Temp />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Temp</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Temp />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Temp</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Temp />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Temp</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Temp />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Pressure Charts */}
              <div className="box_component">
                <h2><strong>Chart Pressure</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Pressure</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Pressure />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Pressure</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Pressure />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Pressure</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Pressure />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Pressure</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Pressure />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Humidity Charts */}
              <div className="box_component">
                <h2><strong>Chart Humidity</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Humidity</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Humidity />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Humidity</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Humidity />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Humidity</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Humidity />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Humidity</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Humidity />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Clouds Charts */}
              <div className="box_component">
                <h2><strong>Chart Clouds</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Clouds</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Clouds />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Clouds</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Clouds />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Clouds</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Clouds />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Clouds</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Clouds />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Visibility Charts */}
              <div className="box_component">
                <h2><strong>Chart Visibility</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Visibility</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Visibility />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Visibility</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Visibility />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Visibility</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Visibility />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Visibility</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Visibility />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Wind Speed Charts */}
              <div className="box_component">
                <h2><strong>Chart Wind Speed</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Wind Speed</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Wind_Speed />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Wind Speed</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Wind_Speed />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Wind Speed</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Wind_Speed />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Wind Speed</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Wind_Speed />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
        
              {/* Wind Deg Charts */}
              <div className="box_component">
                <h2><strong>Chart Wind Deg</strong></h2>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Observed Wind Deg</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Observed_Wind_Deg />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Trend Wind Deg</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Trend_Wind_Deg />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Seasonal Wind Deg</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Seasonal_Wind_Deg />
                      </CCardBody>
                    </CCard>
                  </div>
                  <div className="col-md-6">
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h4>Chart Residual Wind Deg</h4>
                      </CCardHeader>
                      <CCardBody style={chartContainerStyle}>
                        <Chart_Residual_Wind_Deg />
                      </CCardBody>
                    </CCard>
                  </div>
                </div>
              </div>
            </div>
          )
      case 'correlation':
        return (
          <div>
            <div>
              <div style={{ marginTop: '40px' }}>
                <Chart_Correlation />
              </div>
            </div>
          </div>
        )
        case 'filter':
          return (
            <>
              {/* Temperature Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="temperature" className="card-title mb-0">
                        Temperature Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Temp_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Temp_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Temp_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Humidity Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="humidity" className="card-title mb-0">
                        Humidity Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4 ">
                    {selectedPeriod === 'Day' && <Chart_Filter_Humidity_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Humidity_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Humidity_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Wind Speed Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="windspeed" className="card-title mb-0">
                        Wind Speed Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Wind_Speed_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Wind_Speed_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Wind_Speed_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Wind Direction Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="winddirection" className="card-title mb-0">
                        Wind Direction Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Wind_Deg_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Wind_Deg_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Wind_Deg_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Visibility Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="visibility" className="card-title mb-0">
                        Visibility Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Visibility_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Visibility_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Visibility_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Clouds Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="clouds" className="card-title mb-0">
                        Cloud Coverage Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Clouds_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Clouds_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Clouds_Month />}
                  </div>
                </CCardBody>
              </CCard>
        
              {/* Pressure Section */}
              <CCard className="mb-4">
                <CCardBody>
                  <CRow>
                    <CCol sm={5}>
                      <h4 id="pressure" className="card-title mb-0">
                        Pressure Analysis
                      </h4>
                    </CCol>
                    <CCol sm={7} className="d-none d-md-block">
                      <CButtonGroup className="float-end me-3">
                        {['Day', 'Week', 'Month'].map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="mx-0"
                            active={value === selectedPeriod}
                            onClick={() => setSelectedPeriod(value)}
                          >
                            {value}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <div className="mt-4">
                    {selectedPeriod === 'Day' && <Chart_Filter_Pressure_Day />}
                    {selectedPeriod === 'Week' && <Chart_Filter_Pressure_Week />}
                    {selectedPeriod === 'Month' && <Chart_Filter_Pressure_Month />}
                  </div>
                </CCardBody>
              </CCard>
            </>
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
