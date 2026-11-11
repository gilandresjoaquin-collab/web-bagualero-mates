/**
 * Catálogo: listado con búsqueda, filtros, orden y paginación (HU-01 a HU-04).
 * El listado se actualiza sin recargar la página, y los filtros quedan en la dirección
 * (por ejemplo, catalogo.html?categoria=1&orden=precio_asc) para que se puedan compartir.
 */

const formFiltros = document.getElementById('form-filtros');
const panelFiltros = document.getElementById('filtros');
const botonFiltros = document.getElementById('boton-filtros');
const selectOrden = document.getElementById('orden');
const grilla = document.getElementById('grilla');
const paginacion = document.getElementById('paginacion');
const buscador = document.querySelector('.buscador'); // el buscador del encabezado

let categorias = [];
let materiales = [];
let consultaActual = 0; // para descartar respuestas viejas si se cambian los filtros muy rápido

// Filtros elegidos (con los mismos nombres que los parámetros de la API)
const estado = leerEstadoDeLaUrl();

iniciar();

async function iniciar() {
    const [respuestaCategorias, respuestaMateriales] = await Promise.all([api('categorias'), api('materiales')]);
    categorias = respuestaCategorias.ok ? respuestaCategorias.data : [];
    materiales = respuestaMateriales.ok ? respuestaMateriales.data : [];

    document.getElementById('filtro-categorias').innerHTML =
        opcionesRadio('categoria', 'Todas', categorias.map(c => ({ valor: c.id_categoria, texto: c.nombre })));
    document.getElementById('filtro-materiales').innerHTML =
        opcionesRadio('material', 'Todos', materiales.map(m => ({ valor: m.id_material, texto: m.nombre })));

    completarFormulario();
    cargarProductos();
}

function leerEstadoDeLaUrl() {
    const url = new URLSearchParams(location.search);
    return {
        buscar: url.get('buscar') || '',
        categoria: url.get('categoria') || '',
        material: url.get('material') || '',
        precio_min: url.get('precio_min') || '',
        precio_max: url.get('precio_max') || '',
        con_stock: url.get('con_stock') === '1' ? '1' : '',
        orden: url.get('orden') || 'nuevos',
        pagina: Number(url.get('pagina')) || 1,
    };
}

/** Opciones de un filtro (una sola a la vez), con "Todas" o "Todos" primero. */
function opcionesRadio(nombre, textoTodos, opciones) {
    return [{ valor: '', texto: textoTodos }, ...opciones].map(opcion => `
        <label class="opcion-chica">
            <input type="radio" name="${nombre}" value="${opcion.valor}"> ${escapar(opcion.texto)}
        </label>`).join('');
}

/** Marca la opción de un filtro. (Se hace una por una porque los navegadores no aceptan .value = '' en un grupo de opciones.) */
function marcarOpcion(nombre, valor) {
    formFiltros.querySelectorAll(`input[name="${nombre}"]`).forEach(opcion => {
        opcion.checked = opcion.value === valor;
    });
}

/** Pone en el formulario los filtros del estado. */
function completarFormulario() {
    marcarOpcion('categoria', estado.categoria);
    marcarOpcion('material', estado.material);
    formFiltros.elements.precio_min.value = estado.precio_min;
    formFiltros.elements.precio_max.value = estado.precio_max;
    formFiltros.elements.con_stock.checked = estado.con_stock === '1';
    selectOrden.value = estado.orden;
}

/** Lee los filtros del formulario y vuelve a la página 1. */
function aplicarFormulario() {
    const datos = new FormData(formFiltros);
    estado.categoria = datos.get('categoria') || '';
    estado.material = datos.get('material') || '';
    estado.precio_min = datos.get('precio_min') || '';
    estado.precio_max = datos.get('precio_max') || '';
    estado.con_stock = datos.get('con_stock') ? '1' : '';
    estado.pagina = 1;
    cargarProductos();
}

function hayFiltros() {
    return ['buscar', 'categoria', 'material', 'precio_min', 'precio_max', 'con_stock'].some(clave => estado[clave] !== '');
}

/** Parámetros para la API y para la dirección (sin los vacíos ni los valores por defecto). */
function parametrosDelEstado() {
    const parametros = new URLSearchParams();
    for (const [clave, valor] of Object.entries(estado)) {
        const porDefecto = valor === '' || (clave === 'orden' && valor === 'nuevos') || (clave === 'pagina' && valor === 1);
        if (!porDefecto) {
            parametros.set(clave, valor);
        }
    }
    return parametros;
}

async function cargarProductos() {
    const numero = ++consultaActual;
    const parametros = parametrosDelEstado();

    // La dirección refleja los filtros, sin recargar la página
    history.replaceState(null, '', 'catalogo.html' + (parametros.toString() ? '?' + parametros : ''));
    dibujarTitulo();
    grilla.setAttribute('aria-busy', 'true');

    const respuesta = await api('productos?' + parametros);
    if (numero !== consultaActual) {
        return; // llegó tarde: mientras tanto se pidió otra cosa
    }
    grilla.removeAttribute('aria-busy');

    if (!respuesta.ok) {
        grilla.innerHTML = pantallaVacia({ simbolo: 'alerta', titulo: 'No se pudo cargar el catálogo', texto: respuesta.error });
        paginacion.innerHTML = '';
        return;
    }

    estado.pagina = respuesta.data.pagina; // el servidor la ajusta si no existe
    dibujarProductos(respuesta.data);
    dibujarPaginacion(respuesta.data);
}

/** Título, descripción, migas, opción del menú resaltada y chips de los filtros activos. */
function dibujarTitulo() {
    const categoria = categorias.find(c => String(c.id_categoria) === estado.categoria);
    const material = materiales.find(m => String(m.id_material) === estado.material);

    let titulo = 'Catálogo';
    let descripcion = 'Todos nuestros productos.';
    if (categoria) {
        titulo = categoria.nombre;
        descripcion = categoria.descripcion || '';
    } else if (estado.buscar) {
        titulo = `Resultados para «${estado.buscar}»`;
        descripcion = '';
    }

    document.getElementById('titulo').textContent = titulo;
    document.getElementById('descripcion').textContent = descripcion;
    document.getElementById('miga-actual').textContent = categoria ? ' / ' + categoria.nombre : '';
    document.title = `${categoria ? categoria.nombre : 'Catálogo'} · Bagualero Mates`;
    marcarMenu(categoria && categoria.nombre === 'Combos' ? 'combos' : 'catalogo'); // HU-02

    // Chips de los filtros activos, con una "×" para quitar cada uno
    const chips = [];
    if (estado.buscar) chips.push({ filtro: 'buscar', texto: `«${estado.buscar}»` });
    if (categoria) chips.push({ filtro: 'categoria', texto: categoria.nombre });
    if (material) chips.push({ filtro: 'material', texto: material.nombre });
    if (estado.precio_min) chips.push({ filtro: 'precio_min', texto: 'Desde ' + precio(estado.precio_min) });
    if (estado.precio_max) chips.push({ filtro: 'precio_max', texto: 'Hasta ' + precio(estado.precio_max) });
    if (estado.con_stock) chips.push({ filtro: 'con_stock', texto: 'Con stock' });

    document.getElementById('chips').innerHTML = chips.map(chip => `
        <button class="chip" type="button" data-quitar="${chip.filtro}" aria-label="Quitar el filtro ${escapar(chip.texto)}">
            ${escapar(chip.texto)} ${icono('cerrar', 14)}
        </button>`).join('');

    botonFiltros.textContent = chips.length ? `Filtrar (${chips.length})` : 'Filtrar';
}

function dibujarProductos(datos) {
    document.getElementById('cantidad').textContent = `${datos.total} ${datos.total === 1 ? 'producto' : 'productos'}`;

    if (datos.total === 0) {
        let vacio = { simbolo: 'buscar', titulo: 'No hay productos con esos filtros', texto: 'Probá quitando alguno de los filtros.' };
        if (!hayFiltros()) {
            vacio = { simbolo: 'caja', titulo: 'Todavía no hay productos cargados', texto: 'Volvé pronto: estamos sumando productos.' }; // HU-01
        } else if (estado.buscar) {
            vacio = { simbolo: 'buscar', titulo: `No encontramos productos para «${estado.buscar}»`, texto: 'Probá con otra palabra o revisá los filtros.' }; // HU-03
        }
        if (hayFiltros()) {
            vacio.botones = '<button class="boton boton--borde" type="button" data-limpiar>Limpiar filtros</button>';
        }
        grilla.innerHTML = pantallaVacia(vacio);
        return;
    }

    grilla.innerHTML = datos.productos.map(tarjetaProducto).join('');
}

function dibujarPaginacion({ pagina, total_paginas: totalPaginas }) {
    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }

    let html = `<button type="button" data-ir="${pagina - 1}" aria-label="Página anterior" ${pagina === 1 ? 'disabled' : ''}>‹</button>`;
    for (let numero = 1; numero <= totalPaginas; numero++) {
        const actual = numero === pagina ? ' aria-current="page"' : '';
        html += `<button type="button" data-ir="${numero}" aria-label="Página ${numero}"${actual}>${numero}</button>`;
    }
    html += `<button type="button" data-ir="${pagina + 1}" aria-label="Página siguiente" ${pagina === totalPaginas ? 'disabled' : ''}>›</button>`;
    paginacion.innerHTML = html;
}

/** "Limpiar filtros": vuelve al listado completo (HU-04). El orden se mantiene. */
function limpiarFiltros() {
    Object.assign(estado, { buscar: '', categoria: '', material: '', precio_min: '', precio_max: '', con_stock: '', pagina: 1 });
    buscador.elements.buscar.value = '';
    completarFormulario();
    cargarProductos();
}

/* ---------- Eventos ---------- */

// Cualquier cambio en los filtros actualiza el listado (los precios, al salir del campo o con Enter)
formFiltros.addEventListener('change', aplicarFormulario);
formFiltros.addEventListener('submit', evento => {
    evento.preventDefault();
    aplicarFormulario();
});

selectOrden.addEventListener('change', () => {
    estado.orden = selectOrden.value;
    estado.pagina = 1;
    cargarProductos();
});

// En el catálogo, el buscador del encabezado filtra sin recargar la página
buscador.addEventListener('submit', evento => {
    evento.preventDefault();
    estado.buscar = buscador.elements.buscar.value.trim();
    estado.pagina = 1;
    cargarProductos();
});

document.getElementById('limpiar').addEventListener('click', limpiarFiltros);

document.getElementById('chips').addEventListener('click', evento => {
    const chip = evento.target.closest('[data-quitar]');
    if (!chip) {
        return;
    }
    estado[chip.dataset.quitar] = '';
    if (chip.dataset.quitar === 'buscar') {
        buscador.elements.buscar.value = '';
    }
    estado.pagina = 1;
    completarFormulario();
    cargarProductos();
});

grilla.addEventListener('click', evento => {
    const agregar = evento.target.closest('[data-agregar]');
    if (agregar) {
        agregarAlCarrito(Number(agregar.dataset.agregar), 1, agregar);
    }
    if (evento.target.closest('[data-limpiar]')) {
        limpiarFiltros();
    }
});

paginacion.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-ir]');
    if (!boton || boton.disabled) {
        return;
    }
    estado.pagina = Number(boton.dataset.ir);
    cargarProductos();
    document.querySelector('.catalogo__resultados').scrollIntoView({ behavior: 'smooth' });
});

// Celular: abrir y cerrar el panel de filtros
botonFiltros.addEventListener('click', () => {
    const abierto = panelFiltros.classList.toggle('filtros--abierto');
    botonFiltros.setAttribute('aria-expanded', abierto);
});
