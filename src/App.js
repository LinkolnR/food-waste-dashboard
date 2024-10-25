import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FoodProvider } from './FoodContext'; // Importar o FoodProvider
import StatsPage from './pages/StatsPage';
import AddPage from './pages/AddPage';
import SelectPage from './pages/SelectPage'; // Importe a nova página
import Header from './components/Header';
function App() {
  return (
    <FoodProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<SelectPage />} /> {/* Altere a rota */}
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/select" element={<SelectPage />} /> {/* Nova rota */}
      </Routes>
    </Router>
    </FoodProvider>
  );
}

export default App;


// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { CounterProvider } from './context/CounterContext';
// import Home from './pages/Home';
// import Display from './pages/Display';

// function App() {
//   return (
//     <CounterProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/display" element={<Display />} />
//         </Routes>
//       </Router>
//     </CounterProvider>
//   );
// }

// export default App;
