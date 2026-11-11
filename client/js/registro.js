/**
 * Página de crear cuenta (HU-07).
 */

const formRegistro = document.getElementById('form-registro');

// Después de crear la cuenta se vuelve a la página que mandó acá (?volver=...) o al inicio
const volver = paginaParaVolver();

// "Iniciá sesión" lleva al login conservando el ?volver=
document.getElementById('enlace-login').href = 'login.html' + location.search;

// Si ya tiene la sesión iniciada, no tiene sentido quedarse en esta página
usuarioActual().then(usuario => {
    if (usuario) {
        location.replace(volver);
    }
});

formRegistro.addEventListener('submit', async evento => {
    evento.preventDefault();
    limpiarErrores(formRegistro);

    const datos = leerFormulario(formRegistro);
    if (mostrarErrores(formRegistro, validarRegistro(datos))) {
        return;
    }

    // "repetir" solo se controla acá: al servidor no se manda
    const { repetir, ...cuenta } = datos;

    enviando(formRegistro, true, 'Creando cuenta…');
    const respuesta = await api('auth/register', 'POST', cuenta);

    if (respuesta.ok) {
        location.href = volver; // la sesión ya quedó iniciada
        return;
    }
    enviando(formRegistro, false);

    if (respuesta.estado === 409) {
        mostrarErrores(formRegistro, { email: respuesta.error }); // el correo ya está registrado
    } else {
        mostrarAlerta(formRegistro, respuesta.error);
    }
});

/** Devuelve { campo: 'mensaje' } con los campos que tienen error. */
function validarRegistro(datos) {
    const errores = {
        nombre: errorTexto(datos.nombre, 'el nombre', 60),
        apellido: errorTexto(datos.apellido, 'el apellido', 60),
        email: errorEmail(datos.email),
        telefono: errorTelefono(datos.telefono),
        password: errorPassword(datos.password),
        repetir: '',
    };

    if (!datos.repetir) {
        errores.repetir = 'Repetí la contraseña';
    } else if (datos.repetir !== datos.password) {
        errores.repetir = 'Las contraseñas no coinciden';
    }

    // Se quedan solo los campos que tienen un mensaje de error
    return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
}
