import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { listarMascotas, crearMascota } from './api/mascotaService';
import { listarOrganizaciones, crearOrganizacion } from './api/organizacionService';
import { listarCoincidencias } from './api/coincidenciaService';
import { login as apiLogin, register as apiRegister } from './api/authService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const iconPerdido = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const iconEncontrado = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Limites de Chile para restringir el mapa
const CHILE_BOUNDS = L.latLngBounds(
  L.latLng(-56.5, -76.5),  // Suroeste (Cape Horn, costa Pacífico)
  L.latLng(-17.5, -66)     // Noreste (Arica, frontera Argentina)
);
const CHILE_CENTER = [-35.5, -71];
const CHILE_ZOOM = 5;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('luna_token');
  });
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('luna_token') || null;
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('luna_rol') || 'USER';
  });
  const [activeTab, setActiveTab] = useState('avisos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [specieFilter, setSpecieFilter] = useState('TODAS');
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState(() => {
    const saved = localStorage.getItem('luna_remember');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return { username: data.username || '', password: data.password || '', isOrg: false, rememberMe: true };
      } catch { /* ignore */ }
    }
    return { username: '', password: '', isOrg: false, rememberMe: false };
  });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '', isOrg: false, nombreOrg: '', rut: '' });
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');

  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarMascotas() {
      try {
        const data = await listarMascotas();
        setAvisos(data);
      } catch (error) {
        console.error('Error cargando mascotas del BFF:', error);
      } finally {
        setCargando(false);
      }
    }
    cargarMascotas();
  }, []);

  const [organizaciones, setOrganizaciones] = useState([]);
  const [cargandoOrgs, setCargandoOrgs] = useState(true);

  useEffect(() => {
    async function cargarOrganizaciones() {
      try {
        const data = await listarOrganizaciones();
        setOrganizaciones(data);
      } catch (error) {
        console.error('Error cargando organizaciones del BFF:', error);
      } finally {
        setCargandoOrgs(false);
      }
    }
    cargarOrganizaciones();
  }, []);

  const [coincidencias, setCoincidencias] = useState([]);
  const [cargandoCoincidencias, setCargandoCoincidencias] = useState(true);

  useEffect(() => {
    async function cargarCoincidencias() {
      try {
        const data = await listarCoincidencias();
        setCoincidencias(data);
      } catch (error) {
        console.error('Error cargando coincidencias del BFF:', error);
      } finally {
        setCargandoCoincidencias(false);
      }
    }
    cargarCoincidencias();
  }, []);

  const [nuevoAviso, setNuevoAviso] = useState({
    nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO',
    comuna: '', contacto: '', imagen: '',
    lat: -33.4372, lng: -70.6506
  });
  const [otroEspecie, setOtroEspecie] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevaOrg, setNuevaOrg] = useState({ nombre: '', rut: '', comuna: '', capacity: '' });

  const triggerToast = (mensaje, tipo = 'success') => {
    setToast(mensaje);
    setToastType(tipo);
    setTimeout(() => setToast(null), 6000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setNuevoAviso(prev => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        setNuevoAviso(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        triggerToast("Coordenadas capturadas con exito.");
      },
    });
    return null;
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    const comentarioObj = {
      autor: userRole === 'ADMIN_ORG' || userRole === 'ADMIN_ORGANIZACION' ? 'Organizacion_Verificada' : 'Usuario_Comun',
      texto: nuevoComentario,
      fecha: new Date().toLocaleString()
    };
    const nuevosAvisos = avisos.map(a => {
      if (a.id === avisoSeleccionado.id) {
        const updatedAviso = { ...a, comentarios: [...(a.comentarios || []), comentarioObj] };
        setAvisoSeleccionado(updatedAviso);
        return updatedAviso;
      }
      return a;
    });
    setAvisos(nuevosAvisos);
    setNuevoComentario('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(loginForm.username, loginForm.password);
      // Remember me
      if (loginForm.rememberMe) {
        localStorage.setItem('luna_remember', JSON.stringify({ username: loginForm.username, password: loginForm.password }));
        localStorage.setItem('luna_token', response.token);
        localStorage.setItem('luna_rol', response.rol || rolSeleccionado);
      } else {
        localStorage.removeItem('luna_remember');
        localStorage.removeItem('luna_token');
        localStorage.removeItem('luna_rol');
      }
      setAuthToken(response.token);
      const rolSeleccionado = loginForm.isOrg ? 'ADMIN_ORG' : 'USER';
      setUserRole(response.rol || rolSeleccionado);
      setIsLoggedIn(true);
    } catch (error) {
      triggerToast("Credenciales inválidas: " + error.message, 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      triggerToast("Las contraseñas no coinciden.", 'error');
      return;
    }
    try {
      const rol = registerForm.isOrg ? 'ADMIN_ORG' : 'USER';
      await apiRegister(registerForm.username, registerForm.password, [rol]);
      triggerToast("Cuenta creada con éxito!");
      setIsRegistering(false);
      setLoginForm({ username: registerForm.username, password: registerForm.password, isOrg: registerForm.isOrg });
    } catch (error) {
      triggerToast("Error al registrar: " + error.message, 'error');
    }
  };

  const handlePublicar = async (e) => {
    e.preventDefault();
    try {
      const especieFinal = nuevoAviso.especie === 'Otros' ? (otroEspecie.trim() || 'Otro animal') : nuevoAviso.especie;
      const mascotaCreada = await crearMascota({
        nombre: nuevoAviso.nombre,
        especie: especieFinal,
        raza: nuevoAviso.raza,
        estado: nuevoAviso.estado,
        lat: nuevoAviso.lat,
        lng: nuevoAviso.lng,
        comuna: nuevoAviso.comuna,
        contacto: nuevoAviso.contacto,
        imagen: nuevoAviso.imagen
      });

      // Recargar toda la lista desde el servidor
      const dataActualizada = await listarMascotas();
      setAvisos(dataActualizada);

      triggerToast("Aviso publicado con éxito!");
      setNuevoAviso({ nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO', comuna: '', contacto: '', imagen: '', lat: -33.4372, lng: -70.6506 });
      setOtroEspecie('');
      setPreviewImage(null);
      setActiveTab('avisos');

    } catch (error) {
      console.error('Error al publicar:', error);
      triggerToast("Error al guardar en el servidor: " + error.message);
    }
  };

  const handleRegistrarOrg = async (e) => {
    e.preventDefault();
    try {
      await crearOrganizacion({
        nombre: nuevaOrg.nombre,
        tipo: 'REFUGIO',
        direccion: nuevaOrg.comuna,
        telefono: '',
        email: ''
      });
      const dataActualizada = await listarOrganizaciones();
      setOrganizaciones(dataActualizada);
      triggerToast("Organización registrada con éxito!");
      setNuevaOrg({ nombre: '', rut: '', comuna: '', capacity: '' });
      setActiveTab('organizaciones');
    } catch (error) {
      console.error('Error al registrar organizacion:', error);
      triggerToast("Error al guardar en el servidor: " + error.message);
    }
  };

  const avisosFiltrados = avisos.filter(a => {
    const matchesSearch =
      (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.comuna || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.raza || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || a.estado === statusFilter;
    const matchesSpecie = specieFilter === 'TODAS' ||
      (specieFilter === 'PERRO' && (a.especie || '').toLowerCase() === 'perro') ||
      (specieFilter === 'GATO' && (a.especie || '').toLowerCase() === 'gato') ||
      (specieFilter === 'OTROS' && !['perro', 'gato'].includes((a.especie || '').toLowerCase()));
    return matchesSearch && matchesStatus && matchesSpecie;
  });

  const avisosConCoordenadas = avisosFiltrados.filter(a => a.lat != null && a.lng != null);

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="fixed-mini-logo" />
        <div className="login-side-panel left-panel">
          <div className="side-panel-title">Reportes Recientes</div>
          {(() => {
            const perdidas = avisos.filter(a => a.estado === 'PERDIDO');
            const encontradas = avisos.filter(a => a.estado === 'ENCONTRADO');
            const randomPerdidas = [...perdidas].sort(() => Math.random() - 0.5).slice(0, 2);
            const ultimaEncontrada = encontradas.length > 0 ? [encontradas[encontradas.length - 1]] : [];
            const cardsMostrar = [...randomPerdidas, ...ultimaEncontrada];
            return cardsMostrar.map((aviso, idx) => (
              <div key={aviso.id || idx} className={`mini-alert-card ${aviso.estado === 'PERDIDO' ? 'lost' : 'found'}`}>
                <div className="mini-card-avatar-box">
                  {aviso.imagen ? (
                    <img src={aviso.imagen} alt={aviso.nombre} className="mini-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="mini-card-emoji">{aviso.especie === 'Gato' ? '🐱' : aviso.especie === 'Perro' ? '🐶' : '🐾'}</span>
                  )}
                </div>
                <span className={`mini-alert-badge ${aviso.estado === 'PERDIDO' ? 'lost' : 'found'}`}>
                  {aviso.estado}
                </span>
                <h4>{aviso.nombre}</h4>
                <p>{aviso.raza} - {aviso.comuna}</p>
              </div>
            ));
          })()}
        </div>

        <div className="login-card">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="login-logo-img" />
          <p>Portal unificado de asistencia y rastreo de mascotas</p>
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-field-auth">
                <label>Correo Electronico</label>
                <input type="email" placeholder="ejemplo@sanos.com" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
              </div>
              <div className="form-field-auth">
                <label>Contrasena</label>
                <input type="password" placeholder="********" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <div className="form-checkbox-auth">
                <input type="checkbox" id="loginRemember" checked={loginForm.rememberMe || false} onChange={e => setLoginForm({ ...loginForm, rememberMe: e.target.checked })} />
                <label htmlFor="loginRemember">Recordarme</label>
              </div>
              <div className="form-checkbox-auth">
                <input type="checkbox" id="loginIsOrg" checked={loginForm.isOrg} onChange={e => setLoginForm({ ...loginForm, isOrg: e.target.checked })} />
                <label htmlFor="loginIsOrg">Soy una Organizacion / Fundacion inscrita</label>
              </div>
              <button type="submit" className="btn-auth-submit">Ingresar al Sistema</button>
              <p className="auth-toggle-text">No tienes una cuenta? <span onClick={() => setIsRegistering(true)}>Crear una cuenta</span></p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-field-auth">
                <label>Correo Electronico</label>
                <input type="email" placeholder="correo@dominio.com" required value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
              </div>
              <div className="form-field-auth">
                <label>Contrasena</label>
                <input type="password" placeholder="Minimo 6 caracteres" required value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
              </div>
              <div className="form-field-auth">
                <label>Confirmar Contrasena</label>
                <input type="password" placeholder="Repita su contrasena" required value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
              </div>
              <div className="form-checkbox-auth">
                <input type="checkbox" id="registerIsOrg" checked={registerForm.isOrg} onChange={e => setRegisterForm({ ...registerForm, isOrg: e.target.checked })} />
                <label htmlFor="registerIsOrg">Registrarme como Entidad/Organizacion</label>
              </div>
              {registerForm.isOrg && (
                <div className="animated-org-fields">
                  <div className="form-field-auth">
                    <label>Nombre de la Fundacion</label>
                    <input type="text" placeholder="Ej: Fundacion Huellitas" required={registerForm.isOrg} value={registerForm.nombreOrg} onChange={e => setRegisterForm({ ...registerForm, nombreOrg: e.target.value })} />
                  </div>
                  <div className="form-field-auth">
                    <label>RUT de la Organizacion</label>
                    <input type="text" placeholder="76.xxx.xxx-x" required={registerForm.isOrg} value={registerForm.rut} onChange={e => setRegisterForm({ ...registerForm, rut: e.target.value })} />
                  </div>
                </div>
              )}
              <button type="submit" className="btn-auth-submit register">Registrar mi Cuenta</button>
              <p className="auth-toggle-text">Ya posees una cuenta? <span onClick={() => setIsRegistering(false)}>Iniciar Sesion</span></p>
            </form>
          )}
          <span className="footer-token">Cifrado Perimetral y Tokens JWT - Gateway Auth</span>
        </div>

        <div className="login-side-panel right-panel">
          <div className="side-panel-title">Últimos Avistamientos</div>
          {(() => {
            const perdidas = avisos.filter(a => a.estado === 'PERDIDO');
            const encontradas = avisos.filter(a => a.estado === 'ENCONTRADO');
            const randomPerdida = [...perdidas].sort(() => Math.random() - 0.5).slice(0, 1);
            const ultimaEncontrada = encontradas.length > 0 ? [encontradas[encontradas.length - 1]] : [];
            const cardsMostrar = [...randomPerdida, ...ultimaEncontrada];
            return cardsMostrar.map((aviso, idx) => (
              <div key={aviso.id || idx} className={`mini-alert-card ${aviso.estado === 'PERDIDO' ? 'lost' : 'found'}`}>
                <div className="mini-card-avatar-box">
                  {aviso.imagen ? (
                    <img src={aviso.imagen} alt={aviso.nombre} className="mini-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="mini-card-emoji">{aviso.especie === 'Gato' ? '🐱' : aviso.especie === 'Perro' ? '🐶' : '🐾'}</span>
                  )}
                </div>
                <span className={`mini-alert-badge ${aviso.estado === 'PERDIDO' ? 'lost' : 'found'}`}>
                  {aviso.estado}
                </span>
                <h4>{aviso.nombre}</h4>
                <p>{aviso.raza} - {aviso.comuna}</p>
              </div>
            ));
          })()}
          {organizaciones.length > 0 && (
            <div className="mini-alert-card help">
              <span className="mini-alert-badge org">AYUDA</span>
              <h4>{organizaciones[0].nombre}</h4>
              <p>Cupos disponibles - {organizaciones[0].comuna}</p>
            </div>
          )}
        </div>
        {toast && (
          <div className="custom-modal-overlay" onClick={() => setToast(null)}>
            <div className={`custom-modal ${toastType === 'error' ? 'modal-error' : 'modal-success'}`} onClick={e => e.stopPropagation()}>
              <div className="modal-icon">{toastType === 'error' ? '❌' : '✅'}</div>
              <p className="modal-message">{toast}</p>
              <button className="modal-close-btn-custom" onClick={() => setToast(null)}>Aceptar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {toast && (
        <div className="custom-modal-overlay" onClick={() => setToast(null)}>
          <div className={`custom-modal ${toastType === 'error' ? 'modal-error' : 'modal-success'}`} onClick={e => e.stopPropagation()}>
            <div className="modal-icon">{toastType === 'error' ? '❌' : '✅'}</div>
            <p className="modal-message">{toast}</p>
            <button className="modal-close-btn-custom" onClick={() => setToast(null)}>Aceptar</button>
          </div>
        </div>
      )}

      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={'sidebar-overlay' + (sidebarOpen ? ' active' : '')} onClick={() => setSidebarOpen(false)} />
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" className="sidebar-logo-img" />
          <div>
            <h3>Sanos y Salvos</h3>
            <span className="role-badge">{userRole === 'ADMIN_ORGANIZACION' || userRole === 'ADMIN_ORG' ? 'Fundacion' : 'Usuario'}</span>
          </div>
        </div>
        <nav className="sidebar-menu">
          <button className={'menu-item' + (activeTab === 'avisos' ? ' active' : '')} onClick={() => { setActiveTab('avisos'); setSidebarOpen(false); }}>Buscar Avisos</button>
          <button className={'menu-item' + (activeTab === 'publicar' ? ' active' : '')} onClick={() => { setActiveTab('publicar'); setSidebarOpen(false); }}>Publicar Alerta</button>
          <button className={'menu-item' + (activeTab === 'organizaciones' ? ' active' : '')} onClick={() => { setActiveTab('organizaciones'); setSidebarOpen(false); }}>Organizaciones</button>
          <button className={'menu-item' + (activeTab === 'coincidencias' ? ' active' : '')} onClick={() => { setActiveTab('coincidencias'); setSidebarOpen(false); }}>Coincidencias <span className="notif-count">{coincidencias.length}</span></button>
        </nav>
        <div className="sidebar-user-profile">
          <div className="profile-avatar">
            {loginForm.username ? loginForm.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info">
            <span className="profile-email">{loginForm.username || 'Usuario'}</span>
            <span className="role-badge">{userRole === 'ADMIN_ORGANIZACION' || userRole === 'ADMIN_ORG' ? 'Fundacion' : 'Usuario'}</span>
          </div>
          <button onClick={() => { setIsLoggedIn(false); setAuthToken(null); localStorage.removeItem('luna_token'); localStorage.removeItem('luna_rol'); }} className="btn-logout" title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <main className="content-area">
        {activeTab === 'avisos' && (
          <div>
            <div className="content-header">
              <h2>Mascotas perdidas y encontradas</h2>
              <input type="text" placeholder="Buscar por nombre, raza o comuna..." className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {cargando && <p>Cargando mascotas desde el servidor...</p>}

            <div className="advanced-filter-ribbon">
              <div className="status-pill-group">
                <button className={'pill-btn' + (statusFilter === 'TODOS' ? ' active' : '')} onClick={() => setStatusFilter('TODOS')}>Todos ({avisos.length})</button>
                <button className={'pill-btn lost' + (statusFilter === 'PERDIDO' ? ' active' : '')} onClick={() => setStatusFilter('PERDIDO')}>Perdidos</button>
                <button className={'pill-btn found' + (statusFilter === 'ENCONTRADO' ? ' active' : '')} onClick={() => setStatusFilter('ENCONTRADO')}>Encontrados</button>
              </div>
              <div className="dropdown-filter-group">
                <label>Especie:</label>
                <select value={specieFilter} onChange={e => setSpecieFilter(e.target.value)}>
                  <option value="TODAS">Todas las especies</option>
                  <option value="PERRO">Perros</option>
                  <option value="GATO">Gatos</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
            </div>

            <div className="real-map-wrapper">
              <MapContainer center={CHILE_CENTER} zoom={CHILE_ZOOM} minZoom={4} maxZoom={18} maxBounds={CHILE_BOUNDS} maxBoundsViscosity={0.9} style={{ height: "300px", width: "100%", borderRadius: "16px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {avisosConCoordenadas.map(a => (
                  <Marker key={a.id} position={[a.lat, a.lng]} icon={a.estado === 'PERDIDO' ? iconPerdido : iconEncontrado}>
                    <Popup>
                      <strong>{a.nombre}</strong> ({a.estado})<br />
                      {a.raza} - {a.comuna}<br />
                      <button className="btn-popup-view" onClick={() => setAvisoSeleccionado(a)}>Ver Detalles</button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="map-badge-info">Visor Activo - OpenStreetMap y Leaflet</div>
            </div>

            <div className="cards-grid">
              {avisosFiltrados.map(aviso => (
                <div key={aviso.id} className={'pet-card ' + (aviso.estado || '').toLowerCase()} onClick={() => setAvisoSeleccionado(aviso)} style={{ cursor: 'pointer' }}>
                  <div className="pet-avatar-container">
                    {aviso.imagen ? (
                      <img src={aviso.imagen} alt={aviso.nombre} className="pet-card-img" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }} />
                    ) : null}
                    <span className="pet-avatar-fallback" style={{ display: aviso.imagen ? 'none' : 'block' }}>Pet</span>
                  </div>
                  <span className={'status-tag ' + (aviso.estado || '').toLowerCase()}>{aviso.estado}</span>
                  <h3>{aviso.nombre}</h3>
                  <p><strong>Raza:</strong> {aviso.raza} ({aviso.especie})</p>
                  <p><strong>Ubicacion:</strong> {aviso.comuna}</p>
                  <p><strong>Contacto:</strong> {aviso.contacto}</p>
                </div>
              ))}
              {avisosFiltrados.length === 0 && !cargando && (
                <p className="no-results-text">No se encontraron alertas. Publica una nueva alerta para comenzar.</p>
              )}
            </div>
          </div>
        )}

        {avisoSeleccionado && (
          <div className="modal-overlay" onClick={() => setAvisoSeleccionado(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setAvisoSeleccionado(null)}>x</button>
              <div className="modal-layout">
                <div className="modal-img-container">
                  {avisoSeleccionado.imagen ? (
                    <img src={avisoSeleccionado.imagen} alt={avisoSeleccionado.nombre} className="modal-main-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : null}
                  <span className="modal-fallback-icon">Pet</span>
                </div>
                <div className="modal-info-side">
                  <span className={'status-tag-modal ' + (avisoSeleccionado.estado || '').toLowerCase()}>{avisoSeleccionado.estado}</span>
                  <h2>{avisoSeleccionado.nombre}</h2>
                  <hr />
                  <p><strong>Especie:</strong> {avisoSeleccionado.especie}</p>
                  <p><strong>Raza:</strong> {avisoSeleccionado.raza}</p>
                  <p><strong>Comuna:</strong> {avisoSeleccionado.comuna}</p>
                  <p><strong>Geolocalizacion:</strong> Lat: {avisoSeleccionado.lat != null ? avisoSeleccionado.lat.toFixed(4) : 'N/A'} | Lng: {avisoSeleccionado.lng != null ? avisoSeleccionado.lng.toFixed(4) : 'N/A'}</p>
                  <div className="modal-comments-section">
                    <h3>Pistas y Avistamientos</h3>
                    <div className="comments-log-container">
                      {!avisoSeleccionado.comentarios || avisoSeleccionado.comentarios.length === 0 ? (
                        <p className="no-comments-yet">Sin pistas aun.</p>
                      ) : (
                        avisoSeleccionado.comentarios.map((c, idx) => (
                          <div key={idx} className="comment-bubble">
                            <div className="comment-meta"><strong>{c.autor}</strong> <span>{c.fecha}</span></div>
                            <p>{c.texto}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleAddComment} className="comment-input-form">
                      <input type="text" placeholder="Escribe un avistamiento..." required value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} />
                      <button type="submit">Enviar</button>
                    </form>
                  </div>
                  <div className="modal-contact-box">
                    <h3>Contacto Directo:</h3>
                    <p className="modal-phone">{avisoSeleccionado.contacto}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publicar' && (
          <div className="form-container-box" style={{ maxWidth: '900px' }}>
            <h2>Generar nueva alerta de rastreo</h2>
            <p className="form-instructions-text">Ingresa los datos y haz clic en el mapa para fijar coordenadas.</p>
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
                      <option value="Otros">Otros</option>
                    </select>
                    {nuevoAviso.especie === 'Otros' && (
                      <input type="text" placeholder="Ej: Conejo, Tortuga, Ave..." value={otroEspecie} onChange={e => setOtroEspecie(e.target.value)} style={{ marginTop: '8px' }} />
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Raza</label>
                    <input type="text" placeholder="Ej: Poodle" required value={nuevoAviso.raza} onChange={e => setNuevoAviso({ ...nuevoAviso, raza: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Estado</label>
                    <select value={nuevoAviso.estado} onChange={e => setNuevoAviso({ ...nuevoAviso, estado: e.target.value })}>
                      <option value="PERDIDO">PERDIDO</option>
                      <option value="ENCONTRADO">ENCONTRADO</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Comuna</label>
                  <input type="text" placeholder="Ej: Providencia" required value={nuevoAviso.comuna} onChange={e => setNuevoAviso({ ...nuevoAviso, comuna: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Telefono de contacto</label>
                  <input type="text" placeholder="+569 XXXXXXXX" required value={nuevoAviso.contacto} onChange={e => setNuevoAviso({ ...nuevoAviso, contacto: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Fotografia</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input-custom" />
                  {previewImage && <img src={previewImage} alt="Preview" className="form-image-preview-thumbnail" />}
                </div>
                <div className="coordinates-display-box">
                  <strong>Punto:</strong> Lat: {nuevoAviso.lat.toFixed(5)} | Lng: {nuevoAviso.lng.toFixed(5)}
                </div>
                <button type="submit" className="btn-submit">Despachar Alerta</button>
              </form>
              <div className="interactive-capture-map">
                <label className="map-capture-label">Haz clic en el mapa:</label>
                <MapContainer center={CHILE_CENTER} zoom={CHILE_ZOOM} minZoom={4} maxZoom={18} maxBounds={CHILE_BOUNDS} maxBoundsViscosity={0.9} style={{ height: "340px", width: "100%", borderRadius: "12px" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler />
                  <Marker position={[nuevoAviso.lat, nuevoAviso.lng]} icon={nuevoAviso.estado === 'PERDIDO' ? iconPerdido : iconEncontrado} />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organizaciones' && (
          <div>
            <div className="content-header"><h2>Organizaciones y Fundaciones</h2></div>
            <div className="org-layout">
              {(userRole === 'ADMIN_ORGANIZACION' || userRole === 'ADMIN_ORG') && (
                <div className="form-container-box side-form">
                  <h3>Inscribir Fundacion</h3>
                  <form onSubmit={handleRegistrarOrg} className="pro-form">
                    <div className="form-field"><label>Nombre</label><input type="text" required value={nuevaOrg.nombre} onChange={e => setNuevaOrg({ ...nuevaOrg, nombre: e.target.value })} /></div>
                    <div className="form-field"><label>RUT</label><input type="text" placeholder="11.222.333-4" required value={nuevaOrg.rut} onChange={e => setNuevaOrg({ ...nuevaOrg, rut: e.target.value })} /></div>
                    <div className="form-field"><label>Comuna</label><input type="text" required value={nuevaOrg.comuna} onChange={e => setNuevaOrg({ ...nuevaOrg, comuna: e.target.value })} /></div>
                    <div className="form-field"><label>Capacidad</label><input type="text" required value={nuevaOrg.capacity} onChange={e => setNuevaOrg({ ...nuevaOrg, capacity: e.target.value })} /></div>
                    <button type="submit" className="btn-submit">Guardar</button>
                  </form>
                </div>
              )}
              <div className="org-grid">
                {organizaciones.map(o => (
                  <div key={o.id} className="org-card">
                    <div className="org-icon">Org</div>
                    <h3>{o.nombre}</h3>
                    <p><strong>RUT:</strong> {o.rut}</p>
                    <p><strong>Comuna:</strong> {o.comuna}</p>
                    <span className="badge-active">Verificada</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coincidencias' && (
          <div>
            <div className="content-header"><h2>Motor de Coincidencias</h2></div>
            <div className="coincidencias-list">
              {coincidencias.map(c => (
                <div key={c.id} className="coincidencia-item">
                  <div className="coin-header">
                    <span className="coin-percentage">{c.porcentaje}% de Match</span>
                    <span className="coin-status">{c.estado}</span>
                  </div>
                  <h3>Mascota: {c.perdida}</h3>
                  <p className="coin-desc">{c.encontrada}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
