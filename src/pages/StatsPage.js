import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './StatsPage.css';

ChartJS.register(...registerables);

const StatsPage = () => {
  const [summary, setSummary] = useState({ total_value: 0, total_weight: 0, total_transactions: 0 });
  const [graphData, setGraphData] = useState({ labels: [], data: [] });
  const [lineData, setLineData] = useState({ labels: [], data: [] });

  // Fetch the consolidated summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/food-waste/summary');
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    // Fetch data for the bar chart (top wasted foods)
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/food-waste/graph-data');
        const data = await response.json();
        setGraphData({ labels: data.labels, data: data.data });
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchSummary();
    fetchGraphData();
  }, []);

  const dataBar = {
    labels: graphData.labels,
    datasets: [
      {
        label: 'Top Wasted Foods',
        data: graphData.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const dataLine = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'], // Static for now, can also be fetched dynamically
    datasets: [
      {
        label: 'Top Loss Reasons',
        data: [500, 700, 900, 650, 400], // Placeholder data, can be fetched if available in API
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Dashboard Desperdício</h1>
        {/* <div className="alert">Chicken Waste From overproduction has been increasing for 7 Days.</div> */}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Valor Desperdício</h2>
          <p>${summary.total_value.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h2>Peso Desperdiçado</h2>
          <p>{summary.total_weight.toFixed(2)} KG</p>
        </div>
        <div className="stat-card">
          <h2>Waste Transactions</h2>
          <p>{summary.total_transactions}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart">
          <Bar data={dataBar} />
        </div>
        <div className="chart">
          <Line data={dataLine} />
        </div>
      </div>

      <div className="photo-stream">
        <h2>Photo Stream</h2>
        <div className="photos">
          <img src="https://via.placeholder.com/100" alt="Food 1" />
          <img src="https://via.placeholder.com/100" alt="Food 2" />
          <img src="https://via.placeholder.com/100" alt="Food 3" />
          <img src="https://via.placeholder.com/100" alt="Food 4" />
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
