/**
 * Partes comunes del panel de administración: control de acceso (HU-16) y menú lateral.
 *
 * Cada página del panel tiene:
 *   <body class="admin" data-seccion="productos">
 *   <nav id="admin-menu"></nav>
 *   <main id="contenido" class="admin-contenido">…</main>
 * y al final: api.js, comun.js, (formularios.js), admin.js y el .js de la página, que empieza con:
 *   if (!await entrarAlPanel()) return;
 */

const SECCIONES_ADMIN = [
    { seccion: 'panel',      texto: 'Panel de control', url: 'admin.html',            icono: 'inicio' },
    { seccion: 'productos',  texto: 'Productos',        url: 'admin-productos.html',  icono: 'caja' },
    { seccion: 'categorias', texto: 'Categorías',       url: 'admin-categorias.html', icono: 'etiqueta' },
    { seccion: 'pedidos',    texto: 'Pedidos',          url: 'admin-pedidos.html',    icono: 'lista' },
    { seccion: 'usuarios',   texto: 'Usuarios',         url: 'admin-usuarios.html',   icono: 'usuarios' },
];

/**
 * Controla que quien entra sea administrador (HU-16):
 *   sin sesión → va al login (y después vuelve acá); un cliente → "Acceso denegado".
 * Si es administrador, dibuja el menú y devuelve el usuario. Si no, devuelve null.
 */
async function entrarAlPanel() {
    const usuario = await usuarioActual();

    if (!usuario) {
        location.replace(enlaceLogin());
        return null;
    }
    if (usuario.rol !== 'administrador') {
        document.getElementById('contenido').innerHTML = `
            <div class="acceso-denegado">
                <h1>Acceso denegado</h1>
                <p>Esta sección es solo para administradores.</p>
                <a class="boton" href="inicio.html">Volver a la tienda</a>
            </div>`;
        return null;
    }

    dibujarMenuAdmin(usuario);
    return usuario;
}

function dibujarMenuAdmin(usuario) {
    const actual = document.body.dataset.seccion;
    const enlaces = SECCIONES_ADMIN.map(opcion => `
        <li>
            <a href="${opcion.url}" ${opcion.seccion === actual ? 'aria-current="page"' : ''}>
                ${icono(opcion.icono, 20)} ${opcion.texto}
            </a>
        </li>`).join('');

    const menu = document.getElementById('admin-menu');
    menu.className = 'admin-menu';
    menu.setAttribute('aria-label', 'Menú del panel');
    menu.innerHTML = `
        <div class="admin-menu__barra">
            <button class="admin-menu__boton" type="button" aria-expanded="false" aria-controls="admin-menu-lista" aria-label="Abrir menú">
                ${icono('menu', 26)}
            </button>
            <a class="admin-menu__logo" href="admin.html">
                <img src="../img/logo.png" alt="Bagualero Mates, panel de control" width="76" height="74">
            </a>
            <span class="admin-menu__usuario">${escapar(usuario.nombre)}</span>
        </div>
        <ul class="admin-menu__lista" id="admin-menu-lista">
            ${enlaces}
            <li class="admin-menu__separador" aria-hidden="true"></li>
            <li><a href="inicio.html">${icono('tienda', 20)} Ver tienda</a></li>
            <li><button type="button" data-salir>${icono('salir', 20)} Cerrar sesión</button></li>
        </ul>`;

    // Celular: el menú se abre y se cierra con el botón
    const boton = menu.querySelector('.admin-menu__boton');
    boton.addEventListener('click', () => {
        const abierto = menu.classList.toggle('admin-menu--abierto');
        boton.setAttribute('aria-expanded', abierto);
        boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
}

/** Encabezado de cada página del panel: título, subtítulo y, si hace falta, un botón a la derecha. */
function encabezadoAdmin(titulo, subtitulo = '', boton = '') {
    return `
        <div class="admin-encabezado">
            <div>
                <h1>${escapar(titulo)}</h1>
                ${subtitulo ? `<p class="admin-encabezado__subtitulo">${subtitulo}</p>` : ''}
            </div>
            ${boton}
        </div>`;
}

/** Tabla de pedidos (panel de control y página de pedidos). */
function tablaPedidos(pedidos) {
    const filas = pedidos.map(pedido => `
        <tr>
            <td data-titulo="Pedido"><strong>#${pedido.id_pedido}</strong></td>
            <td data-titulo="Cliente">${escapar(pedido.cliente)}</td>
            <td data-titulo="Fecha">${fecha(pedido.fecha_pedido)}</td>
            <td data-titulo="Total"><strong>${precio(pedido.total)}</strong></td>
            <td data-titulo="Estado">${etiquetaEstado(pedido.estado)}</td>
            <td data-titulo=""><a href="admin-pedido.html?id=${pedido.id_pedido}">Ver detalle</a></td>
        </tr>`).join('');

    return `
        <table class="tabla">
            <thead>
                <tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th><span class="oculto-visual">Acciones</span></th></tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>`;
}

/** Foto chica con el nombre al lado (listas del panel). */
function productoMini(imagen, nombre) {
    return `<span class="producto-mini"><span class="producto-mini__foto">${fotoProducto(imagen)}</span><strong>${escapar(nombre)}</strong></span>`;
}
