// import React, { useState, useEffect } from 'react';
// import { useFood } from '../FoodContext';
// import frangoImage from '../images/frango.jpg';
// import arrozImage from '../images/arroz.png';
// import carneImage from '../images/carne.jpg';
// import './SelectPage.css';
// import Popup from "./Popup.js";

// // Lista de comidas
// const foodsImage = {1: frangoImage,
//                     2: carneImage,
//                     3: arrozImage};

// const SelectPage = () => {
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedFood, setSelectedFood] = useState(null);
//   const [foods, setFoods] = useState([]);
//   const [feedbackStatus, setFeedbackStatus] = useState(''); // 'loading', 'success', 'error'
//   const { setShouldUpdate } = useFood();

//   const fetchFoods = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/food-waste/foods');
//       const data = await response.json();
//       console.log(data);
//       console.log(data.foods);
//       setFoods(data.foods);
//     } catch (error) {
//       console.error('Error fetching summary:', error);
//     }
//   };

//   useEffect(() => {
//     fetchFoods();
//   }, []);

//   const handleClick = (food) => {
//     const { food_id: foodId, price: foodPrice } = food;

//     setSelectedFood({ foodId, foodPrice });
//     handleOpenPopup();
//   };

//   const handleOpenPopup = () => {
//     setShowPopup(true);
//   };

//   const handleClosePopup = () => {
//     setShowPopup(false);
//   };

//   const handleSubmit = async (motivoId) => {
//     setFeedbackStatus('loading'); // Inicia animação de carregamento

//     try {
//       const response = await fetch('http://localhost:8000/submit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           foodId: selectedFood.foodId, 
//           foodPrice: selectedFood.foodPrice,
//           motivoId: motivoId,
//         }),
//       });

//       if (response.ok) {
//         setFeedbackStatus('success'); // Feedback sucesso
//         setShouldUpdate(true);
//       } else {
//         setFeedbackStatus('error'); // Feedback erro
//       }
//     } catch (error) {
//       setFeedbackStatus('error');
//     } finally {
//       handleClosePopup();
      
//       // Remove o feedback após 3 segundos
//       setTimeout(() => setFeedbackStatus(''), 3000);
//     }
//   };

//   const handleValidadeClick = () => handleSubmit(1);
//   const handleSobraClick = () => handleSubmit(2);
//   const handleRestoClick = () => handleSubmit(3);

//   return (
//     <div className="select-container">
//       <h1>Selecione a comida</h1>
//       <div className="food-grid">
//         {foods.length > 0 ? (
//           foods.map((food) => (
//             <button key={food.food_id} onClick={() => handleClick(food)} className="food-item">
//               <img src={foodsImage[food.food_id]  } alt={food.name} />
//               <p>{food.name}</p>
//             </button>
//           ))
//         ) : (
//           <p>Sem comidas cadastradas.</p>
//         )}
//       </div>
      
//       {showPopup && (
//         <Popup
//           onClose={handleClosePopup}
//           onValidadeClick={handleValidadeClick}
//           onSobraClick={handleSobraClick}
//           onRestoClick={handleRestoClick}
//         />
//       )}

//       {/* Feedback Gráfico */}
//       {feedbackStatus && (
//         <div className={`feedback-container ${feedbackStatus}`}>
//           {feedbackStatus === 'loading' && <div className="spinner"></div>}
//           {feedbackStatus === 'success' && <div className="icon success">✓</div>}
//           {feedbackStatus === 'error' && <div className="icon error">✕</div>}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SelectPage;

import { useState, useEffect } from 'preact/hooks';
import { useFood } from '../FoodContext';
import frangoImage from '../images/frango.jpg';
import arrozImage from '../images/arroz.png';
import carneImage from '../images/carne.jpg';
import './SelectPage.css';
import Popup from './Popup.js';

// Lista de imagens de comida
const foodsImage = {
  1: frangoImage,
  2: carneImage,
  3: arrozImage
};

const SelectPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foods, setFoods] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState(''); // 'loading', 'success', 'error'
  const { setShouldUpdate } = useFood();

  const fetchFoods = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/food-waste/foods');
      const data = await response.json();
      setFoods(data.foods || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleClick = (food) => {
    const { food_id: foodId, price: foodPrice } = food;
    setSelectedFood({ foodId, foodPrice });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = async (motivoId) => {
    setFeedbackStatus('loading');

    try {
      const response = await fetch('http://localhost:8000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: selectedFood.foodId,
          foodPrice: selectedFood.foodPrice,
          motivoId: motivoId,
        }),
      });

      setFeedbackStatus(response.ok ? 'success' : 'error');
      setShouldUpdate(true);
    } catch (error) {
      setFeedbackStatus('error');
    } finally {
      handleClosePopup();
      setTimeout(() => setFeedbackStatus(''), 3000);
    }
  };

  const handleValidadeClick = () => handleSubmit(1);
  const handleSobraClick = () => handleSubmit(2);
  const handleRestoClick = () => handleSubmit(3);

  return (
    <div className="select-container">
      <h1>Selecione a comida</h1>
      <div className="food-grid">
        {foods.length > 0 ? (
          foods.map((food) => (
            <button key={food.food_id} onClick={() => handleClick(food)} className="food-item">
              <img src={foodsImage[food.food_id]} alt={food.name} />
              <p>{food.name}</p>
            </button>
          ))
        ) : (
          <p>Sem comidas cadastradas.</p>
        )}
      </div>

      {showPopup && (
        <Popup
          onClose={handleClosePopup}
          onValidadeClick={handleValidadeClick}
          onSobraClick={handleSobraClick}
          onRestoClick={handleRestoClick}
        />
      )}

      {feedbackStatus && (
        <div className={`feedback-container ${feedbackStatus}`}>
          {feedbackStatus === 'loading' && <div className="spinner"></div>}
          {feedbackStatus === 'success' && <div className="icon success">✓</div>}
          {feedbackStatus === 'error' && <div className="icon error">✕</div>}
        </div>
      )}
    </div>
  );
};

export default SelectPage;
