import mockData from '../mocks.json';

// Detecta si estamos corriendo dentro de Docker o en Localhost de manera automática
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : `http://${window.location.hostname}:8080/api`;

export const fetchAvisosAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/avisos`);
    if (!response.ok) throw new Error('Error en el servidor');

    const dataFromDB = await response.json();

    // Unimos los datos reales de la base de datos con los mocks de ejemplo
    return [...dataFromDB, ...mockData];
  } catch (error) {
    console.warn("No se pudo conectar a la API Gateway, usando solo datos de ejemplo:", error.message);
    // Si la API Gateway está caída o apagada, mostramos los mocks para que la app no muera
    return mockData;
  }
};

export const crearAvisoAPI = async (nuevoAviso, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nuevoAviso)
    });
    if (!response.ok) throw new Error('No se pudo guardar en la Base de Datos');
    return await response.json();
  } catch (error) {
    console.error("Error al guardar aviso en la base de datos:", error);
    throw error;
  }
};