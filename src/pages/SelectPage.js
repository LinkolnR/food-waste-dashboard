// src/pages/SelectPage.js
import React, { useState, useEffect } from 'react';
import frangoImage from '../images/frango.jpg';
import arrozImage from '../images/arroz.png';
import carneImage from '../images/carne.jpg';
import { useFood } from '../FoodContext';
import './SelectPage.css';

const SelectPage = () => {
  const [foods, setFoods] = useState([]);
  const [message, setMessage] = useState('');
  const { setShouldUpdate } = useFood();

  useEffect(() => {
    const mockData = [
      { id: 1, name: 'Frango', image: frangoImage, price: 20.00 },
      { id: 2, name: 'Carne', image: carneImage, price: 35.00 },
      { id: 3, name: 'Arroz', image: arrozImage, price: 7.00 },
    ];
    setFoods(mockData);
  }, []);

  const handleClick = async (foodId, foodName, foodPrice) => {
    try {
      const response = await fetch('http://localhost:8000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foodId, foodName, foodPrice }),
      });

      if (response.ok) {
        setMessage('Food selected successfully!');
        setShouldUpdate(true);
      } else {
        setMessage('Failed to select food.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="select-container">
      <h1>Selecione a comida</h1>
      <div className="food-grid">
        {foods.length > 0 ? (
          foods.map((food) => (
            <button key={food.id} onClick={() => handleClick(food.id, food.name, food.price)} className="food-item">
              <img src={food.image} alt={food.name} />
              <p>{food.name}</p>
            </button>
          ))
        ) : (
          <p>No food items available.</p>
        )}
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SelectPage;