import React from 'react';

function MatchingDashboard({ coincidencias }) {
  return (
    <div>
      <div className="content-header">
        <h2>🤝 Motor de Coincidencias de IA (Beta)</h2>
        <p>Basado en algoritmos de geolocalización y reconocimiento morfológico.</p>
      </div>
      <div className="coincidence-grid">
        {coincidencias.map(c => (
          <div key={c.id} className="coincidence-card">
            <div className="coin-header">
              <span className="coin-percentage">{c.porcentaje}% de match</span>
              <span className={`coin-status ${c.estado.toLowerCase()}`}>{c.estado}</span>
            </div>
            <h4>Caso: {c.perdida}</h4>
            <p className="coin-desc">{c.encontrada}</p>
            <div className="coin-actions">
              <button className="btn-match-verify">Verificar Cruce</button>
              <button className="btn-match-discard">Descartar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchingDashboard;