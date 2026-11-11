/**
 * Carrito: cambiar cantidades, quitar productos y ver los totales (HU-11 y HU-12).
 * Cada cambio se guarda en el servidor, que devuelve el carrito con los totales recalculados.
 */

const contenedor = document.getElementById('carrito');
let carrito = null;

iniciar();

async function iniciar() {
    // Página privada: sin sesión, va al login (y después vuelve acá)
    if (!await usuarioActual()) {
        location.replace(enlaceLogin());
        return;
    }

    const respuesta = await api('carrito');
    if (!respuesta.ok) {
        contenedor.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    dibujar(respuesta.data);
}

function dibujar(datos) {
    carrito = datos;
    actualizarContadorCarrito(datos.cantidad_total);

    const cantidad = datos.cantidad_total;
    document.getElementById('carrito-cantidad').textContent =
        cantidad ? `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}` : '';

    if (datos.items.length === 0) {
        contenedor.innerHTML = `
            <div class="compra__vacio">
                <p>Tu carrito está vacío</p>
                <a class="boton" href="catalogo.html">Ver el catálogo</a>
            </div>`;
        return;
    }

    // Para no perder el lugar al usar el teclado: después de redibujar, el foco vuelve al mismo botón
    const activo = document.activeElement;
    const enfocado = contenedor.contains(activo) && activo.dataset.accion
        ? { accion: activo.dataset.accion, id: activo.dataset.id }
        : null;

    // Con productos sin stock suficiente no se puede seguir (igual el servidor lo vuelve a controlar al confirmar)
    const continuar = datos.hay_problemas
        ? '<button class="boton boton--bloque" type="button" disabled>Continuar compra</button>'
        : '<a class="boton boton--bloque" href="checkout.html">Continuar compra</a>';

    contenedor.innerHTML = `
        <div class="compra__fila">
            <section class="tarjeta-formulario" aria-label="Productos del carrito">
                <ul class="lista-carrito">${datos.items.map(itemCarrito).join('')}</ul>
                <a class="compra__seguir" href="catalogo.html">← Seguir comprando</a>
            </section>

            <aside class="tarjeta-formulario resumen" aria-label="Resumen de la compra">
                <h2>Resumen</h2>
                <dl>
                    <div><dt>Subtotal (${cantidad} ${cantidad === 1 ? 'producto' : 'productos'})</dt><dd>${precio(datos.total)}</dd></div>
                    <div><dt>Envío</dt><dd>A coordinar</dd></div>
                    <div class="resumen__total"><dt>Total</dt><dd>${precio(datos.total)}</dd></div>
                </dl>
                ${datos.hay_problemas ? '<p class="alerta alerta--error">Hay productos sin stock suficiente. Cambiá la cantidad o quitalos para seguir.</p>' : ''}
                ${continuar}
                <p class="resumen__nota">El stock se confirma al finalizar el pedido.</p>
            </aside>
        </div>`;

    if (enfocado) {
        const mismo = contenedor.querySelector(`[data-accion="${enfocado.accion}"][data-id="${enfocado.id}"]:not(:disabled)`);
        (mismo || contenedor.querySelector(`input[data-id="${enfocado.id}"]`))?.focus();
    }
}

function itemCarrito(item) {
    const id = item.id_producto;
    const url = `producto.html?id=${id}`;
    const nombre = escapar(item.nombre);

    let aviso = '';
    if (!item.activo) {
        aviso = 'Este producto ya no está a la venta';
    } else if (item.stock === 0) {
        aviso = 'Sin stock';
    } else if (item.cantidad > item.stock) {
        aviso = item.stock === 1 ? 'Solo queda 1' : `Solo quedan ${item.stock}`;
    }
    const sePuedeCambiar = item.activo && item.stock > 0;

    return `
        <li class="item-carrito${aviso ? ' item-carrito--problema' : ''}">
            <a class="item-carrito__foto" href="${url}" tabindex="-1" aria-hidden="true">${fotoProducto(item.imagen, item.nombre)}</a>
            <div class="item-carrito__datos">
                <a class="item-carrito__nombre" href="${url}">${nombre}</a>
                <p class="item-carrito__detalle">${escapar(item.categoria)} · ${precio(item.precio)} c/u</p>
                ${aviso ? `<p class="item-carrito__aviso">${aviso}</p>` : ''}
                <button class="item-carrito__quitar" type="button" data-accion="quitar" data-id="${id}">Quitar</button>
            </div>
            <div class="cantidad" role="group" aria-label="Cantidad de ${nombre}">
                <button type="button" data-accion="restar" data-id="${id}" aria-label="Restar uno"
                    ${!sePuedeCambiar || item.cantidad <= 1 ? 'disabled' : ''}>−</button>
                <input type="number" min="1" max="${Math.max(item.stock, 1)}" value="${item.cantidad}" inputmode="numeric"
                    data-accion="cambiar" data-id="${id}" aria-label="Cantidad" ${sePuedeCambiar ? '' : 'disabled'}>
                <button type="button" data-accion="sumar" data-id="${id}" aria-label="Sumar uno"
                    ${!sePuedeCambiar || item.cantidad >= item.stock ? 'disabled' : ''}>+</button>
            </div>
            <p class="item-carrito__subtotal">${precio(item.subtotal)}</p>
        </li>`;
}

/* ---------- Cambios ---------- */

async function cambiarCantidad(id, cantidad) {
    procesar(await api(`carrito/${id}`, 'PUT', { cantidad }));
}

async function quitar(id) {
    procesar(await api(`carrito/${id}`, 'DELETE'));
}

function procesar(respuesta) {
    if (respuesta.ok) {
        dibujar(respuesta.data);
        return;
    }
    avisar(respuesta.error, { tipo: 'error' });
    dibujar(carrito); // vuelve a mostrar las cantidades de antes
}

contenedor.addEventListener('click', evento => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton || boton.disabled) {
        return;
    }
    const id = Number(boton.dataset.id);
    const item = carrito.items.find(producto => producto.id_producto === id);

    if (boton.dataset.accion === 'quitar') {
        quitar(id);
    } else if (boton.dataset.accion === 'sumar') {
        cambiarCantidad(id, item.cantidad + 1);
    } else if (boton.dataset.accion === 'restar') {
        // Si había más que el stock, baja directo a lo que hay
        cambiarCantidad(id, Math.max(1, Math.min(item.cantidad - 1, item.stock)));
    }
});

// Escribir la cantidad a mano (se guarda al salir del campo o con Enter)
contenedor.addEventListener('change', evento => {
    const entrada = evento.target.closest('input[data-accion="cambiar"]');
    if (!entrada) {
        return;
    }
    const id = Number(entrada.dataset.id);
    const item = carrito.items.find(producto => producto.id_producto === id);
    const cantidad = Math.trunc(Number(entrada.value));

    if (!cantidad || cantidad < 1) {
        entrada.value = item.cantidad;
        return;
    }
    cambiarCantidad(id, Math.min(cantidad, item.stock));
});
