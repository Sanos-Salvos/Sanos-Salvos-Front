import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Corrección de los iconos por defecto de Leaflet para entornos SPA
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

function App() {
  // --- ESTADOS GLOBALES DE SESIÓN ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('USER'); // USER o ADMIN_ORG
  const [activeTab, setActiveTab] = useState('avisos');
  const [searchTerm, setSearchTerm] = useState('');

  // --- NUEVOS ESTADOS PARA FILTROS AVANZADOS ---
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [specieFilter, setSpecieFilter] = useState('TODAS');

  // --- ESTADO PARA VER ANUNCIO EN GRANDE (MODAL) ---
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);

  // --- ESTADOS DE AUTENTICACION ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', isOrg: false });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '', isOrg: false, nombreOrg: '', rut: '' });

  // --- NUEVO ESTADO PARA ALERTAS DE COINCIDENCIAS FLOTANTES  ---
  const [toast, setToast] = useState(null);


  const [usuariosRegistrados, setUsuariosRegistrados] = useState([
    { username: 'user@sanos.com', password: '123', role: 'USER' },
    { username: 'fundacion@sanos.com', password: '123', role: 'ADMIN_ORG' }
  ]);

  // --- DATOS MOCKADOS DE MASCOTAS ---
  const [avisos, setAvisos] = useState([
    {
      id: 1,
      nombre: "Firulais",
      especie: "Perro",
      raza: "Mestizo",
      estado: "PERDIDO",
      lat: -33.4420,
      lng: -70.6580,
      comuna: "Santiago Centro",
      contacto: "+56911112222",
      imagen: "/mascotas/image1.jpg",
      comentarios: [
        { autor: 'Vecino_Santi', texto: 'Vi a un perrito similar corriendo asustado cerca del Metro Los Héroes.', fecha: '12-05-2026 20:15' }
      ]
    },
    {
      id: 2,
      nombre: "Luna",
      especie: "Gato",
      raza: "Siamés",
      estado: "ENCONTRADO",
      lat: -33.4250,
      lng: -70.6150,
      comuna: "Providencia",
      contacto: "+56933334444",
      imagen: "/mascotas/image2.jpg",
      comentarios: []
    },
    {
      id: 3,
      nombre: "Thor",
      especie: "Perro",
      raza: "Golden",
      estado: "PERDIDO",
      lat: -33.4800,
      lng: -70.6120,
      comuna: "San Miguel",
      contacto: "+56955556666",
      imagen: "/mascotas/image3.jpg",
      comentarios: []
    },
  ]);

  const [organizaciones, setOrganizaciones] = useState([
    { id: 1, nombre: "Fundación Patitas A Salvo", rut: "12.345.678-9", comuna: "Ñuñoa", capacidad: "50 mascotas" },
    { id: 2, nombre: "Rescate Animal Chile", rut: "76.999.111-k", comuna: "Maipú", capacity: "120 mascotas" },
  ]);

  const [coincidencias, setCoincidencias] = useState([
    { id: 101, perdida: "Thor (Golden)", encontrada: "Mascota similar reportada en San Miguel", porcentaje: 95, estado: "PENDIENTE" }
  ]);

  // Formulario extendido para soportar coordenadas exactas por mapa
  const [nuevoAviso, setNuevoAviso] = useState({
    nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO',
    comuna: '', contacto: '', imagen: '',
    lat: -33.4372, lng: -70.6506
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevaOrg, setNuevaOrg] = useState({ nombre: '', rut: '', comuna: '', capacity: '' });

  // Función utilitaria para gatillar alertas de cruces del Motor de IA
  const triggerToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 6000);
  };

  // --- MANEJO DE IMÁGENES CON VISTA PREVIA NATIVA ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SUBCOMPONENTE LEAFLET: Captura clics del usuario en el mapa de publicación ---
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        setNuevoAviso(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        triggerToast("📍 Coordenadas capturadas con éxito en el formulario perimetral.");
      },
    });
    return null;
  }

  // --- ENVIAR COMENTARIO REAL AL MODAL EN TIEMPO REAL ---
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    const comentarioObj = {
      autor: userRole === 'ADMIN_ORG' || userRole === 'ADMIN_ORGANIZACION' ? 'Organización_Verificada' : 'Usuario_Común',
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

  // --- COMPORTAMIENTOS DE AUTENTICACIÓN ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const usuarioEncontrado = usuariosRegistrados.find(u =>
      u.username.toLowerCase() === loginForm.username.toLowerCase() &&
      u.password === loginForm.password
    );

    if (usuarioEncontrado) {
      const rolSeleccionado = loginForm.isOrg ? 'ADMIN_ORG' : 'USER';
      if (usuarioEncontrado.role !== rolSeleccionado) {
        alert(`Error: Esta cuenta no está registrada como ${loginForm.isOrg ? 'Organización' : 'Usuario Común'}.`);
        return;
      }
      setUserRole(usuarioEncontrado.role);
      setIsLoggedIn(true);
      alert("¡Sesión iniciada con éxito!");
    } else {
      alert("Credenciales inválidas. Inténtalo de nuevo o crea una cuenta.");
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    const existe = usuariosRegistrados.some(u => u.username.toLowerCase() === registerForm.username.toLowerCase());
    if (existe) {
      alert("Este correo electrónico ya existe.");
      return;
    }
    const nuevoRol = registerForm.isOrg ? 'ADMIN_ORG' : 'USER';
    setUsuariosRegistrados([...usuariosRegistrados, {
      username: registerForm.username,
      password: registerForm.password,
      role: nuevoRol
    }]);
    if (registerForm.isOrg && registerForm.nombreOrg) {
      setOrganizaciones([...organizaciones, {
        id: organizaciones.length + 1,
        nombre: registerForm.nombreOrg,
        rut: registerForm.rut || "Pendiente",
        comuna: "Por Definir",
        capacidad: "Por Configurar"
      }]);
    }
    alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
    setIsRegistering(false);
    setLoginForm({ username: registerForm.username, password: registerForm.password, isOrg: registerForm.isOrg });
  };

  // --- COMPORTAMIENTOS DEL DASHBOARD INTERNO ---
  const handlePublicar = (e) => {
    e.preventDefault();

    const avisoCreado = {
      ...nuevoAviso,
      id: avisos.length + 1,
      imagen: previewImage || '/mascotas/image1.jpg',
      comentarios: []
    };

    setAvisos([avisoCreado, ...avisos]);

    if (avisoCreado.especie === "Perro") {
      setCoincidencias([{
        id: coincidencias.length + 101,
        perdida: `${avisoCreado.nombre} (${avisoCreado.raza})`,
        encontrada: `Alerta de geolocalización detectada en radio de 2km (${avisoCreado.comuna})`,
        porcentaje: 88,
        estado: "VERIFICANDO"
      }, ...coincidencias]);
    }

    alert("¡Aviso publicado con éxito!");

    setNuevoAviso({ nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO', comuna: '', contacto: '', imagen: '', lat: -33.4372, lng: -70.6506 });
    setPreviewImage(null);
    setActiveTab('avisos');

    setTimeout(() => {
      triggerToast(`🚨 ¡ALERTA DE COINCIDENCIA! El motor ha detectado una mascota ${avisoCreado.estado === 'PERDIDO' ? 'encontrada' : 'perdida'} con un 88% de similitud de coordenadas en la zona de ${avisoCreado.comuna}.`);
    }, 3000);
  };

  const handleRegistrarOrg = (e) => {
    e.preventDefault();
    setOrganizaciones([...organizaciones, { ...nuevaOrg, id: organizaciones.length + 1 }]);
    alert("Organización registrada.");
    setNuevaOrg({ nombre: '', rut: '', comuna: '', capacity: '' });
    setActiveTab('organizaciones');
  };

  // --- FILTRADO DINÁMICO COMBINADO (Buscador + Píldoras de Estado + Selector de Especie) ---
  const avisosFiltrados = avisos.filter(a => {
    const matchesSearch =
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.raza.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || a.estado === statusFilter;
    const matchesSpecie = specieFilter === 'TODAS' || a.especie.toUpperCase() === specieFilter;

    return matchesSearch && matchesStatus && matchesSpecie;
  });

  // --- VISTA 1: PORTAL DE ACCESO LOGIN  ---
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt="Sanos y Salvos Mini Logo"
          className="fixed-mini-logo"
        />

        {/* COLUMNA IZQUIERDA */}
        <div className="login-side-panel left-panel">
          <div className="side-panel-title">📢 Reportes Recientes</div>
          <div className="mini-alert-card lost">
            <div className="mini-card-avatar-box">
              <img src="/mascotas/image1.jpg" alt="Firulais" className="mini-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <span className="mini-alert-badge lost">PERDIDO</span>
            <h4>Firulais</h4>
            <p>Mestizo • Santiago Centro</p>
          </div>
          <div className="mini-alert-card found">
            <div className="mini-card-avatar-box">
              <img src="/mascotas/image2.jpg" alt="Luna" className="mini-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <span className="mini-alert-badge found">ENCONTRADO</span>
            <h4>Luna</h4>
            <p>Siamés • Providencia</p>
          </div>
        </div>

        {/* TARJETA CENTRAL DE LOGIN */}
        <div className="login-card">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Sanos y Salvos Central Logo"
            className="login-logo-img"
          />
          <p>Portal unificado de asistencia y rastreo de mascotas</p>

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-field-auth">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@sanos.com"
                  required
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className="form-field-auth">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>

              <div className="form-checkbox-auth">
                <input
                  type="checkbox"
                  id="loginIsOrg"
                  checked={loginForm.isOrg}
                  onChange={e => setLoginForm({ ...loginForm, isOrg: e.target.checked })}
                />
                <label htmlFor="loginIsOrg">Soy una Organización / Fundación inscrita</label>
              </div>

              <button type="submit" className="btn-auth-submit">Ingresar al Sistema</button>

              <p className="auth-toggle-text">
                ¿No tienes una cuenta? <span onClick={() => setIsRegistering(true)}>Crear una cuenta</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-field-auth">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@dominio.com"
                  required
                  value={registerForm.username}
                  onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div className="form-field-auth">
                <label>Establecer Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <div className="form-field-auth">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="Repita su contraseña"
                  required
                  value={registerForm.confirmPassword}
                  onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="form-checkbox-auth">
                <input
                  type="checkbox"
                  id="registerIsOrg"
                  checked={registerForm.isOrg}
                  onChange={e => setRegisterForm({ ...registerForm, isOrg: e.target.checked })}
                />
                <label htmlFor="registerIsOrg">Registrarme como Entidad/Organización</label>
              </div>

              {registerForm.isOrg && (
                <div className="animated-org-fields">
                  <div className="form-field-auth">
                    <label>Nombre de la Fundación</label>
                    <input
                      type="text"
                      placeholder="Ej: Fundación Huellitas"
                      required={registerForm.isOrg}
                      value={registerForm.nombreOrg}
                      onChange={e => setRegisterForm({ ...registerForm, nombreOrg: e.target.value })}
                    />
                  </div>
                  <div className="form-field-auth">
                    <label>RUT de la Organización</label>
                    <input
                      type="text"
                      placeholder="76.xxx.xxx-x"
                      required={registerForm.isOrg}
                      value={registerForm.rut}
                      onChange={e => setRegisterForm({ ...registerForm, rut: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-auth-submit register">Registrar mi Cuenta</button>

              <p className="auth-toggle-text">
                ¿Ya posees una cuenta? <span onClick={() => setIsRegistering(false)}>Iniciar Sesión</span>
              </p>
            </form>
          )}

          <span className="footer-token">Cifrado Perimetral & Tokens JWT - Gateway Auth</span>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="login-side-panel right-panel">
          <div className="side-panel-title">🔍 Últimos Avistamientos</div>
          <div className="mini-alert-card lost">
            <div className="mini-card-avatar-box">
              <img src="/mascotas/image3.jpg" alt="Thor" className="mini-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <span className="mini-alert-badge lost">PERDIDO</span>
            <h4>Thor</h4>
            <p>Golden • San Miguel</p>
          </div>
          <div className="mini-alert-card help">
            <span className="mini-alert-badge org">AYUDA</span>
            <h4>🏢 Refugio Huellitas</h4>
            <p>Cupos disponibles • Ñuñoa</p>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 2: APLICACIÓN PRINCIPAL ---
  return (
    <div className="dashboard-container">
      {/* Toast Flotante del Motor de Coincidencias */}
      {toast && <div className="floating-toast-alert">{toast}</div>}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Sanos y Salvos Logo" className="sidebar-logo-img" />
          <div>
            <h3>Sanos y Salvos</h3>
            <span className="role-badge">{userRole === 'ADMIN_ORGANIZACION' || userRole === 'ADMIN_ORG' ? '🏢 Fundación' : '👤 Usuario'}</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'avisos' ? 'active' : ''}`} onClick={() => setActiveTab('avisos')}>🔍 Buscar Avisos</button>
          <button className={`menu-item ${activeTab === 'publicar' ? 'active' : ''}`} onClick={() => setActiveTab('publicar')}>📢 Publicar Alerta</button>
          <button className={`menu-item ${activeTab === 'organizaciones' ? 'active' : ''}`} onClick={() => setActiveTab('organizaciones')}>🏢 Organizaciones</button>
          <button className={`menu-item ${activeTab === 'coincidencias' ? 'active' : ''}`} onClick={() => setActiveTab('coincidencias')}>🤝 Coincidencias <span className="notif-count">{coincidencias.length}</span></button>
        </nav>

        <button onClick={() => setIsLoggedIn(false)} className="btn-logout">🚪 Cerrar Sesión</button>
      </aside>

      <main className="content-area">
        {activeTab === 'avisos' && (
          <div>
            <div className="content-header">
              <h2>Mascotas perdidas y encontradas</h2>
              <input type="text" placeholder="Buscar por nombre, raza o comuna..." className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {/* BARRA DE FILTROS AVANZADOS COMBINADOS */}
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

            {/* VISOR DE GEOLOCALIZACIÓN NATIVO CON OPENSTREETMAP */}
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

            {/* GRIDS DE TARJETAS */}
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
        )}

        {/* --- MODAL FLOTANTE DE DETALLES CON SECCIÓN DE COMENTARIOS/PISTAS --- */}
        {avisoSeleccionado && (
          <div className="modal-overlay" onClick={() => setAvisoSeleccionado(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setAvisoSeleccionado(null)}>×</button>
              <div className="modal-layout">
                <div className="modal-img-container">
                  {avisoSeleccionado.imagen ? (
                    <img
                      src={avisoSeleccionado.imagen}
                      alt={avisoSeleccionado.nombre}
                      className="modal-main-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="modal-fallback-icon">🐾</span>
                </div>
                <div className="modal-info-side">
                  <span className={`status-tag-modal ${avisoSeleccionado.estado.toLowerCase()}`}>{avisoSeleccionado.estado}</span>
                  <h2>{avisoSeleccionado.nombre}</h2>
                  <hr />
                  <p><strong>Especie:</strong> {avisoSeleccionado.especie}</p>
                  <p><strong>Raza:</strong> {avisoSeleccionado.raza}</p>
                  <p><strong>📍 Sector / Comuna:</strong> {avisoSeleccionado.comuna}</p>
                  <p><strong>🌐 Geolocalización:</strong> Lat: {avisoSeleccionado.lat.toFixed(4)} | Lng: {avisoSeleccionado.lng.toFixed(4)}</p>

                  {/* SISTEMA DE INTEGRACIÓN DE PISTAS DE AVISTAMIENTOS */}
                  <div className="modal-comments-section">
                    <h3>📌 Pistas y Avistamientos de la Red Civil</h3>
                    <div className="comments-log-container">
                      {!avisoSeleccionado.comentarios || avisoSeleccionado.comentarios.length === 0 ? (
                        <p className="no-comments-yet">Sin pistas en la bitácora todavía. Si lo has visto, aporta abajo.</p>
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
                    <p className="modal-phone">{avisoSeleccionado.contacto}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publicar' && (
          <div className="form-container-box" style={{ maxWidth: '900px' }}>
            <h2>📢 Generar nueva alerta de rastreo</h2>
            <p className="form-instructions-text">Ingresa los descriptores morfológicos y **haz clic en el mapa de la derecha** para fijar las coordenadas exactas sobre OpenStreetMap.</p>

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

              {/* Mini-mapa interactivo para capturar clics espaciales */}
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
        )}

        {activeTab === 'organizaciones' && (
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
                      <label>Comuna Base</label>
                      <input type="text" required value={nuevaOrg.comuna} onChange={e => setNuevaOrg({ ...nuevaOrg, comuna: e.target.value })} />
                    </div>
                    <div className="form-field">
                      <label>Capacidad Máxima</label>
                      <input type="text" required value={nuevaOrg.capacity} onChange={e => setNuevaOrg({ ...nuevaOrg, capacity: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-submit">Guardar Base de Datos</button>
                  </form>
                </div>
              )}
              <div className="org-grid">
                {organizaciones.map(o => (
                  <div key={o.id} className="org-card">
                    <div className="org-icon">🏢</div>
                    <h3>{o.nombre}</h3>
                    <p><strong>RUT:</strong> {o.rut}</p>
                    <p><strong>📍 Comuna:</strong> {o.comuna}</p>
                    <span className="badge-active">Verificada</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coincidencias' && (
          <div>
            <div className="content-header">
              <h2>Motor de Coincidencias</h2>
            </div>
            <div className="coincidencias-list">
              {coincidencias.map(c => (
                <div key={c.id} className="coincidencia-item">
                  <div className="coin-header">
                    <span className="coin-percentage">🔥 {c.porcentaje}% de Match</span>
                    <span className="coin-status">{c.estado}</span>
                  </div>
                  <h3>Mascota: {c.perdida}</h3>
                  <p className="coin-desc">💡 {c.encontrada}</p>
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

