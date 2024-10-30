import './Popup.css'; // Arquivo CSS para estilização (opcional)

function Popup({ onClose, onValidadeClick, onSobraClick, onRestoClick }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Qual o motivo do descarte?</h2>
        
        {/* Botões do PopUp */}
        <div className="button-row">
          <button onClick={onValidadeClick} className="action-button">Validade</button>
          <button onClick={onSobraClick} className="action-button">Sobra</button>
          <button onClick={onRestoClick} className="action-button">Resto</button>
        </div>

        {/* Botão para fechar o PopUp */}
        <button onClick={onClose} className="close-button">Fechar</button>
      </div>
    </div>
  );
}

export default Popup;
