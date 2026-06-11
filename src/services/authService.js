const BFF_URL = '/api/bff/auth';

export async function login(username, password) {
    const res = await fetch(`${BFF_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    return res.json();
}

export async function register(username, password, roles) {
    const res = await fetch(`${BFF_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, roles })
    });
    if (!res.ok) throw new Error('Error al registrar usuario');
    return res.json();
}

export async function validarSesion(token) {
    const res = await fetch(`${BFF_URL}/validar-sesion`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    if (!res.ok) return false;
    return res.json();
}