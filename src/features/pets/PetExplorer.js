import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { iconPerdido, iconEncontrado } from '../map/leafletIcons';

function PetExplorer({
  avisos,
  avisosFiltrados,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  specieFilter,
  setSpecieFilter,
  setAvisoSeleccionado
}) {
  return (
    <div>
      <div className="content-header">
        <h2>Mascotas perdidas y encontradas</h2>
        <input
          type="text"
          placeholder="Buscar por nombre, raza o comuna..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="advanced-filter-ribbon">
        <div className="status-pill-group">
          <button className={`pill-btn ${statusFilter === 'TODOS' ? 'active' : ''}`} onClick={() => setStatusFilter('TODOS')}>Todos ({avisos.length})</button>
          <button className={`pill-btn lost ${statusFilter === 'PERDIDO' ? 'active' : ''}`} onClick={() => setStatusFilter('PERDIDO')}>Perdidos 🔴</button>
          <button className={`pill-btn found ${statusFilter === 'ENCONTRADO' ? 'active' : ''}`} onClick={() => setStatusFilter('ENCONTRADO')}>Encontrados 🟢</button>
        </div>
        <div className="dropdown-filter-group">
          <label>Especie:</label>
          <select value={specieFilter} onChange={e => setSpecieFilter(e.target.value)}>
            <option value="TODAS">Todas las especies</option>
            <option value="PERRO">Perros</option>
            <option value="GATO">Gatos</option>
          </select>
        </div>
      </div>

      <div className="real-map-wrapper">
        <MapContainer center={[-33.4372, -70.6506]} zoom={11} style={{ height: "300px", width: "100%", borderRadius: "16px" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {avisosFiltrados.map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={a.estado === 'PERDIDO' ? iconPerdido : iconEncontrado}>
              <Popup>
                <strong>{a.nombre}</strong> ({a.estado})<br/>
                {a.raza} — {a.comuna}<br/>
                <button className="btn-popup-view" onClick={() => setAvisoSeleccionado(a)}>Ver Detalles</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="map-badge-info">Visor Activo — OpenStreetMap & Leaflet</div>
      </div>

      <div className="cards-grid">
        {avisosFiltrados.map(aviso => (
          <div
            key={aviso.id}
            className={`pet-card ${aviso.estado.toLowerCase()}`}
            onClick={() => setAvisoSeleccionado(aviso)}
            style={{ cursor: 'pointer' }}
          >
            <div className="pet-avatar-container">
              {aviso.imagen ? (
                <img
                  src={aviso.imagen}
                  alt={aviso.nombre}
                  className="pet-card-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span className="pet-avatar-fallback" style={{ display: aviso.imagen ? 'none' : 'block' }}>🐾</span>
            </div>

            <span className={`status-tag ${aviso.estado.toLowerCase()}`}>{aviso.estado}</span>
            <h3>{aviso.nombre}</h3>
            <p><strong>Raza:</strong> {aviso.raza} ({aviso.especie})</p>
            <p><strong>📍 Ubicación:</strong> {aviso.comuna}</p>
            <p><strong>📞 Contacto:</strong> {aviso.contacto}</p>
          </div>
        ))}
        {avisosFiltrados.length === 0 && (
          <p className="no-results-text">No se encontraron alertas que coincidan con los criterios.</p>
        )}
      </div>
    </div>
  );
}

export default PetExplorer;