import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { environment } from '../../utils/environment';

const SpiderChart = () => {
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${environment.BACKEND_URL}/get_spider`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array.');
        }

        const formattedData = data.reduce((acc, item) => {
          const { season, days, year } = item;
          if (!acc[year]) {
            acc[year] = { seasons: [], days: [] };
          }
          acc[year].seasons.push(season);
          acc[year].days.push(days);
          return acc;
        }, {});

        setChartData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const createPlot = (seasons, days, title, color) => {
    return (
      <Plot
        data={[
          {
            type: 'scatterpolar',
            r: days,
            theta: seasons,
            fill: 'toself',
            name: title,
            line: { color: color, width: 2 },
            opacity: 0.8,
          },
        ]}
        layout={{
          polar: {
            radialaxis: {
              visible: true,
              range: [0, Math.max(...days) + 500], // Giá trị tối đa của trục
            },
          },
          title: {
            text: title,
            font: { size: 16, color: '#444' },
          },
          margin: { t: 40, b: 40 },
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  if (isLoading) return <p>Loading...</p>;

  const years = Object.keys(chartData);
  if (years.length === 0) return <p>No data available</p>;

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F4D03F']; // Màu sắc cho từng năm

  const combinedPlot = (
    <Plot
      data={years.map((year, index) => ({
        type: 'scatterpolar',
        r: chartData[year].days,
        theta: chartData[year].seasons,
        fill: 'toself',
        name: `Year ${year}`,
        line: { color: colors[index], width: 2 },
        opacity: 0.7,
      }))}
      layout={{
        polar: {
          radialaxis: {
            visible: true,
            range: [
              0,
              Math.max(...years.flatMap((year) => chartData[year].days)) + 500,
            ],
          },
        },
        title: {
          text: 'Combined Spider Chart for All Years',
          font: { size: 18, color: '#444' },
        },
        legend: {
          orientation: 'h',
          x: 0.5,
          xanchor: 'center',
          y: -0.2,
        },
        margin: { t: 50, b: 50 },
      }}
      config={{ responsive: true }}
      style={{ width: '100%', height: '100%' }}
    />
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {years.map((year, index) => (
        <div key={year} style={{ marginBottom: '30px' }}>
          <h2 style={{ textAlign: 'center', color: colors[index] }}>
            Spider Chart for {year}
          </h2>
          {createPlot(
            chartData[year].seasons,
            chartData[year].days,
            `Year ${year}`,
            colors[index]
          )}
        </div>
      ))}
      <h2 style={{ textAlign: 'center', color: '#000' }}>
        Combined Spider Chart
      </h2>
      {combinedPlot}
    </div>
  );
};

export default SpiderChart;
