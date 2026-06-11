import React from 'react';
import { useAuth } from '../../context/AuthContext';

function OrganizationsView({ organizaciones, nuevaOrg, setNuevaOrg, handleRegistrarOrg }) {
  const { userRole } = useAuth();

  return (
    <div>
      <div className="content-header">
        <h2>Fichero de Organizaciones y Fundaciones</h2>
      </div>
      <div className="org-layout">
        {(userRole === 'ADMIN_ORGANIZACION' || userRole === 'ADMIN_ORG') && (
          <div className="form-container-box side-form">
            <h3>Inscribir Fundación</h3>
            <form onSubmit={handleRegistrarOrg} className="pro-form">
              <div className="form-field">
                <label>Nombre Corporativo</label>
                <input type="text" required value={nuevaOrg.nombre} onChange={e => setNuevaOrg({ ...nuevaOrg, nombre: e.target.value })} />
              </div>
              <div className="form-field">
                <label>RUT Institucional</label>
                <input type="text" placeholder="11.222.333-4" required value={nuevaOrg.rut} onChange={e => setNuevaOrg({ ...nuevaOrg, rut: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Comuna Sede</label>
                <input type="text" required value={nuevaOrg.comuna} onChange={e => setNuevaOrg({ ...nuevaOrg, comuna: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Capacidad Cupos</label>
                <input type="text" placeholder="Ej: 30 mascotas" required value={nuevaOrg.capacity} onChange={e => setNuevaOrg({ ...nuevaOrg, capacity: e.target.value })} />
              </div>
              <button type="submit" className="btn-submit">Registrar Organización</button>
            </form>
          </div>
        )}
        <div className="org-cards-container">
          {organizaciones.map(org => (
            <div key={org.id} className="org-info-card">
              <div className="org-header">
                <span className="org-icon">🏢</span>
                <h3>{org.nombre}</h3>
              </div>
              <p><strong>RUT:</strong> {org.rut}</p>
              <p><strong>Comuna:</strong> {org.comuna}</p>
              <p><strong>Cupos:</strong> {org.capacidad || org.capacity}</p>
              <button className="btn-secondary-outline">Contactar Entidad</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizationsView;