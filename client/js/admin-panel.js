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
    const mes = new Date().toLocaleDateString('es-AR', { month: 'long' });

    const respuesta = await api('admin/dashboard');
    if (!respuesta.ok) {
        contenido.innerHTML = encabezadoAdmin('Panel de control', fechaDeHoy) +
            `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    const datos = respuesta.data;
    const pocoStock = datos.poco_stock.length;

    const ultimos = datos.ultimos_pedidos.length
        ? tablaPedidos(datos.ultimos_pedidos)
        : vacioAdmin('lista', 'Todavía no hay pedidos', 'Cuando un cliente compre, el pedido aparece acá.');

    const listaStock = pocoStock
        ? `<ul class="lista-stock">${datos.poco_stock.map(producto => `
            <li>
                <a href="admin-producto.html?id=${producto.id_producto}">
                    ${productoMini(producto.imagen, producto.nombre, producto.categoria)}
                    <span class="unidades ${producto.stock === 0 ? 'unidades--cero' : 'unidades--poco'}">${producto.stock} u.</span>
                </a>
            </li>`).join('')}</ul>`
        : vacioAdmin('check', 'Stock en orden', 'Todos los productos activos tienen más de 3 unidades.');

    contenido.innerHTML = `
        ${encabezadoAdmin('Panel de control', fechaDeHoy)}

        <div class="numeros">
            ${numero({ simbolo: 'reloj', titulo: 'Pedidos pendientes', valor: datos.pedidos_pendientes,
                ayuda: 'Esperan tu confirmación', url: 'admin-pedidos.html?estado=pendiente' })}
            ${numero({ simbolo: 'precio', titulo: 'Ventas del mes', valor: precio(datos.ventas_mes),
                ayuda: `En ${mes}, sin los cancelados`, url: 'admin-pedidos.html' })}
            ${numero({ simbolo: 'caja', titulo: 'Productos activos', valor: datos.productos_activos,
                ayuda: 'A la venta en la tienda', url: 'admin-productos.html' })}
            ${numero({ simbolo: 'alerta', titulo: 'Poco stock', valor: pocoStock,
                ayuda: '3 unidades o menos', url: '#titulo-stock', alerta: pocoStock > 0 })}
        </div>

        <div class="admin-columnas">
            <section class="panel-caja" aria-labelledby="titulo-ultimos">
                ${encabezadoBloque('lista', 'Últimos pedidos', {
                    id: 'titulo-ultimos',
                    enlace: '<a href="admin-pedidos.html">Ver todos →</a>',
                })}
                ${ultimos}
            </section>
            <section class="panel-caja" aria-labelledby="titulo-stock">
                ${encabezadoBloque('alerta', 'Poco stock', { id: 'titulo-stock', ayuda: 'Productos activos con 3 unidades o menos.' })}
                ${listaStock}
            </section>
        </div>`;
}

/** Tarjeta del resumen: ícono, título, número grande y una ayuda. Toda la tarjeta es un enlace. */
function numero({ simbolo, titulo, valor, ayuda, url, alerta = false }) {
    return `
        <a class="numero${alerta ? ' numero--alerta' : ''}" href="${url}">
            <span class="numero__cabeza">
                <span class="numero__icono">${icono(simbolo, 20)}</span>
                <span class="numero__titulo">${titulo}</span>
            </span>
            <strong class="numero__valor">${valor}</strong>
            <span class="numero__ayuda">${ayuda}</span>
        </a>`;
}
