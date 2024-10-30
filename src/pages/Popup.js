// // Popup.js
// import React from "react";
// import "./Popup.css"; // Arquivo CSS para estilização (opcional)

// function Popup({ onClose, onValidadeClick, onSobraClick, onRestoClick }) {
//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <h2>Qual o motivo do descarte?</h2>
        
//         {/* Botões do PopUp */}
//         <button onClick={onValidadeClick}>Validade</button>
//         <button onClick={onSobraClick}>Sobra</button>
//         <button onClick={onRestoClick}>Resto</button>
        
//         {/* Botão para fechar o PopUp */}
//         <button onClick={onClose} className="close-button">Fechar</button>
//       </div>
//     </div>
//   );
// }

// export default Popup;

import './Popup.css'; // Arquivo CSS para estilização (opcional)

function Popup({ onClose, onValidadeClick, onSobraClick, onRestoClick }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Qual o motivo do descarte?</h2>
        
        {/* Botões do PopUp */}
        <button onClick={onValidadeClick}>Validade</button>
        <button onClick={onSobraClick}>Sobra</button>
        <button onClick={onRestoClick}>Resto</button>
        
        {/* Botão para fechar o PopUp */}
        <button onClick={onClose} className="close-button">Fechar</button>
      </div>
    </div>
  );
}

export default Popup;
