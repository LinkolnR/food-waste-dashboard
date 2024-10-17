import React, { useState } from 'react';

const AddPage = () => {
  const [formData, setFormData] = useState({ food: '', reason: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.example.com/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Data added successfully!');
        setFormData({ food: '', reason: '' });
      } else {
        setMessage('Failed to add data.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="add-container">
      <h1>Add New Waste Data</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="food"
          value={formData.food}
          onChange={handleChange}
          placeholder="Food Item"
          required
        />
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Reason"
          required
        />
        <button type="submit">Add</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddPage;
