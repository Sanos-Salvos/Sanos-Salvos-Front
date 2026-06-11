import mockData from '../mocks.json';

const BFF_URL = '/api/bff/animales';

export async function listarMascotas() {
    try {
        const res = await fetch(`${BFF_URL}/listar`);
        if (!res.ok) throw new Error('Error al listar mascotas');
        const data = await res.json();

        // Si el backend responde exitosamente pero no hay nada en BD, muestra tus ejemplos
        return data.length > 0 ? data : mockData.avisos;
    } catch (error) {
        console.warn("BFF no detectado o caído. Usando datos mokeados de mascotas.");
        return mockData.avisos;
    }
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