import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const Prediction = () => {
  const [chartData, setChartData] = useState({
    historical: [],
    prediction: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/prediction_chart');
        const result = await response.json();
        if (result.status === 'success') {
          setChartData(result.data);
        }
      } catch (error) {
        console.error('Error fetching prediction data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-[500px] p-4">
      <Plot
        data={[
          // Historical data
          {
            x: chartData.historical.map(d => d.time),
            y: chartData.historical.map(d => d.temperature),
            type: 'bar',
            name: 'Historical',
            marker: {
              color: '#1f77b4',
            },
            text: chartData.historical.map(d => `${d.temperature.toFixed(1)}°C`),
            textposition: 'outside',
            hovertemplate: 
              '<b>Time</b>: %{x}<br>' +
              '<b>Temperature</b>: %{y:.1f}°C<br>' +
              '<extra></extra>'
          },
          // Prediction data
          {
            x: chartData.prediction.map(d => d.time),
            y: chartData.prediction.map(d => d.temperature),
            type: 'bar',
            name: 'Prediction',
            marker: {
              color: '#ff7f0e',
              pattern: {
                type: 'diagonal',
                solidity: 0.4
              }
            },
            text: chartData.prediction.map(d => `${d.temperature.toFixed(1)}°C`),
            textposition: 'outside',
            hovertemplate: 
              '<b>Time</b>: %{x}<br>' +
              '<b>Temperature</b>: %{y:.1f}°C<br>' +
              '<b>Hour</b>: +%{customdata} hour(s)<br>' +
              '<extra></extra>',
            customdata: chartData.prediction.map(d => d.hour)
          }
        ]}
        layout={{
          title: {
            text: 'Temperature Prediction',
            font: { size: 24 }
          },
          xaxis: {
            title: 'Time',
            tickangle: -45,
            showgrid: true,
            gridcolor: '#E1E1E1',
            tickformat: '%H:%M',  // Hiển thị giờ:phút
            dtick: 3600000  // Hiển thị mỗi giờ (ms)
          },
          yaxis: {
            title: 'Temperature (°C)',
            showgrid: true,
            gridcolor: '#E1E1E1',
            zeroline: false
          },
          barmode: 'group',
          bargap: 0.15,
          bargroupgap: 0.1,
          legend: {
            x: 0,
            y: 1.1,
            orientation: 'h'
          },
          hovermode: 'x unified',
          margin: { l: 50, r: 50, t: 80, b: 80 },
          plot_bgcolor: 'white',
          paper_bgcolor: 'white',
          showlegend: true,
          annotations: [
            ...chartData.historical.map((d, i) => ({
              x: d.time,
              y: d.temperature,
              text: `${d.temperature.toFixed(1)}°C`,
              showarrow: false,
              yshift: 10
            })),
            ...chartData.prediction.map((d, i) => ({
              x: d.time,
              y: d.temperature,
              text: `${d.temperature.toFixed(1)}°C`,
              showarrow: false,
              yshift: 10
            }))
          ]
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d']
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Prediction;