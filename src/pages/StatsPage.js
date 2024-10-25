// src/pages/StatsPage.js
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useFood } from '../FoodContext';
import './StatsPage.css';

ChartJS.register(...registerables);
console.log("ENTROU NESTE SEGUNDO CARALHITOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")

const StatsPage = () => {
  const [summary, setSummary] = useState({ total_value: 0, total_weight: 0, total_transactions: 0 });
  const [graphData, setGraphData] = useState({ labels: [], data: [] });
  const { shouldUpdate, setShouldUpdate } = useFood();
  const [socketState, setSocketState] = useState(0); // Mudando para um número


  const fetchSummary = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/food-waste/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchGraphData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/food-waste/graph-data');
      const data = await response.json();
      setGraphData({ labels: data.labels, data: data.data });
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  useEffect(() => {
    console.log("CARREGANDO AS INFOOS")
    fetchSummary();
    fetchGraphData();
  }, [socketState]);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/updates');
    console.log("ENTROU NESTE PRIMEIRO CARALHIT")

    socket.onmessage = (event) => {

      setSocketState(prev => prev + 1);

    };
  
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return () => {
      socket.close();
    };
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
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [
      {
        label: 'Top Loss Reasons',
        data: [500, 700, 900, 650, 400],
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Dashboard Desperdício</h1>
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
          <h2>Registros</h2>
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