/**
 * Partes comunes de todas las páginas: el encabezado (aviso, logo, menú, buscador,
 * cuenta y carrito) y el pie. Así se escriben una sola vez.
 *
 * Cada página de client/pages/ tiene que tener:
 *   <body data-pagina="inicio">              → resalta esa opción del menú
 *   <header id="encabezado"></header>        → acá se dibuja el encabezado
 *   <main id="contenido"> ... </main>
 *   <footer id="pie"></footer>               → acá se dibuja el pie
 *   <script src="../js/api.js"></script>     → al final del body, en este orden
 *   <script src="../js/comun.js"></script>
 */

const INSTAGRAM = 'https://www.instagram.com/bagualero.mates/';
// Número de WhatsApp con código de país, sin "+" ni espacios (por ejemplo, 5492235550000).
// Mientras esté vacío, "Escribinos por WhatsApp" lleva a la página de contacto.
const WHATSAPP = '';

// Opciones del menú principal: "pagina" es el valor de data-pagina en el <body>
const MENU = [
    { pagina: 'inicio',   texto: 'Inicio',   url: 'inicio.html' },
    { pagina: 'catalogo', texto: 'Catálogo', url: 'catalogo.html' },
    { pagina: 'combos',   texto: 'Combos',   url: 'catalogo.html?categoria=6' },
    { pagina: 'nosotros', texto: 'Nosotros', url: 'nosotros.html' },
    { pagina: 'contacto', texto: 'Contacto', url: 'contacto.html' },
];

// Íconos (dibujos SVG de 24×24 que toman el color del texto)
const ICONOS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    carrito: '<path d="M3 4h2l2.4 11h11.2L21 8H6.2"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/>',
    panel: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    salir: '<path d="M9 4H5v16h4M14 8l4 4-4 4M18 12H9"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>',
    mensaje: '<path d="M4 4h16v12H8l-4 4z"/>',
    ubicacion: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    envio: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    tarjeta: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
    estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
};

/** Devuelve el HTML de un ícono, por ejemplo icono('carrito', 24). */
function icono(nombre, tamanio = 22) {
    return `<svg width="${tamanio}" height="${tamanio}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre]}</svg>`;
}

/**
 * Escapa un texto para ponerlo dentro de HTML sin riesgo.
 * Usarlo SIEMPRE con datos que vienen de la base o del usuario (nombres, descripciones…).
 */
function escapar(texto) {
    const reemplazos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto).replace(/[&<>"']/g, caracter => reemplazos[caracter]);
}

/** Página actual con sus parámetros, por ejemplo "catalogo.html?categoria=1". */
function paginaActual() {
    return (location.pathname.split('/').pop() || 'inicio.html') + location.search;
}

/** true si la página actual es la de iniciar sesión o la de crear cuenta. */
function esPaginaDeAcceso(pagina = paginaActual()) {
    return pagina.startsWith('login.html') || pagina.startsWith('registro.html');
}

/** Enlace al login que, después de entrar, vuelve a la página actual (HU-08). */
function enlaceLogin() {
    if (esPaginaDeAcceso()) {
        return 'login.html' + location.search; // se conserva el ?volver= que ya traía
    }
    return 'login.html?volver=' + encodeURIComponent(paginaActual());
}

/**
 * Página a la que se vuelve después de iniciar sesión o crear la cuenta: la del ?volver=,
 * o el inicio. Solo se aceptan páginas de este sitio, como "carrito.html" o
 * "catalogo.html?categoria=1", para que nadie arme un enlace que lleve a otro sitio.
 */
function paginaParaVolver() {
    const pagina = new URLSearchParams(location.search).get('volver') || '';
    const valida = /^[\w-]+\.html([?#].*)?$/.test(pagina) && !esPaginaDeAcceso(pagina);
    return valida ? pagina : 'inicio.html';
}

function dibujarEncabezado() {
    const pagina = document.body.dataset.pagina;
    const enlaces = MENU.map(opcion => {
        const actual = opcion.pagina === pagina ? ' aria-current="page"' : '';
        return `<a href="${opcion.url}" data-pagina="${opcion.pagina}"${actual}>${opcion.texto}</a>`;
    }).join('');

    document.getElementById('encabezado').innerHTML = `
        <a class="saltar" href="#contenido">Saltar al contenido</a>
        <p class="aviso">Envíos a toda Mar del Plata · Retiro y punto de encuentro sin cargo</p>
        <div class="barra">
            <div class="contenedor barra__fila">
                <button class="menu-boton" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">
                    ${icono('menu', 26)}
                </button>

                <a class="logo" href="inicio.html">
                    <img src="../img/logo.png" alt="Bagualero Mates, ir al inicio" width="62" height="60">
                </a>

                <nav class="menu" id="menu" aria-label="Menú principal">
                    ${enlaces}
                    <div class="menu__cuenta">
                        <a href="${enlaceLogin()}">${icono('usuario', 20)} Mi cuenta</a>
                    </div>
                </nav>

                <form class="buscador" action="catalogo.html" role="search">
                    <label class="oculto-visual" for="buscar">Buscar productos</label>
                    ${icono('buscar', 20)}
                    <input type="search" id="buscar" name="buscar" placeholder="Buscar mates, bombillas, termos…">
                </form>

                <div class="cuenta">
                    <a class="cuenta__enlace" href="${enlaceLogin()}">${icono('usuario', 20)} Mi cuenta</a>
                </div>

                <a class="carrito" href="carrito.html" aria-label="Carrito">
                    ${icono('carrito', 26)}
                    <span class="carrito__contador" hidden>0</span>
                </a>
            </div>
        </div>`;

    // Si se viene de una búsqueda, el texto buscado queda escrito en el buscador
    document.getElementById('buscar').value = new URLSearchParams(location.search).get('buscar') || '';
}

/**
 * Si hay sesión iniciada, cambia "Mi cuenta" por el nombre del usuario, con sus opciones:
 * Mi cuenta, Panel de administración (solo admin) y Cerrar sesión.
 */
async function mostrarSesion() {
    const usuario = await usuarioActual();
    if (!usuario) {
        return; // visitante: queda el enlace "Mi cuenta" que lleva al login
    }

    const nombre = escapar(usuario.nombre);
    const esAdmin = usuario.rol === 'administrador';

    // Escritorio: menú desplegable con el nombre
    document.querySelector('.cuenta').innerHTML = `
        <details class="cuenta-menu">
            <summary>${icono('usuario', 20)} <span class="cuenta-menu__nombre">${nombre}</span></summary>
            <div class="cuenta-menu__panel">
                <p class="cuenta-menu__saludo">Hola, ${nombre}</p>
                <a href="cuenta.html">${icono('usuario', 18)} Mi cuenta</a>
                ${esAdmin ? `<a href="admin.html">${icono('panel', 18)} Panel de administración</a>` : ''}
                <button type="button" data-salir>${icono('salir', 18)} Cerrar sesión</button>
            </div>
        </details>`;

    // Celular: las mismas opciones dentro del menú hamburguesa
    document.querySelector('.menu__cuenta').innerHTML = `
        <a href="cuenta.html">${icono('usuario', 20)} Mi cuenta (${nombre})</a>
        ${esAdmin ? `<a href="admin.html">${icono('panel', 20)} Panel de administración</a>` : ''}
        <button class="menu__salir" type="button" data-salir>${icono('salir', 20)} Cerrar sesión</button>`;

    // Cantidad de productos en el carrito (HU-11)
    const carrito = await api('carrito');
    if (carrito.ok) {
        actualizarContadorCarrito(carrito.data.cantidad_total);
    }
}

/** Muestra en el ícono del carrito la cantidad total de productos (si es 0, no se ve). */
function actualizarContadorCarrito(cantidad) {
    const contador = document.querySelector('.carrito__contador');
    contador.textContent = cantidad;
    contador.hidden = cantidad === 0;
    document.querySelector('.carrito').setAttribute('aria-label', `Carrito (${cantidad} productos)`);
}

/** Resalta una opción del menú, por ejemplo marcarMenu('combos'). */
function marcarMenu(pagina) {
    document.querySelectorAll('#menu > a[data-pagina]').forEach(enlace => {
        if (enlace.dataset.pagina === pagina) {
            enlace.setAttribute('aria-current', 'page');
        } else {
            enlace.removeAttribute('aria-current');
        }
    });
}

/* ---------- Productos y precios ---------- */

/** Precio con formato argentino: precio(50000) → "$50.000". */
function precio(valor) {
    return '$' + Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * HTML de la foto de un producto. "ruta" es el nombre del archivo en server/uploads/.
 * Si el producto no tiene foto, muestra un recuadro con el logo.
 */
function fotoProducto(ruta, descripcion = '') {
    if (!ruta) {
        return '<span class="foto-vacia"><img src="../img/logo.png" alt=""></span>';
    }
    return `<img class="foto" src="../../server/uploads/${encodeURI(ruta)}" alt="${escapar(descripcion)}" loading="lazy">`;
}

/**
 * Mensaje flotante abajo de la pantalla, que se va solo.
 *   avisar('Agregado al carrito', { enlaces: [{ texto: 'Ver carrito', url: 'carrito.html' }] })
 *   avisar('No hay stock suficiente', { tipo: 'error' })
 */
function avisar(mensaje, { tipo = 'exito', enlaces = [] } = {}) {
    let caja = document.getElementById('aviso-flotante');
    if (!caja) {
        caja = document.createElement('div');
        caja.id = 'aviso-flotante';
        caja.setAttribute('role', 'status');
        document.body.appendChild(caja);
    }

    const botones = enlaces.map(enlace => `<a href="${enlace.url}">${escapar(enlace.texto)}</a>`).join('');
    caja.className = `aviso-flotante aviso-flotante--${tipo}`;
    caja.innerHTML = `
        <p>${escapar(mensaje)}</p>
        ${botones}
        <button type="button" class="aviso-flotante__cerrar" aria-label="Cerrar aviso">${icono('cerrar', 18)}</button>`;
    caja.hidden = false;
    caja.querySelector('.aviso-flotante__cerrar').addEventListener('click', () => { caja.hidden = true; });

    clearTimeout(caja.temporizador);
    caja.temporizador = setTimeout(() => { caja.hidden = true; }, 6000);
}

/** Cierra la sesión en el servidor y vuelve al inicio (HU-09). */
async function cerrarSesion() {
    await api('auth/logout', 'POST');
    location.href = 'inicio.html';
}

function dibujarPie() {
    const whatsapp = WHATSAPP ? `https://wa.me/${WHATSAPP}` : 'contacto.html';
    const pie = document.getElementById('pie');

    pie.classList.add('pie');
    pie.innerHTML = `
        <div class="contenedor pie__columnas">
            <div class="pie__marca">
                <img class="pie__logo" src="../img/logo.png" alt="Bagualero Mates" width="72" height="70">
                <p>Mates, bombillas y accesorios criollos.<br>Mar del Plata, Buenos Aires.</p>
            </div>

            <div>
                <h2>Tienda</h2>
                <ul>
                    <li><a href="catalogo.html?categoria=1">Mates</a></li>
                    <li><a href="catalogo.html?categoria=2">Bombillas y bombillones</a></li>
                    <li><a href="catalogo.html?categoria=3">Termos</a></li>
                    <li><a href="catalogo.html?categoria=4">Yerberas</a></li>
                    <li><a href="catalogo.html?categoria=5">Canastas</a></li>
                    <li><a href="catalogo.html?categoria=6">Combos</a></li>
                </ul>
            </div>

            <div>
                <h2>Ayuda</h2>
                <ul>
                    <li><a href="nosotros.html#como-comprar">Cómo comprar</a></li>
                    <li><a href="nosotros.html#envios">Envíos y retiros</a></li>
                    <li><a href="nosotros.html#pagos">Medios de pago</a></li>
                    <li><a href="login.html?volver=cuenta.html">Mi cuenta</a></li>
                </ul>
            </div>

            <div>
                <h2>Contacto</h2>
                <ul>
                    <li><a href="${INSTAGRAM}" target="_blank" rel="noopener">${icono('instagram', 20)} @bagualero.mates</a></li>
                    <li><a href="${whatsapp}">${icono('mensaje', 20)} Escribinos por WhatsApp</a></li>
                    <li><p class="pie__dato">${icono('ubicacion', 20)} Mar del Plata</p></li>
                </ul>
            </div>
        </div>
        <p class="pie__copia">© ${new Date().getFullYear()} Bagualero Mates · El mate bien criollo</p>`;
}

/** Completa los íconos escritos en el HTML como <span data-icono="envio"></span>. */
function dibujarIconos() {
    document.querySelectorAll('[data-icono]').forEach(elemento => {
        elemento.innerHTML = icono(elemento.dataset.icono, elemento.dataset.tamanio || 20);
    });
}

/** Menú hamburguesa (celular) y menú de la cuenta (escritorio): abrir, cerrar y "Cerrar sesión". */
function activarMenus() {
    const boton = document.querySelector('.menu-boton');
    const menu = document.getElementById('menu');

    function cambiar(abrir) {
        menu.classList.toggle('menu--abierto', abrir);
        boton.setAttribute('aria-expanded', abrir);
        boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
        boton.innerHTML = icono(abrir ? 'cerrar' : 'menu', 26);
    }

    function cerrarMenuCuenta(excepto = null) {
        document.querySelectorAll('.cuenta-menu[open]').forEach(desplegable => {
            if (!desplegable.contains(excepto)) {
                desplegable.open = false;
            }
        });
    }

    boton.addEventListener('click', evento => {
        // Para que este clic no llegue al "tocar fuera del menú" de abajo y lo vuelva a cerrar
        evento.stopPropagation();
        cambiar(!menu.classList.contains('menu--abierto'));
    });

    document.addEventListener('click', evento => {
        if (evento.target.closest('[data-salir]')) {
            cerrarSesion();
            return;
        }
        // Tocar fuera de un menú lo cierra
        if (!menu.contains(evento.target)) {
            cambiar(false);
        }
        cerrarMenuCuenta(evento.target);
    });

    document.addEventListener('keydown', evento => {
        if (evento.key !== 'Escape') {
            return;
        }
        if (menu.classList.contains('menu--abierto')) {
            cambiar(false);
            boton.focus();
        }
        cerrarMenuCuenta();
    });
}

// Si el navegador muestra la página desde su memoria (botón "atrás"), se recarga
// para no mostrar una sesión que ya se cerró (HU-09)
window.addEventListener('pageshow', evento => {
    if (evento.persisted) {
        location.reload();
    }
});

dibujarEncabezado();
dibujarPie();
dibujarIconos();
activarMenus();
mostrarSesion();
