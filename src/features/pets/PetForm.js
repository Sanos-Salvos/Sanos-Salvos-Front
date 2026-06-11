import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

export default function PetForm({
  nuevoAviso,
  setNuevoAviso,
  previewImage,
  handleImageChange,
  handlePublicar
}) {

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setNuevoAviso(prev => ({
          ...prev,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        }));
      },
    });
    return null;
  }

  return (
    <div className="pet-form-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📢 Generar nueva alerta de rastreo</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Ingresa los datos reales para guardarlos en el servidor central.</p>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <form onSubmit={handlePublicar} style={{ display: 'grid', gap: '14px', width: '100%', maxWidth: '450px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Nombre de la mascota *</label>
            <input type="text" value={nuevoAviso.nombre} onChange={e => setNuevoAviso({...nuevoAviso, nombre: e.target.value})} placeholder="Ej: Rocko" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Especie</label>
              <select value={nuevoAviso.especie} onChange={e => setNuevoAviso({...nuevoAviso, especie: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Raza</label>
              <input type="text" value={nuevoAviso.raza} onChange={e => setNuevoAviso({...nuevoAviso, raza: e.target.value})} placeholder="Ej: Poodle" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Estado de la alerta</label>
            <select value={nuevoAviso.estado} onChange={e => setNuevoAviso({...nuevoAviso, estado: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="PERDIDO">PERDIDO</option>
              <option value="ENCONTRADO">ENCONTRADO</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Comuna del avistamiento *</label>
            <input type="text" value={nuevoAviso.comuna} onChange={e => setNuevoAviso({...nuevoAviso, comuna: e.target.value})} placeholder="Ej: Providencia" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Teléfono de contacto *</label>
            <input type="text" value={nuevoAviso.contacto} onChange={e => setNuevoAviso({...nuevoAviso, contacto: e.target.value})} placeholder="+569 XXXXXXXX" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            Despachar Alerta Real
          </button>
        </form>

        {/* ================= MAPA DE FORMULARIO CON ALTURA FIJA REAL ================= */}
        <div style={{ flex: '1', minWidth: '320px', height: '450px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 'bold', color: '#1e1b4b' }}>📍 Marca el punto en el mapa</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Lat: {nuevoAviso.lat.toFixed(4)} | Lng: {nuevoAviso.lng.toFixed(4)}</p>
          </div>

          <MapContainer center={[nuevoAviso.lat, nuevoAviso.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[nuevoAviso.lat, nuevoAviso.lng]} />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}