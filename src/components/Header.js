import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook de navegação do react-router

  const navigateTo = (path) => {
    navigate(path); // Roteamento sem recarregar a página
    setIsMenuOpen(false);
  };

  return (
    <header style={styles.header}>
      <div style={styles.menuContainer}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          style={styles.menuButton}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        > 
          <div style={{...styles.menuIcon, ...(isMenuOpen ? styles.menuIconOpen : {})}} />
          <div style={{...styles.menuIcon, ...(isMenuOpen ? styles.menuIconOpen : {})}} />
          <div style={{...styles.menuIcon, ...(isMenuOpen ? styles.menuIconOpen : {})}} />
        </button>
        {isMenuOpen && (
          <nav style={styles.nav}>
            <ul style={styles.navList}>
              <li><button onClick={() => navigateTo('/')} style={styles.navItem}>Home</button></li>
              <li><button onClick={() => navigateTo('/stats')} style={styles.navItem}>Status</button></li>
              <li><button onClick={() => navigateTo('/add')} style={styles.navItem}>Adicionar</button></li>
              <li><button onClick={() => navigateTo('/select')} style={styles.navItem}>Selecionar</button></li>
            </ul>
          </nav>
        )}
      </div>
      <h1 style={styles.title}>Ecocina</h1>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'green',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '60px',
  },
  menuContainer: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
  },
  menuIcon: {
    width: '25px',
    height: '3px',
    backgroundColor: 'white',
    position: 'relative',
    transition: 'all 0.3s ease-in-out',
    '::before': {
      content: '""',
      position: 'absolute',
      width: '25px',
      height: '3px',
      backgroundColor: 'white',
      top: '-8px',
      transition: 'all 0.3s ease-in-out',
    },
    '::after': {
      content: '""',
      position: 'absolute',
      width: '25px',
      height: '3px',
      backgroundColor: 'white',
      top: '8px',
      transition: 'all 0.3s ease-in-out',
    },
  },
  menuIconOpen: {
    backgroundColor: 'transparent',
    '::before': {
      transform: 'rotate(45deg)',
      top: 0,
    },
    '::after': {
      transform: 'rotate(-45deg)',
      top: 0,
    },
  },
  nav: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '0.5rem',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '1rem',
    color: 'green',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(0, 128, 0, 0.1)',
    },
  },
  title: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
};