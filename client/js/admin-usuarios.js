/**
 * Panel: usuarios, con búsqueda, y suspender o reactivar cuentas (HU-21).
 */

let administrador = null;
let temporizador = null;

iniciar();

async function iniciar() {
    administrador = await entrarAlPanel();
    if (!administrador) {
        return;
    }

    document.getElementById('contenido').innerHTML = `
        ${encabezadoAdmin('Usuarios', 'Una cuenta suspendida no puede iniciar sesión hasta que se reactive.')}

        <form id="form-buscar" class="panel-caja filtros-admin" role="search">
            <div class="buscador">
                <label class="oculto-visual" for="buscar-usuario">Buscar usuarios</label>
                ${icono('buscar', 20)}
                <input type="search" id="buscar-usuario" name="buscar" placeholder="Buscar por nombre o correo…">
            </div>
        </form>

        <section class="panel-caja" aria-label="Lista de usuarios">
            <div id="lista-usuarios"><p class="cargando">Cargando…</p></div>
        </section>`;

    const formulario = document.getElementById('form-buscar');
    formulario.addEventListener('input', () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => cargar(formulario.elements.buscar.value.trim()), 300);
    });
    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        cargar(formulario.elements.buscar.value.trim());
    });
    document.getElementById('lista-usuarios').addEventListener('click', cambiarEstado);

    cargar('');
}

async function cargar(buscar) {
    const respuesta = await api('admin/usuarios' + (buscar ? '?buscar=' + encodeURIComponent(buscar) : ''));
    const lista = document.getElementById('lista-usuarios');
    if (!respuesta.ok) {
        lista.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    if (respuesta.data.length === 0) {
        lista.innerHTML = vacioAdmin('buscar', 'No hay usuarios con esa búsqueda', 'Probá con otro nombre o correo.');
        return;
    }

    lista.innerHTML = `
        <table class="tabla">
            <thead>
                <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Registro</th><th>Estado</th><th><span class="oculto-visual">Acciones</span></th></tr>
            </thead>
            <tbody>
                ${respuesta.data.map(usuario => {
                    const nombre = escapar(`${usuario.nombre} ${usuario.apellido}`.trim());
                    const suspendido = usuario.estado === 'suspendido';
                    // El administrador no puede suspender su propia cuenta (HU-21)
                    const accion = usuario.id_usuario === administrador.id_usuario
                        ? '<span class="panel-caja__ayuda">Tu cuenta</span>'
                        : `<button class="boton boton--chico ${suspendido ? '' : 'boton--borde'}" type="button"
                                   data-id="${usuario.id_usuario}" data-nombre="${nombre}" data-estado="${suspendido ? 'activo' : 'suspendido'}">
                               ${suspendido ? 'Reactivar' : 'Suspender'}
                           </button>`;
                    return `
                        <tr${suspendido ? ' class="tabla__fila--apagada"' : ''}>
                            <td data-titulo="Nombre">
                                <span class="usuario-mini"><span class="avatar" aria-hidden="true">${inicial(usuario.nombre)}</span><strong>${nombre}</strong></span>
                            </td>
                            <td data-titulo="Correo">${escapar(usuario.email)}</td>
                            <td data-titulo="Teléfono">${escapar(usuario.telefono)}</td>
                            <td data-titulo="Rol">${etiquetaEstado(usuario.rol === 'administrador' ? 'Administrador' : 'Cliente')}</td>
                            <td data-titulo="Registro">${fecha(usuario.fecha_registro)}</td>
                            <td data-titulo="Estado">${etiquetaEstado(suspendido ? 'Suspendido' : 'Activo')}</td>
                            <td data-titulo="">${accion}</td>
                        </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

async function cambiarEstado(evento) {
    const boton = evento.target.closest('[data-estado]');
    if (!boton) {
        return;
    }
    const estado = boton.dataset.estado;
    const nombre = boton.dataset.nombre;

    if (estado === 'suspendido' && !confirm(`¿Suspender la cuenta de ${nombre}?\nNo va a poder iniciar sesión hasta que la reactives.`)) {
        return;
    }

    boton.disabled = true;
    const respuesta = await api(`admin/usuarios/${boton.dataset.id}/estado`, 'PATCH', { estado });
    if (!respuesta.ok) {
        boton.disabled = false;
        avisar(respuesta.error, { tipo: 'error' });
        return;
    }
    avisar(estado === 'suspendido' ? `Se suspendió la cuenta de ${nombre}` : `Se reactivó la cuenta de ${nombre}`);
    cargar(document.getElementById('form-buscar').elements.buscar.value.trim());
}
