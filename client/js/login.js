/**
 * Página de iniciar sesión (HU-08).
 */

const formLogin = document.getElementById('form-login');

// Después de entrar se vuelve a la página que mandó acá (?volver=...) o al inicio
const volver = paginaParaVolver();

// "Creá una" lleva a crear cuenta conservando el ?volver=
document.getElementById('enlace-registro').href = 'registro.html' + location.search;

// Si ya tiene la sesión iniciada, no tiene sentido quedarse en esta página
usuarioActual().then(usuario => {
    if (usuario) {
        location.replace(volver);
    }
});

formLogin.addEventListener('submit', async evento => {
    evento.preventDefault();
    limpiarErrores(formLogin);

    const datos = leerFormulario(formLogin);
    const errores = {};
    if (errorEmail(datos.email)) {
        errores.email = errorEmail(datos.email);
    }
    if (!datos.password) {
        errores.password = 'Completá la contraseña';
    }
    if (mostrarErrores(formLogin, errores)) {
        return;
    }

    enviando(formLogin, true, 'Ingresando…');
    const respuesta = await api('auth/login', 'POST', datos);

    if (respuesta.ok) {
        location.href = volver;
        return;
    }
    enviando(formLogin, false);
    // "Correo o contraseña incorrectos" o "Tu cuenta está suspendida…"
    mostrarAlerta(formLogin, respuesta.error);
});
