/**
 * Contacto: medios de contacto y formulario (HU-23).
 */

const formContacto = document.getElementById('form-contacto');

// WhatsApp aparece solo cuando se carga el número (constante WHATSAPP en comun.js)
if (WHATSAPP) {
    const item = document.getElementById('contacto-whatsapp');
    item.querySelector('a').href = `https://wa.me/${WHATSAPP}`;
    item.hidden = false;
}

// Si tiene la sesión iniciada, el nombre y el correo ya vienen completos
usuarioActual().then(usuario => {
    if (!usuario) {
        return;
    }
    if (!formContacto.elements.nombre.value) {
        formContacto.elements.nombre.value = `${usuario.nombre} ${usuario.apellido}`.trim();
    }
    if (!formContacto.elements.email.value) {
        formContacto.elements.email.value = usuario.email;
    }
});

formContacto.addEventListener('submit', async evento => {
    evento.preventDefault();
    limpiarErrores(formContacto);

    // El nombre, el correo y el mensaje son obligatorios (HU-23)
    const datos = leerFormulario(formContacto);
    const errores = {
        nombre: errorTexto(datos.nombre, 'el nombre', 80),
        email: errorEmail(datos.email),
        mensaje: errorTexto(datos.mensaje, 'el mensaje', 2000),
    };
    if (mostrarErrores(formContacto, Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje)))) {
        return;
    }

    enviando(formContacto, true, 'Enviando…');
    const respuesta = await api('contacto', 'POST', datos);
    enviando(formContacto, false);

    if (!respuesta.ok) {
        mostrarAlerta(formContacto, respuesta.error);
        return;
    }
    formContacto.elements.mensaje.value = '';
    avisar(respuesta.data.mensaje);
});
