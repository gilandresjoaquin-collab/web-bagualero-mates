/**
 * Partes compartidas por el catálogo y el detalle de producto:
 * la tarjeta de un producto y el botón "Agregar al carrito".
 */

/** HTML de la tarjeta de un producto del listado (HU-01). */
function tarjetaProducto(producto) {
    const url = `producto.html?id=${producto.id_producto}`;
    const nombre = escapar(producto.nombre);
    const hayStock = producto.stock > 0;

    let etiqueta = '';
    if (!hayStock) {
        etiqueta = '<span class="etiqueta etiqueta--gris">Sin stock</span>';
    } else if (producto.destacado) {
        etiqueta = '<span class="etiqueta">Destacado</span>';
    }

    // Sin stock: no hay botón de compra, solo el aviso (HU-01)
    const boton = hayStock
        ? `<button class="boton boton--bloque producto__boton" type="button" data-agregar="${producto.id_producto}">Agregar al carrito</button>`
        : '<button class="boton boton--borde boton--bloque producto__boton" type="button" disabled>Sin stock</button>';

    return `
        <article class="producto">
            <a class="producto__foto" href="${url}" tabindex="-1" aria-hidden="true">
                ${fotoProducto(producto.imagen, producto.nombre)}
                ${etiqueta}
            </a>
            <div class="producto__info">
                <p class="producto__categoria">${escapar(producto.categoria)}</p>
                <h3 class="producto__nombre"><a href="${url}">${nombre}</a></h3>
                <p class="producto__precio">${precio(producto.precio)}</p>
                ${boton}
            </div>
        </article>`;
}

/**
 * Agrega un producto al carrito. Si no hay sesión, invita a entrar o registrarse (HU-05).
 * Devuelve true si se agregó.
 */
async function agregarAlCarrito(idProducto, cantidad = 1, boton = null) {
    if (!await usuarioActual()) {
        const login = enlaceLogin();
        avisar('Para comprar, iniciá sesión o creá una cuenta.', {
            tipo: 'info',
            enlaces: [
                { texto: 'Iniciar sesión', url: login },
                { texto: 'Crear cuenta', url: login.replace('login.html', 'registro.html') },
            ],
        });
        return false;
    }

    if (boton) {
        boton.disabled = true;
    }
    const respuesta = await api('carrito', 'POST', { id_producto: idProducto, cantidad });
    if (boton) {
        boton.disabled = false;
    }

    if (!respuesta.ok) {
        avisar(respuesta.error, { tipo: 'error' }); // por ejemplo, "No hay stock suficiente…"
        return false;
    }

    actualizarContadorCarrito(respuesta.data.cantidad_total);
    avisar('Agregado al carrito', { enlaces: [{ texto: 'Ver carrito', url: 'carrito.html' }] });
    return true;
}
