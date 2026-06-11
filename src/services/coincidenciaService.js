import mockData from '../mocks.json';

const BFF_URL = '/api/bff/coincidencias';

export async function listarCoincidencias() {
    try {
        const res = await fetch(`${BFF_URL}/listar`);
        if (!res.ok) throw new Error('Error al listar limitaciones');
        const data = await res.json();
        return data.length > 0 ? data : mockData.coincidencias;
    } catch (error) {
        return mockData.coincidencias;
    }
}

export async function obtenerCoincidencia(id) {
    const res = await fetch(`${BFF_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener coincidencia');
    return res.json();
}

export async function actualizarEstado(id, estado) {
    const res = await fetch(`${BFF_URL}/${id}/estado?estado=${estado}`, {
        method: 'PUT'
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
}