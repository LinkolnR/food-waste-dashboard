import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StatsPage from './pages/StatsPage';
import AddPage from './pages/AddPage';
import SelectPage from './pages/SelectPage'; // Importe a nova página

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/select" element={<SelectPage />} /> {/* Nova rota */}
      </Routes>
    </Router>
  );
}

export default App;
