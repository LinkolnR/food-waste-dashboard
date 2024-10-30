
import { useEffect, useState } from 'preact/hooks';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useFood } from '../FoodContext';
import './StatsPage.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(...registerables);

const StatsPage = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [summary, setSummary] = useState({ total_value: 0, total_weight: 0, total_transactions: 0 });
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] }); // Inicializando datasets como um array
  const [socketState, setSocketState] = useState(0);
  const [reasonId, setReasonId] = useState('');
  const [reasons, setReasons] = useState({});

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
      console.log('Fetched graph data:', data);
  
      // Verificar se data.data existe e é um array
      if (data.data && Array.isArray(data.data)) {
        const labels = [...new Set(data.data.map(item => item.food_name))]; // Obter nomes únicos dos alimentos
        
        // Obter todos os motivos possíveis
        const allReasons = [...new Set(data.data.map(item => item.label))]; 
  
        const reasonsData = {};
  
        // Agrupando os dados por food_name e reason_name
        data.data.forEach(item => {
          if (!reasonsData[item.food_name]) {
            reasonsData[item.food_name] = {};
            
            // Inicializar todos os motivos com valor 0
            allReasons.forEach(reason => {
              reasonsData[item.food_name][reason] = 0;
            });
          }
          reasonsData[item.food_name][item.label] = item.total_cost || 0; // Atualiza com o valor do motivo, se existir
        });
  
        console.log('Reasons data:', reasonsData);
  
        // Criar datasets a partir dos dados agrupados
        const datasets = Object.keys(reasonsData).map(food => {
          return {
            label: food,
            data: Object.values(reasonsData[food]),
            backgroundColor: getColorForReason(food), // Define uma cor baseada no motivo
          };
        });
  
        console.log('Graph data:', { labels, datasets });
  
        // Atualizar o estado do graphData
        setGraphData({ labels: allReasons, datasets });
      } else {
        console.warn('No valid graph data received');
        setGraphData({ labels: [], datasets: [] }); // Resetar caso não receba dados válidos
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphData({ labels: [], datasets: [] }); // Resetar em caso de erro
    }
  };

  const fetchReasons = async () => {
    try {
      const response = await fetch('http://localhost:8000/food-waste/reasons');
      const data = await response.json();
      const data_reasons = data.reasons;
      console.log('Fetched reasons:', data_reasons);
      setReasons(data_reasons);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    }
  };

  const handleDateChange = async () => {
    try {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      let response;

      if (!reasonId) {
        response = await fetch(
          `http://127.0.0.1:8000/food-waste/filter-by-date-and-reason?start_date=${startISO}&end_date=${endISO}`
        );
      } else {
        response = await fetch(
          `http://127.0.0.1:8000/food-waste/filter-by-date-and-reason?start_date=${startISO}&end_date=${endISO}&reason_id=${reasonId}`
        );
      }
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const getColorForReason = (reason) => {
    // Você pode definir suas cores aqui
    switch (reason) {
      case 'Validade':
        return 'rgba(255, 99, 132, 0.6)';
      case 'Sobra':
        return 'rgba(54, 162, 235, 0.6)';
      case 'Resto':
        return 'rgba(255, 206, 86, 0.6)';
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchGraphData();
    fetchReasons();
  }, [socketState]);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/updates');
    socket.onmessage = () => setSocketState((prev) => prev + 1);
    socket.onerror = (error) => console.error('WebSocket error:', error);

    return () => socket.close();
  }, []);

  const dataBar = {
    labels: graphData.labels, // As razões ou categorias
    datasets: graphData.datasets, // Dados dos alimentos agrupados por razão
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

      <div className="date-picker-container">
        <label>Data de Início:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
        />
        <label>Data de Fim:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
        />
        <label>Razão:</label>
        <select value={reasonId} onChange={(e) => setReasonId(e.target.value)}>
          <option value="">Selecione uma razão</option>
          {Object.entries(reasons).map(([reason, reason_id]) => (
            <option key={reason_id} value={reason_id}>
              {reason}
            </option>
          ))}
        </select>
        <button onClick={handleDateChange}>Buscar</button>
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
          <Bar data={dataBar} options={{ responsive: true, scales: { y: { beginAtZero: true, stacked: false } } }} />
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
