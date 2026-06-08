const BFF_URL = '/api/bff/animales';

export async function listarMascotas() {
    const res = await fetch(`${BFF_URL}/listar`);
    if (!res.ok) throw new Error('Error al listar mascotas');
    return res.json();
}

export async function crearMascota(mascota) {
    const res = await fetch(`${BFF_URL}/nuevo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascota)
    });
    if (!res.ok) throw new Error('Error al crear mascota');
    return res.json();
}

export async function actualizarMascota(id, mascota) {
    const res = await fetch(`${BFF_URL}/actualizar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascota)
    });
    if (!res.ok) throw new Error('Error al actualizar mascota');
    return res.json();
}

export async function eliminarMascota(id) {
    const res = await fetch(`${BFF_URL}/eliminar/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar mascota');
    return res.json();
}
