import React, { useState } from 'react';
import './Header.css'; // Certifique-se de ter este arquivo CSS

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (path) => {
    window.location.href = path; // Redireciona para a nova URL
  };

  return (
    <header className="header">
      <div className="menu-container">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="menu-button"
        >
          ☰
        </button>
        {isMenuOpen && (
          <nav className="nav">
            <select
              onChange={(e) => navigateTo(e.target.value)}
              className="select"
            >
              <option value="/">Home</option>
              <option value="/stats">Status</option>
              <option value="/add">Adicionar</option>
              <option value="/select">Selecionar</option>
            </select>
          </nav>
        )}
      </div>
      <h1 className="title">Ecocina</h1>
    </header>
  );
}
