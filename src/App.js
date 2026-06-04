import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { fetchAvisosAPI, crearAvisoAPI } from './services/api';

// Vistas Modulares
import LoginView from './features/auth/LoginView';
import PetExplorer from './features/pets/PetExplorer';
import PetForm from './features/pets/PetForm';
import OrganizationsView from './features/pets/OrganizationsView';
import MatchingDashboard from './features/pets/MatchingDashboard';
import PetDetailModal from './features/pets/PetDetailModal';

import './App.css';

function App() {
  const { isLoggedIn, userRole, logout } = useAuth();

  // --- ESTADOS DE NAVEGACIÓN Y FILTROS ---
  const [activeTab, setActiveTab] = useState('avisos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [specieFilter, setSpecieFilter] = useState('TODAS');

  // --- ESTADOS INTERNOS DE DATOS (INICIALIZADOS VACÍOS POR REQUISITO) ---
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);
  const [toast, setToast] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const [avisos, setAvisos] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [coincidencias, setCoincidencias] = useState([]);

  const [nuevoAviso, setNuevoAviso] = useState({
    nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO', comuna: '', contacto: '', imagen: '', lat: -33.4372, lng: -70.6506
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [nuevaOrg, setNuevaOrg] = useState({ nombre: '', rut: '', comuna: '', capacity: '' });

  // --- DATOS MOKEADOS DE RESPALDO (VIVENE AQUÍ PARA CASOS DE FALLO O BD VACÍA) ---
  const MOCK_AVISOS = [
    {
      id: "mock-1",
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
    { id: "mock-2", nombre: "Luna", especie: "Gato", raza: "Siamés", estado: "ENCONTRADO", lat: -33.4250, lng: -70.6150, comuna: "Providencia", contacto: "+56933334444", imagen: "/mascotas/image2.jpg", comentarios: [] },
    { id: "mock-3", nombre: "Thor", especie: "Perro", raza: "Golden", estado: "PERDIDO", lat: -33.4800, lng: -70.6120, comuna: "San Miguel", contacto: "+56955556666", imagen: "/mascotas/image3.jpg", comentarios: [] }
  ];

  const MOCK_ORGANIZACIONES = [
    { id: "mock-org-1", nombre: "Fundación Patitas A Salvo", rut: "12.345.678-9", comuna: "Ñuñoa", capacidad: "50 mascotas" },
    { id: "mock-org-2", nombre: "Rescate Animal Chile", rut: "76.999.111-k", comuna: "Maipú", capacity: "120 mascotas" }
  ];

  const MOCK_COINCIDENCIAS = [
    { id: "mock-coin-1", perdida: "Thor (Golden)", encontrada: "Mascota similar reportada en San Miguel", porcentaje: 95, estado: "PENDIENTE" }
  ];

  // --- SCONEXIÓN E INYECTADO DINÁMICO ---
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const data = await fetchAvisosAPI();

        if (data && data.length > 0) {
          // Si el Gateway responde con datos reales, combinamos los datos reales con los de ejemplo
          // Filtrando por ID para evitar duplicados en re-renders
          setAvisos(() => {
            const existingIds = new Set(data.map(item => item.id));
            const distinctMocks = MOCK_AVISOS.filter(mock => !existingIds.has(mock.id));
            return [...data, ...distinctMocks];
          });
        } else {
          // Si la base de datos está vacía pero conectada, cargamos los mocks para ilustrar la app
          setAvisos(MOCK_AVISOS);
        }
      } catch (error) {
        console.warn("Backend / API Gateway no detectado. Cargando datos mokeados de resguardo.");
        setAvisos(MOCK_AVISOS);
      }

      // Cargamos por defecto las estructuras organizacionales y coincidencias muestra
      setOrganizaciones(MOCK_ORGANIZACIONES);
      setCoincidencias(MOCK_COINCIDENCIAS);
    };

    if (isLoggedIn) {
      loadBackendData();
    }
  }, [isLoggedIn]);

  // --- UTILS ---
  const triggerToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 6000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

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

  const handlePublicar = async (e) => {
    e.preventDefault();
    const avisoCreado = { ...nuevoAviso, imagen: previewImage || '/mascotas/image1.jpg', comentarios: [] };

    // Generación ID Temporal para renderizado inmediato reactivo
    const localId = Date.now();
    setAvisos([{ ...avisoCreado, id: localId }, ...avisos]);

    try {
      // Intenta guardarlo de forma efectiva en la base de datos a través de axios/fetch remoto
      await crearAvisoAPI(avisoCreado);
    } catch (err) {
      console.error("Error de sincronización remota con el microservicio:", err);
    }

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
      triggerToast(`🚨 ¡ALERTA DE COINCIDENCIA! El motor ha detectado una mascota con un 88% de similitud de coordenadas en la zona de ${avisoCreado.comuna}.`);
    }, 3000);
  };

  const handleRegistrarOrg = (e) => {
    e.preventDefault();
    setOrganizaciones([...organizaciones, { ...nuevaOrg, id: organizaciones.length + 1 }]);
    alert("Organización registrada de manera local.");
    setNuevaOrg({ nombre: '', rut: '', comuna: '', capacity: '' });
    setActiveTab('organizaciones');
  };

  // --- FILTRADO DINÁMICO ---
  const avisosFiltrados = avisos.filter(a => {
    const matchesSearch =
      (a.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.comuna || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.raza || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || a.estado === statusFilter;
    const matchesSpecie = specieFilter === 'TODAS' || a.especie?.toUpperCase() === specieFilter;

    return matchesSearch && matchesStatus && matchesSpecie;
  });

  // --- RENDERS ASOCIADOS A AUTENTICACIÓN ---
  if (!isLoggedIn) {
    return <LoginView organizaciones={organizaciones} setOrganizaciones={setOrganizaciones} />;
  }

  return (
    <div className="dashboard-container">
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

        <button onClick={logout} className="btn-logout">🚪 Cerrar Sesión</button>
      </aside>

      <main className="content-area">
        {activeTab === 'avisos' && (
          <PetExplorer
            avisos={avisos}
            avisosFiltrados={avisosFiltrados}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            specieFilter={specieFilter}
            setSpecieFilter={setSpecieFilter}
            setAvisoSeleccionado={setAvisoSeleccionado}
          />
        )}

        {activeTab === 'publicar' && (
          <PetForm
            nuevoAviso={nuevoAviso}
            setNuevoAviso={setNuevoAviso}
            previewImage={previewImage}
            handleImageChange={handleImageChange}
            handlePublicar={handlePublicar}
            triggerToast={triggerToast}
          />
        )}

        {activeTab === 'organizaciones' && (
          <OrganizationsView
            organizaciones={organizaciones}
            nuevaOrg={nuevaOrg}
            setNuevaOrg={setNuevaOrg}
            handleRegistrarOrg={handleRegistrarOrg}
          />
        )}

        {activeTab === 'coincidencias' && (
          <MatchingDashboard coincidencias={coincidencias} />
        )}

        <PetDetailModal
          aviso={avisoSeleccionado}
          onClose={() => setAvisoSeleccionado(null)}
          nuevoComentario={nuevoComentario}
          setNuevoComentario={setNuevoComentario}
          onAddComment={handleAddComment}
        />
      </main>
    </div>
  );
}

export default App;