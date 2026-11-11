/**
 * Mi cuenta: mis pedidos (HU-15), mis datos y contraseña, y dirección de entrega (HU-10).
 * La sección se elige con la dirección: cuenta.html#pedidos, #pedido-3, #datos o #direccion.
 */

const panel = document.getElementById('seccion');
let usuario = null;

iniciar();

async function iniciar() {
    // Página privada: sin sesión, va al login (y después vuelve acá)
    usuario = await usuarioActual();
    if (!usuario) {
        location.replace(enlaceLogin());
        return;
    }
    document.getElementById('saludo').textContent = `Hola, ${usuario.nombre}`;

    window.addEventListener('hashchange', mostrarSeccion);
    mostrarSeccion();
}

function mostrarSeccion() {
    const elegida = location.hash.slice(1) || 'pedidos';
    const pedido = elegida.match(/^pedido-(\d+)$/);
    const seccion = pedido ? 'pedidos' : (['datos', 'direccion'].includes(elegida) ? elegida : 'pedidos');

    document.querySelectorAll('.cuenta__menu a').forEach(enlace => {
        if (enlace.dataset.seccion === seccion) {
            enlace.setAttribute('aria-current', 'page');
        } else {
            enlace.removeAttribute('aria-current');
        }
    });

    panel.innerHTML = '<p class="cargando">Cargando…</p>';
    if (pedido) {
        mostrarPedido(Number(pedido[1]));
    } else if (seccion === 'datos') {
        mostrarDatos();
    } else if (seccion === 'direccion') {
        mostrarDireccion();
    } else {
        mostrarPedidos();
    }
}

/* ---------- Mis pedidos (HU-15) ---------- */

async function mostrarPedidos() {
    const respuesta = await api('pedidos');
    if (!respuesta.ok) {
        panel.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    if (respuesta.data.length === 0) {
        panel.innerHTML = `
            <h2>Mis pedidos</h2>
            <p>Todavía no hiciste ningún pedido.</p>
            <a class="boton" href="catalogo.html">Ver el catálogo</a>`;
        return;
    }

    // Del más reciente al más antiguo (así los manda el servidor)
    panel.innerHTML = `
        <h2>Mis pedidos</h2>
        <table class="tabla">
            <thead>
                <tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th><span class="oculto-visual">Acciones</span></th></tr>
            </thead>
            <tbody>
                ${respuesta.data.map(pedido => `
                    <tr>
                        <td data-titulo="Pedido"><strong>#${pedido.id_pedido}</strong></td>
                        <td data-titulo="Fecha">${fecha(pedido.fecha_pedido)}</td>
                        <td data-titulo="Productos">${pedido.productos}</td>
                        <td data-titulo="Total"><strong>${precio(pedido.total)}</strong></td>
                        <td data-titulo="Estado">${etiquetaEstado(pedido.estado)}</td>
                        <td data-titulo=""><a href="#pedido-${pedido.id_pedido}">Ver detalle</a></td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

async function mostrarPedido(id) {
    const respuesta = await api(`pedidos/${id}`);
    if (!respuesta.ok) {
        panel.innerHTML = `
            <p class="alerta alerta--error">${escapar(respuesta.error)}</p>
            <a href="#pedidos">← Volver a mis pedidos</a>`;
        return;
    }
    const pedido = respuesta.data;

    panel.innerHTML = `
        <a class="enlace-flecha" href="#pedidos">← Volver a mis pedidos</a>
        <h2>Pedido #${pedido.id_pedido}</h2>
        <p class="admin-encabezado__subtitulo">${fecha(pedido.fecha_pedido, true)} · ${etiquetaEstado(pedido.estado)}</p>

        <ul class="lista-pedido">
            ${pedido.items.map(item => `
                <li class="item-pedido">
                    <a href="producto.html?id=${item.id_producto}" class="producto-mini">
                        <span class="producto-mini__foto">${fotoProducto(item.imagen)}</span>
                        <strong>${escapar(item.nombre)}</strong>
                    </a>
                    <span class="item-pedido__cantidad">${item.cantidad} × ${precio(item.precio_unitario)}</span>
                    <strong>${precio(item.subtotal)}</strong>
                </li>`).join('')}
        </ul>
        <p class="total-pedido">Total <strong>${precio(pedido.total)}</strong></p>

        <dl class="datos-lista cuenta__datos-pedido">
            <div><dt>Entrega</dt><dd>${escapar(pedido.metodo_entrega)}</dd></div>
            ${pedido.direccion_entrega ? `<div><dt>Dirección</dt><dd>${escapar(pedido.direccion_entrega)}</dd></div>` : ''}
            <div><dt>Pago</dt><dd>${escapar(pedido.metodo_pago)}</dd></div>
            ${pedido.nota_cliente ? `<div><dt>Tu nota</dt><dd>${escapar(pedido.nota_cliente)}</dd></div>` : ''}
        </dl>

        <h3>Seguimiento</h3>
        <ol class="historial">
            ${pedido.historial.map(cambio => `
                <li>
                    ${etiquetaEstado(cambio.estado)}
                    <span class="historial__fecha">${fecha(cambio.fecha_cambio, true)}</span>
                </li>`).join('')}
        </ol>`;
}

/* ---------- Mis datos y contraseña (HU-10) ---------- */

function mostrarDatos() {
    panel.innerHTML = `
        <h2>Mis datos</h2>
        <form id="form-perfil" novalidate>
            <div class="alerta alerta--error" role="alert" hidden></div>
            <div class="campos-dos">
                <div class="campo">
                    <label for="nombre">Nombre <span class="requerido">*</span></label>
                    <input id="nombre" name="nombre" maxlength="60" autocomplete="given-name" required>
                </div>
                <div class="campo">
                    <label for="apellido">Apellido <span class="requerido">*</span></label>
                    <input id="apellido" name="apellido" maxlength="60" autocomplete="family-name" required>
                </div>
                <div class="campo">
                    <label for="correo">Correo electrónico</label>
                    <input id="correo" type="email" disabled>
                    <p class="campo__ayuda">El correo no se puede cambiar.</p>
                </div>
                <div class="campo">
                    <label for="telefono">Teléfono <span class="requerido">*</span></label>
                    <input id="telefono" name="telefono" type="tel" maxlength="30" autocomplete="tel" required>
                </div>
            </div>
            <button class="boton" type="submit">Guardar datos</button>
        </form>

        <h2>Cambiar contraseña</h2>
        <form id="form-password" novalidate>
            <div class="alerta alerta--error" role="alert" hidden></div>
            <div class="campo">
                <label for="actual">Contraseña actual <span class="requerido">*</span></label>
                <input id="actual" name="actual" type="password" autocomplete="current-password" required>
            </div>
            <div class="campos-dos">
                <div class="campo">
                    <label for="nueva">Contraseña nueva <span class="requerido">*</span></label>
                    <input id="nueva" name="nueva" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required>
                </div>
                <div class="campo">
                    <label for="repetir">Repetir contraseña nueva <span class="requerido">*</span></label>
                    <input id="repetir" name="repetir" type="password" autocomplete="new-password" required>
                </div>
            </div>
            <button class="boton" type="submit">Cambiar contraseña</button>
        </form>`;

    const perfil = document.getElementById('form-perfil');
    perfil.elements.nombre.value = usuario.nombre;
    perfil.elements.apellido.value = usuario.apellido;
    document.getElementById('correo').value = usuario.email;
    perfil.elements.telefono.value = usuario.telefono;

    perfil.addEventListener('submit', guardarPerfil);
    document.getElementById('form-password').addEventListener('submit', cambiarPassword);
}

async function guardarPerfil(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    limpiarErrores(formulario);

    const datos = leerFormulario(formulario);
    const errores = {
        nombre: errorTexto(datos.nombre, 'el nombre', 60),
        apellido: errorTexto(datos.apellido, 'el apellido', 60),
        telefono: errorTelefono(datos.telefono),
    };
    if (mostrarErrores(formulario, Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje)))) {
        return;
    }

    enviando(formulario, true, 'Guardando…');
    const respuesta = await api('usuarios/perfil', 'PUT', datos);
    enviando(formulario, false);

    if (!respuesta.ok) {
        mostrarAlerta(formulario, respuesta.error);
        return;
    }
    Object.assign(usuario, respuesta.data);
    mostrarAlerta(formulario, 'Datos actualizados correctamente', 'exito'); // HU-10

    // El nombre nuevo también se ve en el saludo y en el encabezado
    document.getElementById('saludo').textContent = `Hola, ${usuario.nombre}`;
    document.querySelectorAll('.cuenta-menu__nombre').forEach(nombre => { nombre.textContent = usuario.nombre; });
}

async function cambiarPassword(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    limpiarErrores(formulario);

    const datos = leerFormulario(formulario);
    const errores = {};
    if (!datos.actual) {
        errores.actual = 'Completá tu contraseña actual';
    }
    if (errorPassword(datos.nueva)) {
        errores.nueva = errorPassword(datos.nueva);
    } else if (datos.repetir !== datos.nueva) {
        errores.repetir = 'Las contraseñas no coinciden';
    }
    if (mostrarErrores(formulario, errores)) {
        return;
    }

    enviando(formulario, true, 'Cambiando…');
    const respuesta = await api('usuarios/password', 'PUT', { actual: datos.actual, nueva: datos.nueva });
    enviando(formulario, false);

    if (!respuesta.ok) {
        if (respuesta.error.includes('actual')) {
            mostrarErrores(formulario, { actual: respuesta.error });
        } else {
            mostrarAlerta(formulario, respuesta.error);
        }
        return;
    }
    formulario.reset();
    mostrarAlerta(formulario, 'Tu contraseña se cambió correctamente', 'exito');
}

/* ---------- Dirección de entrega (HU-10) ---------- */

async function mostrarDireccion() {
    const respuesta = await api('usuarios/direcciones');
    if (!respuesta.ok) {
        panel.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    // Se edita la dirección principal (si todavía no tiene, se crea)
    let direccion = respuesta.data[0] || null;

    panel.innerHTML = `
        <h2>Dirección de entrega</h2>
        <p class="panel-caja__ayuda">Se completa sola cuando elegís envío a domicilio al finalizar una compra.</p>
        <form id="form-direccion" novalidate>
            <div class="alerta alerta--error" role="alert" hidden></div>
            <div class="campos-dos">
                <div class="campo">
                    <label for="calle">Calle <span class="requerido">*</span></label>
                    <input id="calle" name="calle" maxlength="100" autocomplete="address-line1" placeholder="Av. Colón" required>
                </div>
                <div class="campo">
                    <label for="numero">Número <span class="requerido">*</span></label>
                    <input id="numero" name="numero" maxlength="10" placeholder="2450" required>
                </div>
                <div class="campo">
                    <label for="barrio">Barrio</label>
                    <input id="barrio" name="barrio" maxlength="60" placeholder="La Perla">
                </div>
                <div class="campo">
                    <label for="ciudad">Ciudad</label>
                    <input id="ciudad" name="ciudad" maxlength="60" autocomplete="address-level2">
                    <p class="campo__ayuda">Los envíos a domicilio son solo en Mar del Plata.</p>
                </div>
            </div>
            <div class="campo">
                <label for="referencias">Referencias</label>
                <input id="referencias" name="referencias" maxlength="150" placeholder="Timbre B, portón negro">
            </div>
            <button class="boton" type="submit">Guardar dirección</button>
        </form>`;

    const formulario = document.getElementById('form-direccion');
    for (const campo of ['calle', 'numero', 'barrio', 'referencias']) {
        formulario.elements[campo].value = direccion ? (direccion[campo] || '') : '';
    }
    formulario.elements.ciudad.value = direccion ? direccion.ciudad : 'Mar del Plata';

    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        limpiarErrores(formulario);

        const datos = leerFormulario(formulario);
        const errores = {
            calle: errorTexto(datos.calle, 'la calle', 100),
            numero: errorTexto(datos.numero, 'el número', 10),
        };
        if (mostrarErrores(formulario, Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje)))) {
            return;
        }

        enviando(formulario, true, 'Guardando…');
        const guardada = direccion
            ? await api(`usuarios/direcciones/${direccion.id_direccion}`, 'PUT', datos)
            : await api('usuarios/direcciones', 'POST', datos);
        enviando(formulario, false);

        if (!guardada.ok) {
            mostrarAlerta(formulario, guardada.error);
            return;
        }
        direccion = guardada.data[0]; // la próxima vez se edita esta misma
        mostrarAlerta(formulario, 'Datos actualizados correctamente', 'exito'); // HU-10
    });
}
