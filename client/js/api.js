/**
 * Llamadas a la API del servidor.
 *
 * Uso:
 *   const respuesta = await api('productos');                                  // GET
 *   const respuesta = await api('auth/login', 'POST', { email, password });    // con datos
 *   if (respuesta.ok) { ...respuesta.data... } else { ...respuesta.error... }
 *
 * Nunca lanza un error: si el servidor no responde, devuelve { ok: false, error: '...' }.
 * Además del JSON del servidor, agrega "estado" con el código HTTP (401, 403, 409…).
 */

// Ruta relativa desde client/pages/ (ver la regla de rutas del CLAUDE.md)
const API = '../../server/api/';

async function api(ruta, metodo = 'GET', datos = null) {
    const opciones = { method: metodo, headers: {} };
    if (datos !== null) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(API + ruta, opciones);
        const json = await respuesta.json();
        json.estado = respuesta.status;
        return json;
    } catch (error) {
        return { ok: false, error: 'No se pudo conectar con el servidor. Probá de nuevo en un momento.', estado: 0 };
    }
}

/**
 * Devuelve (con await) el usuario con sesión iniciada o null si es un visitante.
 * Consulta /auth/me una sola vez por página, aunque se llame varias veces.
 */
let sesionCargada = null;

function usuarioActual() {
    if (sesionCargada === null) {
        sesionCargada = api('auth/me').then(respuesta => (respuesta.ok ? respuesta.data : null));
    }
    return sesionCargada;
}
