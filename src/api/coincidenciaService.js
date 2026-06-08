const BFF_URL = '/api/bff/coincidencias';

export async function listarCoincidencias() {
    const res = await fetch(`${BFF_URL}/listar`);
    if (!res.ok) throw new Error('Error al listar coincidencias');
    return res.json();
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
