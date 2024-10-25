// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <h1>Ecocina</h1>
      <nav>
        <select onChange={(e) => (window.location.href = e.target.value)}>
          <option value="/">Home</option>
          <option value="/stats">Status</option>
          <option value="/add">Adicionar</option>
          <option value="/select">Selecionar</option>

        </select>
      </nav>
    </header>
  );
};

export default Header;
