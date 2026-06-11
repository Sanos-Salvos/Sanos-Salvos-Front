import mockData from '../mocks.json';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Trae todos los avisos de mascotas desde la API Gateway general.
 * Si el microservicio está caído o vacío, carga los avisos de mocks.json.
 */
export const fetchAvisosAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/avisos`);
    if (!response.ok) throw new Error('Error en la respuesta del servidor');

    const data = await response.json();
    return data && data.length > 0 ? data : mockData.avisos;
  } catch (error) {
    console.warn("API Gateway general no disponible. Cargando avisos de contingencia desde mocks.json");
    return mockData.avisos;
  }
};

export const crearAvisoAPI = async (nuevoAviso) => {
  try {
    const response = await fetch(`${API_BASE_URL}/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoAviso)
    });
    if (!response.ok) throw new Error('No se pudo guardar el aviso en el servidor');
    return await response.json();
  } catch (error) {
    console.error("Error de red al sincronizar el aviso. Se guardó únicamente en el estado local de React:", error);
    throw error;
  }
};