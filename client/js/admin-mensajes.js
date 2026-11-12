/**
 * Panel: mensajes que llegaron por el formulario de contacto (HU-23).
 */

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }
    const contenido = document.getElementById('contenido');
    const respuesta = await api('admin/mensajes');

    if (!respuesta.ok) {
        contenido.innerHTML = encabezadoAdmin('Mensajes') + `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    const mensajes = respuesta.data;

    contenido.innerHTML = `
        ${encabezadoAdmin('Mensajes', `${mensajes.length} ${mensajes.length === 1 ? 'mensaje' : 'mensajes'} del formulario de contacto`)}
        ${mensajes.length === 0
            ? `<section class="panel-caja">${vacioAdmin('mensaje', 'Todavía no llegó ningún mensaje', 'Los mensajes del formulario de Contacto aparecen acá.')}</section>`
            : mensajes.map(mensaje => `
                <article class="panel-caja mensaje-admin">
                    <span class="avatar" aria-hidden="true">${inicial(mensaje.nombre)}</span>
                    <header class="mensaje-admin__encabezado">
                        <strong>${escapar(mensaje.nombre)}</strong>
                        <a href="mailto:${escapar(mensaje.email)}">${escapar(mensaje.email)}</a>
                        <span class="mensaje-admin__fecha">${icono('reloj', 14)} ${fecha(mensaje.fecha_envio, true)}</span>
                    </header>
                    <p class="mensaje-admin__texto">${escapar(mensaje.mensaje)}</p>
                </article>`).join('')}`;
}
