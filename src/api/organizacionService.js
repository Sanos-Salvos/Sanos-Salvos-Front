const BFF_URL = '/api/bff/organizaciones';

export async function listarOrganizaciones() {
    const res = await fetch(`${BFF_URL}/listar`);
    if (!res.ok) throw new Error('Error al listar organizaciones');
    return res.json();
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
