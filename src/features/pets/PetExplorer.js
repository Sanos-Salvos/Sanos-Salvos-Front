import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function PetExplorer({
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
    <div className="pet-explorer-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div className="explorer-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#1e1b4b', margin: '0 0 16px 0' }}>Buscador de Mascotas (Datos del Servidor)</h2>

        <div className="filter-bar" style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, raza o comuna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minWidth: '280px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PERDIDO">Perdidos</option>
            <option value="ENCONTRADO">Encontrados</option>
          </select>
        </div>
      </div>

      {/* ================= CONTENEDOR DEL MAPA CON ALTURA FIJA ================= */}
      <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <MapContainer center={[-33.4372, -70.6506]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {avisosFiltrados.map(aviso => {
            const posicion = [aviso.lat || -33.4372, aviso.lng || -70.6506];
            return (
              <Marker key={aviso.id || aviso._id} position={posicion}>
                <Popup>
                  <strong>{aviso.nombre}</strong><br />
                  📍 {aviso.comuna}<br />
                  {aviso.estado}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* GRILLA DE MASCOTAS REALES */}
      <div className="pet-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {avisosFiltrados.map(aviso => (
          <div key={aviso.id || aviso._id} className="pet-card" onClick={() => setAvisoSeleccionado(aviso)} style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', padding: '16px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
            <div style={{ height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '40px' }}>🐾</span>
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e1b4b' }}>{aviso.nombre}</h3>
            <p style={{ margin: '0 0 4px 0', color: '#4b5563' }}><strong>Raza:</strong> {aviso.raza} ({aviso.especie})</p>
            <p style={{ margin: '0 0 4px 0', color: '#4b5563' }}><strong>📍 Ubicación:</strong> {aviso.comuna}</p>
            <p style={{ margin: '0 0 12px 0', color: '#4b5563' }}><strong>📞 Contacto:</strong> {aviso.contacto}</p>
            <span className={`status-tag ${aviso.estado?.toLowerCase()}`}>{aviso.estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}