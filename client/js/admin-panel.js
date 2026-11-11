/**
 * Panel de control: pedidos pendientes, ventas del mes, poco stock y últimos pedidos (HU-22).
 */

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }
    const contenido = document.getElementById('contenido');

    // "Miércoles 11 de noviembre de 2026"
    const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fechaDeHoy = hoy.charAt(0).toUpperCase() + hoy.slice(1).replace(',', '');

    const respuesta = await api('admin/dashboard');
    if (!respuesta.ok) {
        contenido.innerHTML = encabezadoAdmin('Panel de control', fechaDeHoy) +
            `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    const datos = respuesta.data;

    const ultimos = datos.ultimos_pedidos.length
        ? tablaPedidos(datos.ultimos_pedidos)
        : '<p class="admin-vacio">Todavía no hay pedidos.</p>';

    const pocoStock = datos.poco_stock.length
        ? `<ul class="lista-stock">${datos.poco_stock.map(producto => `
            <li>
                <a href="admin-producto.html?id=${producto.id_producto}">
                    ${productoMini(producto.imagen, producto.nombre)}
                    <span class="unidades ${producto.stock === 0 ? 'unidades--cero' : 'unidades--poco'}">${producto.stock} u.</span>
                </a>
            </li>`).join('')}</ul>`
        : '<p class="admin-vacio">Todos los productos activos tienen más de 3 unidades.</p>';

    contenido.innerHTML = `
        ${encabezadoAdmin('Panel de control', fechaDeHoy)}

        <div class="numeros">
            ${numero('Pedidos pendientes', datos.pedidos_pendientes)}
            ${numero('Ventas del mes', precio(datos.ventas_mes))}
            ${numero('Productos activos', datos.productos_activos)}
            ${numero('Poco stock', datos.poco_stock.length, datos.poco_stock.length > 0)}
        </div>

        <div class="admin-columnas">
            <section class="panel-caja" aria-labelledby="titulo-ultimos">
                <h2 id="titulo-ultimos">Últimos pedidos</h2>
                ${ultimos}
                <a class="enlace-flecha" href="admin-pedidos.html">Ver todos los pedidos →</a>
            </section>
            <section class="panel-caja" aria-labelledby="titulo-stock">
                <h2 id="titulo-stock">Productos con poco stock</h2>
                <p class="panel-caja__ayuda">Productos activos con 3 unidades o menos.</p>
                ${pocoStock}
            </section>
        </div>`;
}

/** Tarjeta con un número del resumen. */
function numero(titulo, valor, alerta = false) {
    return `
        <div class="numero">
            <p class="numero__titulo">${titulo}</p>
            <p class="numero__valor${alerta ? ' numero__valor--alerta' : ''}">${valor}</p>
        </div>`;
}
