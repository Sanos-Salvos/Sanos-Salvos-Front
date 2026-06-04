import React from 'react';

function PetDetailModal({ aviso, onClose, nuevoComentario, setNuevoComentario, onAddComment }) {
  if (!aviso) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-layout">
          <div className="modal-img-container">
            {aviso.imagen ? (
              <img
                src={aviso.imagen}
                alt={aviso.nombre}
                className="modal-main-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <span className="modal-fallback-icon">🐾</span>
          </div>
          <div className="modal-info-side">
            <span className={`status-tag-modal ${aviso.estado.toLowerCase()}`}>{aviso.estado}</span>
            <h2>{aviso.nombre}</h2>
            <hr />
            <p><strong>Especie:</strong> {aviso.especie}</p>
            <p><strong>Raza:</strong> {aviso.raza}</p>
            <p><strong>📍 Sector / Comuna:</strong> {aviso.comuna}</p>
            <p><strong>🌐 Geolocalización:</strong> Lat: {aviso.lat.toFixed(4)} | Lng: {aviso.lng.toFixed(4)}</p>

            <div className="modal-comments-section">
              <h3>📌 Pistas y Avistamientos de la Red Civil</h3>
              <div className="comments-log-container">
                {!aviso.comentarios || aviso.comentarios.length === 0 ? (
                  <p className="no-comments-yet">Sin pistas en la bitácora todavía. Si lo has visto, aporta abajo.</p>
                ) : (
                  aviso.comentarios.map((c, idx) => (
                    <div key={idx} className="comment-bubble">
                      <div className="comment-meta"><strong>{c.autor}</strong> <span>{c.fecha}</span></div>
                      <p>{c.texto}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={onAddComment} className="comment-input-form">
                <input
                  type="text"
                  placeholder="Escribe un avistamiento, punto de referencia o pista..."
                  required
                  value={nuevoComentario}
                  onChange={e => setNuevoComentario(e.target.value)}
                />
                <button type="submit">Enviar</button>
              </form>
            </div>

            <div className="modal-contact-box">
              <h3>📞 Datos de Contacto Directo:</h3>
              <p className="modal-phone">{aviso.contacto}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetailModal;