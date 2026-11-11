/**
 * Detalle de un producto: producto.html?id=1 (HU-05 y HU-11).
 */

const contenedor = document.getElementById('producto');
const idProducto = Number(new URLSearchParams(location.search).get('id'));
let producto = null;

iniciar();

async function iniciar() {
    const valido = Number.isInteger(idProducto) && idProducto > 0;
    const respuesta = valido ? await api(`productos/${idProducto}`) : { ok: false, estado: 404 };

    if (!respuesta.ok) {
        dibujarNoEncontrado(respuesta);
        return;
    }
    producto = respuesta.data;
    dibujarProducto();
    cargarRelacionados();
}

/** Si el producto no existe o está dado de baja (HU-05). */
function dibujarNoEncontrado(respuesta) {
    const noExiste = respuesta.estado === 404;
    document.title = (noExiste ? 'Producto no encontrado' : 'Error') + ' · Bagualero Mates';
    contenedor.removeAttribute('aria-busy');
    contenedor.innerHTML = `
        <div class="no-encontrado">
            <h1>${noExiste ? 'Producto no encontrado' : 'No se pudo cargar el producto'}</h1>
            <p>${noExiste ? 'El producto que buscás no existe o ya no está a la venta.' : escapar(respuesta.error)}</p>
            <a class="boton" href="catalogo.html">Ver el catálogo</a>
        </div>`;
}

function dibujarProducto() {
    const nombre = escapar(producto.nombre);
    document.title = `${producto.nombre} · Bagualero Mates`;
    marcarMenu(producto.categoria === 'Combos' ? 'combos' : 'catalogo');

    // Galería: la foto principal y, si hay más de una, las miniaturas
    const primera = producto.imagenes.length ? producto.imagenes[0].ruta : null;
    const miniaturas = producto.imagenes.length > 1 ? `
        <div class="galeria__miniaturas">
            ${producto.imagenes.map((imagen, numero) => `
                <button class="galeria__miniatura" type="button" data-foto="${numero}"
                        aria-label="Ver foto ${numero + 1}" ${numero === 0 ? 'aria-current="true"' : ''}>
                    ${fotoProducto(imagen.ruta)}
                </button>`).join('')}
        </div>` : '';

    const stock = producto.stock > 0
        ? `<p class="detalle__stock detalle__stock--hay">● En stock (${producto.stock} ${producto.stock === 1 ? 'disponible' : 'disponibles'})</p>`
        : '<p class="detalle__stock detalle__stock--sin">Sin stock</p>';

    // Elegir la cantidad (nunca más que el stock) y agregar al carrito (HU-11)
    const compra = producto.stock > 0 ? `
        <form id="form-compra" class="detalle__compra">
            <div class="cantidad">
                <button type="button" data-cambiar="-1" aria-label="Restar uno">−</button>
                <label class="oculto-visual" for="cantidad">Cantidad</label>
                <input id="cantidad" type="number" min="1" max="${producto.stock}" value="1" inputmode="numeric">
                <button type="button" data-cambiar="1" aria-label="Sumar uno">+</button>
            </div>
            <button class="boton detalle__agregar" type="submit">${icono('carrito', 20)} Agregar al carrito</button>
        </form>`
        : '<button class="boton boton--borde boton--bloque detalle__sin-stock" type="button" disabled>Sin stock</button>';

    const ficha = [
        ['Material', producto.materiales.join(', ')],
        ['Medidas', producto.medidas],
        ['Categoría', producto.categoria],
    ].filter(([, valor]) => valor)
        .map(([dato, valor]) => `<div><dt>${dato}</dt><dd>${escapar(valor)}</dd></div>`).join('');

    contenedor.innerHTML = `
        <nav class="migas" aria-label="Estás en">
            <a href="inicio.html">Inicio</a> / <a href="catalogo.html">Catálogo</a> /
            <a href="catalogo.html?categoria=${producto.id_categoria}">${escapar(producto.categoria)}</a> /
            <span>${nombre}</span>
        </nav>

        <div class="detalle__fila">
            <div class="galeria">
                <div class="galeria__principal" id="foto-principal">${fotoProducto(primera, producto.nombre)}</div>
                ${miniaturas}
            </div>

            <div class="detalle__info">
                ${producto.destacado ? '<span class="etiqueta">Destacado</span>' : ''}
                <h1>${nombre}</h1>
                <p class="detalle__datos">SKU: ${escapar(producto.sku)} · Categoría: ${escapar(producto.categoria)}</p>
                <p class="detalle__precio">${precio(producto.precio)}</p>
                ${stock}
                ${producto.descripcion ? `<p class="detalle__descripcion">${escapar(producto.descripcion)}</p>` : ''}
                ${compra}
                <ul class="detalle__envios">
                    <li>${icono('envio', 20)} Envío a domicilio en Mar del Plata</li>
                    <li>${icono('ubicacion', 20)} Retiro o punto de encuentro a coordinar</li>
                    <li>${icono('tarjeta', 20)} Transferencia, efectivo o tarjeta</li>
                </ul>
                ${ficha ? `<dl class="detalle__ficha">${ficha}</dl>` : ''}
            </div>
        </div>`;

    contenedor.removeAttribute('aria-busy');
    activarCompra();
}

function activarCompra() {
    const formulario = document.getElementById('form-compra');
    if (!formulario) {
        return; // sin stock
    }
    const entrada = document.getElementById('cantidad');

    // La cantidad siempre queda entre 1 y el stock disponible
    function ajustar(valor) {
        const numero = Math.trunc(Number(valor)) || 1;
        entrada.value = Math.min(Math.max(numero, 1), producto.stock);
    }

    formulario.addEventListener('click', evento => {
        const boton = evento.target.closest('[data-cambiar]');
        if (boton) {
            ajustar(Number(entrada.value) + Number(boton.dataset.cambiar));
        }
    });
    entrada.addEventListener('change', () => ajustar(entrada.value));

    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        ajustar(entrada.value);
        agregarAlCarrito(producto.id_producto, Number(entrada.value), formulario.querySelector('[type="submit"]'));
    });
}

// Galería: al tocar una miniatura se cambia la foto principal
contenedor.addEventListener('click', evento => {
    const miniatura = evento.target.closest('[data-foto]');
    if (!miniatura) {
        return;
    }
    const imagen = producto.imagenes[Number(miniatura.dataset.foto)];
    document.getElementById('foto-principal').innerHTML = fotoProducto(imagen.ruta, producto.nombre);
    contenedor.querySelectorAll('[data-foto]').forEach(boton => boton.removeAttribute('aria-current'));
    miniatura.setAttribute('aria-current', 'true');
});

/** "También te puede gustar": hasta 4 productos, primero los de la misma categoría. */
async function cargarRelacionados() {
    const respuesta = await api('productos');
    if (!respuesta.ok) {
        return;
    }
    const otros = respuesta.data.productos
        .filter(otro => otro.id_producto !== producto.id_producto)
        .sort((a, b) => (b.categoria === producto.categoria) - (a.categoria === producto.categoria))
        .slice(0, 4);

    if (otros.length === 0) {
        return;
    }
    const grillaRelacionados = document.getElementById('grilla-relacionados');
    grillaRelacionados.innerHTML = otros.map(tarjetaProducto).join('');
    grillaRelacionados.addEventListener('click', evento => {
        const agregar = evento.target.closest('[data-agregar]');
        if (agregar) {
            agregarAlCarrito(Number(agregar.dataset.agregar), 1, agregar);
        }
    });
    document.getElementById('relacionados').hidden = false;
}
