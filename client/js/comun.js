/**
 * Partes comunes de todas las páginas: el encabezado (aviso, logo, menú, buscador,
 * cuenta y carrito) y el pie. Así se escriben una sola vez.
 *
 * Cada página de client/pages/ tiene que tener:
 *   <body data-pagina="inicio">              → resalta esa opción del menú
 *   <header id="encabezado"></header>        → acá se dibuja el encabezado
 *   <main id="contenido"> ... </main>
 *   <footer id="pie"></footer>               → acá se dibuja el pie
 *   <script src="../js/comun.js"></script>   → al final del body
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

function dibujarEncabezado() {
    const pagina = document.body.dataset.pagina;
    const enlaces = MENU.map(opcion => {
        const actual = opcion.pagina === pagina ? ' aria-current="page"' : '';
        return `<a href="${opcion.url}"${actual}>${opcion.texto}</a>`;
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
                    <a class="menu__cuenta" href="login.html">${icono('usuario', 20)} Mi cuenta</a>
                </nav>

                <form class="buscador" action="catalogo.html" role="search">
                    <label class="oculto-visual" for="buscar">Buscar productos</label>
                    ${icono('buscar', 20)}
                    <input type="search" id="buscar" name="buscar" placeholder="Buscar mates, bombillas, termos…">
                </form>

                <a class="cuenta" href="login.html">${icono('usuario', 20)} Mi cuenta</a>

                <a class="carrito" href="carrito.html" aria-label="Carrito">
                    ${icono('carrito', 26)}
                    <span class="carrito__contador" hidden>0</span>
                </a>
            </div>
        </div>`;

    // Si se viene de una búsqueda, el texto buscado queda escrito en el buscador
    document.getElementById('buscar').value = new URLSearchParams(location.search).get('buscar') || '';
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
                    <li><a href="login.html">Mi cuenta</a></li>
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

/** Menú hamburguesa: lo abre y lo cierra en el celular. */
function activarMenu() {
    const boton = document.querySelector('.menu-boton');
    const menu = document.getElementById('menu');

    function cambiar(abrir) {
        menu.classList.toggle('menu--abierto', abrir);
        boton.setAttribute('aria-expanded', abrir);
        boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
        boton.innerHTML = icono(abrir ? 'cerrar' : 'menu', 26);
    }

    boton.addEventListener('click', evento => {
        // Para que este clic no llegue al "tocar fuera del menú" de abajo y lo vuelva a cerrar
        evento.stopPropagation();
        cambiar(!menu.classList.contains('menu--abierto'));
    });

    // Se cierra con Escape o tocando fuera del menú
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && menu.classList.contains('menu--abierto')) {
            cambiar(false);
            boton.focus();
        }
    });
    document.addEventListener('click', evento => {
        if (!menu.contains(evento.target) && !boton.contains(evento.target)) {
            cambiar(false);
        }
    });
}

dibujarEncabezado();
dibujarPie();
dibujarIconos();
activarMenu();
