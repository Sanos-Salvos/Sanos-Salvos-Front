import mockData from '../mocks.json';

const BFF_URL = '/api/bff/organizaciones';

export async function listarOrganizaciones() {
    try {
        const res = await fetch(`${BFF_URL}/listar`);
        if (!res.ok) throw new Error('Error al listar organizaciones');
        const data = await res.json();
        return data.length > 0 ? data : mockData.organizaciones;
    } catch (error) {
        console.warn("Usando datos mokeados de organizaciones.");
        return mockData.organizaciones;
    }
}

export async function crearOrganizacion(org) {
    const res = await fetch(`${BFF_URL}/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org)
    });
    if (!res.ok) throw new Error('Error al crear organización');
    return res.json();
}

export async function buscarOrganizacion(id) {
    const res = await fetch(`${BFF_URL}/buscar/${id}`);
    if (!res.ok) throw new Error('Error al buscar organización');
    return res.json();
}

export async function actualizarOrganizacion(id, org) {
    const res = await fetch(`${BFF_URL}/actualizar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org)
    });
    if (!res.ok) throw new Error('Error al actualizar organización');
    return res.json();
}

export async function eliminarOrganizacion(id) {
    const res = await fetch(`${BFF_URL}/eliminar/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar organización');
    return res.json();
}