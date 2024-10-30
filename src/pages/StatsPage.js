import { useEffect, useState } from 'preact/hooks';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useFood } from '../FoodContext';
import './StatsPage.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fi } from 'date-fns/locale';

ChartJS.register(...registerables);

const StatsPage = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [summary, setSummary] = useState({ total_value: 0, total_weight: 0, total_transactions: 0 });
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
  const [socketState, setSocketState] = useState(0);
  const [reasonId, setReasonId] = useState('');
  const [reasons, setReasons] = useState({});
  const [co2GraphData, setCo2GraphData] = useState({ labels: [], datasets: [] });
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/food-waste/summary');
      const data = await response.json();
      console.log('Fetched summary:', data);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchGraphData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/food-waste/graph-data');
      const co2_response = await fetch('http://127.0.0.1:8000/food-waste/co2_emission');
      const data_co2 = await co2_response.json();
      const data = await response.json();
      console.log('Fetched CO2 data:', data_co2);
      console.log('Fetched graph data:', data);
  
      if (data.data && Array.isArray(data.data)) {
        const fixedReasons = ["Validade", "Sobra", "Resto"];
        const labels = [...new Set(data.data.map(item => item.food_name))];
  
        const reasonsData = {};
        const co2Data = {};
  
        data.data.forEach(item => {
          if (!reasonsData[item.food_name]) {
            reasonsData[item.food_name] = { "Validade": 0, "Sobra": 0, "Resto": 0 };
          }
          reasonsData[item.food_name][item.label] = item.total_cost || 0;
        });
  
        console.log('Reasons data:', reasonsData);
  
        const datasets = labels.map(food => ({
          label: food,
          data: fixedReasons.map(reason => reasonsData[food][reason] || 0),
          backgroundColor: getColorForReason(food),
          borderColor: getColorForReason(food),
          borderWidth: 1,
        }));

        if (data_co2.data && Array.isArray(data_co2.data)) {
          const labels = data_co2.data.map(item => item.food_name);
          const dataValues = data_co2.data.map(item => item.total_co2_emission);

          var co2Dataset = {
            labels,
            datasets: [
              {
                label: 'CO₂ Emission (kg)',
                data: dataValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
              }
            ]
          };

          console.log('CO2 dataset:', co2Dataset);   
          setGraphData({ labels: fixedReasons, datasets });
          setCo2GraphData(co2Dataset);
        }
      } else {
        console.warn('No valid graph data received');
        setGraphData({ labels: [], datasets: [] });
        setCo2GraphData({ labels: [], datasets: [] });
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setGraphData({ labels: [], datasets: [] });
      setCo2GraphData({ labels: [], datasets: [] });
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
      setFeedback({ message: 'Dados filtrados com sucesso!', type: 'success' });

      // Remove feedback após 2 segundos
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 2000);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setFeedback({ message: 'Erro ao filtrar dados. Tente novamente.', type: 'error' });
      
      // Remove feedback após 2 segundos
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 2000);
    }
  };

  const getColorForReason = (reason) => {
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
    labels: graphData.labels,
    datasets: graphData.datasets,
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>DashBoard Descarte de Comida</h1>
      </header>

      <div className="filters">
        <div className="filter-group">
          <label>Data Inicial:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd-MM-yyyy"
          />
        </div>

        <div className="filter-group">
          <label>Data Final:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd-MM-yyyy"
          />
        </div>
        
        <div className="filter-group">
          <label>Motivo:</label>
          <select value={reasonId} onChange={(e) => setReasonId(e.target.value)}>
            <option value="">Selecione um motivo</option>
            {Object.entries(reasons).map(([reason, reason_id]) => (
              <option key={reason_id} value={reason_id}>
                {reason}
              </option>
            ))}
          </select>
        </div>
        
        <button className="submit-button" onClick={handleDateChange}>Submit</button>
      </div>

      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="summary">
        <div className="stat-card">
          <h2>Valor do descarte</h2>
          <p>${summary.total_value.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h2>Peso descartado</h2>
          <p>{summary.total_weight.toFixed(2)} KG</p>
        </div>
        <div className="stat-card">
          <h2>Transações</h2>
          <p>{summary.total_transactions}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h2>Descarte por motivo</h2>
          <div className="chart">
            <Bar 
              data={dataBar} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      font: {
                        size: 16, // Aumente o tamanho da fonte dos rótulos do eixo X
                      },
                    },
                  },
                  y: {
                    ticks: {
                      font: {
                        size: 16, // Aumente o tamanho da fonte dos rótulos do eixo Y
                      },
                    },
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="chart-container">
          <h2>Pegada de CO₂ </h2>
          <div className="chart">
            <Bar 
              data={co2GraphData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      font: {
                        size: 16, // Aumente o tamanho da fonte dos rótulos do eixo X
                      },
                    },
                  },
                  y: {
                    ticks: {
                      font: {
                        size: 16, // Aumente o tamanho da fonte dos rótulos do eixo Y
                      },
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatsPage;
