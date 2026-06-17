import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from './context/AuthContext';

// Conexión con la API real
import { fetchAvisosAPI, crearAvisoAPI } from './services/api';
import { listarOrganizaciones, crearOrganizacion } from './services/organizacionService';
import { listarCoincidencias } from './services/coincidenciaService';

// Vistas Modulares
import LoginView from './features/auth/LoginView';
import PetExplorer from './features/pets/PetExplorer';
import PetForm from './features/pets/PetForm';
import OrganizationsView from './features/pets/OrganizationsView';
import MatchingDashboard from './features/pets/MatchingDashboard';
import PetDetailModal from './features/pets/PetDetailModal';

function App() {
  const { isLoggedIn, userRole, logout } = useAuth();

  // --- ESTADOS DE NAVEGACIÓN Y FILTROS ---
  const [activeTab, setActiveTab] = useState('avisos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [specieFilter, setSpecieFilter] = useState('TODAS');

  // --- ESTADOS INTERNOS DE DATOS ---
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

  // --- CARGA REAL DESDE EL BACKEND (SIN RESPALDOS DE MOCKDATA) ---
  useEffect(() => {
    const cargarTodo = async () => {
      if (!isLoggedIn) return;

      // Carga 1: Avisos Reales
      try {
        const datosAvisos = await fetchAvisosAPI();
        setAvisos(datosAvisos || []);
      } catch (e) {
        console.error("Error cargando avisos del Backend:", e);
        setAvisos([]); // Si falla, queda vacío en vez de usar mocks
      }

      // Carga 2: Organizaciones Reales
      try {
        const datosOrgs = await listarOrganizaciones();
        setOrganizaciones(datosOrgs || []);
      } catch (e) {
        console.error("Error cargando organizaciones del Backend:", e);
        setOrganizaciones([]);
      }

      // Carga 3: Coincidencias Reales
      try {
        const datosMatches = await listarCoincidencias();
        setCoincidencias(datosMatches || []);
      } catch (e) {
        console.error("Error cargando coincidencias del Backend:", e);
        setCoincidencias([]);
      }
    };

    cargarTodo();
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
      autor: userRole === 'ADMIN_ORGANIZACION' ? 'Organización_Verificada' : 'Usuario_Común',
      texto: nuevoComentario,
      fecha: new Date().toLocaleString()
    };

    const nuevosAvisos = avisos.map(a => {
      if (a.id === avisoSeleccionado.id || a._id === avisoSeleccionado._id) {
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
    const avisoCreado = { ...nuevoAviso, imagen: previewImage || '', comentarios: [] };

    try {
      const respuesta = await crearAvisoAPI(avisoCreado);
      // Insertamos en el estado el objeto real devuelto por la base de datos
      setAvisos([respuesta || { ...avisoCreado, id: Date.now() }, ...avisos]);
      alert("¡Aviso publicado con éxito en el Backend!");
    } catch (err) {
      console.error("Error al publicar en el servidor:", err);
      alert("No se pudo guardar en el Backend.");
    }

    setNuevoAviso({ nombre: '', especie: 'Perro', raza: '', estado: 'PERDIDO', comuna: '', contacto: '', imagen: '', lat: -33.4372, lng: -70.6506 });
    setPreviewImage(null);
    setActiveTab('avisos');
  };

  const handleRegistrarOrg = async (e) => {
    e.preventDefault();
    try {
      await crearOrganizacion(nuevaOrg);
      alert("Organización registrada con éxito.");
      const actualizarOrgs = await listarOrganizaciones();
      setOrganizaciones(actualizarOrgs || []);
    } catch (error) {
      console.error("Error al registrar organización:", error);
    }
    setNuevaOrg({ nombre: '', rut: '', comuna: '', capacity: '' });
    setActiveTab('organizaciones');
  };

  // --- FILTRADO DINÁMICO EN EL FRONT-END ---
  const avisosFiltrados = avisos.filter(a => {
    const matchesSearch =
      (a.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.comuna || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.raza || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || a.estado === statusFilter;
    const matchesSpecie = specieFilter === 'TODAS' || a.especie?.toUpperCase() === specieFilter;

    return matchesSearch && matchesStatus && matchesSpecie;
  });

  if (!isLoggedIn) {
    return <LoginView />;
  }

  return (
    <div className="dashboard-container">
      {toast && <div className="floating-toast-alert">{toast}</div>}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <Image src="/logo.png" alt="Sanos y Salvos Logo" width={40} height={40} className="sidebar-logo-img" />
          <div>
            <h3>Sanos y Salvos</h3>
            <span className="role-badge">{userRole === 'ADMIN_ORGANIZACION' ? '🏢 Fundación' : '👤 Usuario'}</span>
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