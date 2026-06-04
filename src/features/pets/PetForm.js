import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { iconPerdido, iconEncontrado } from '../map/leafletIcons';

function PetForm({
  nuevoAviso,
  setNuevoAviso,
  previewImage,
  handleImageChange,
  handlePublicar,
  triggerToast
}) {

  // Subcomponente interno para capturar los clics del mapa
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        setNuevoAviso(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        triggerToast("📍 Coordenadas capturadas con éxito en el formulario perimetral.");
      },
    });
    return null;
  }

  return (
    <div className="form-container-box" style={{ maxWidth: '900px' }}>
      <h2>📢 Generar nueva alerta de rastreo</h2>
      <p className="form-instructions-text">
        Ingresa los descriptores morfológicos y **haz clic en el mapa de la derecha** para fijar las coordenadas exactas sobre OpenStreetMap.
      </p>

      <div className="publish-flex-layout">
        <form onSubmit={handlePublicar} className="pro-form" style={{ flex: 1 }}>
          <div className="form-row">
            <div className="form-field">
              <label>Nombre de la mascota</label>
              <input type="text" placeholder="Ej: Rocko" required value={nuevoAviso.nombre} onChange={e => setNuevoAviso({ ...nuevoAviso, nombre: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Especie</label>
              <select value={nuevoAviso.especie} onChange={e => setNuevoAviso({ ...nuevoAviso, especie: e.target.value })}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Raza</label>
              <input type="text" placeholder="Ej: Poodle" required value={nuevoAviso.raza} onChange={e => setNuevoAviso({ ...nuevoAviso, raza: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Estado de la alerta</label>
              <select value={nuevoAviso.estado} onChange={e => setNuevoAviso({ ...nuevoAviso, estado: e.target.value })}>
                <option value="PERDIDO">PERDIDO</option>
                <option value="ENCONTRADO">ENCONTRADO</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Comuna del avistamiento</label>
            <input type="text" placeholder="Ej: Providencia" required value={nuevoAviso.comuna} onChange={e => setNuevoAviso({ ...nuevoAviso, comuna: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Teléfono de contacto</label>
            <input type="text" placeholder="+569 XXXXXXXX" required value={nuevoAviso.contacto} onChange={e => setNuevoAviso({ ...nuevoAviso, contacto: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Fotografía Real de la Mascota (Vista previa activa)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input-custom" />
            {previewImage && <img src={previewImage} alt="Preview" className="form-image-preview-thumbnail" />}
          </div>

          <div className="coordinates-display-box">
            <strong>Punto Capturado:</strong> Lat: {nuevoAviso.lat.toFixed(5)} | Lng: {nuevoAviso.lng.toFixed(5)}
          </div>

          <button type="submit" className="btn-submit">Despachar Alerta</button>
        </form>

        <div className="interactive-capture-map">
          <label className="map-capture-label">Haz clic en el punto de pérdida/avistamiento:</label>
          <MapContainer center={[-33.4372, -70.6506]} zoom={12} style={{ height: "340px", width: "100%", borderRadius: "12px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            <Marker position={[nuevoAviso.lat, nuevoAviso.lng]} icon={nuevoAviso.estado === 'PERDIDO' ? iconPerdido : iconEncontrado} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default PetForm;