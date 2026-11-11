/**
 * Panel: detalle de un pedido y cambio de estado (HU-20).
 * Si se cancela, el servidor repone el stock (HU-14).
 */

const idPedido = Number(new URLSearchParams(location.search).get('id'));
let estados = [];

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }

    const [respuestaPedido, respuestaEstados] = await Promise.all([
        api(`admin/pedidos/${idPedido || 0}`),
        api('admin/estados-pedido'),
    ]);

    if (!respuestaPedido.ok) {
        document.getElementById('contenido').innerHTML = encabezadoAdmin('Pedido') + `
            <p class="alerta alerta--error">${escapar(respuestaPedido.error)}</p>
            <a class="boton boton--borde" href="admin-pedidos.html">Volver a pedidos</a>`;
        return;
    }
    estados = respuestaEstados.ok ? respuestaEstados.data : [];
    dibujar(respuestaPedido.data);
}

function dibujar(pedido) {
    document.title = `Pedido #${pedido.id_pedido} · Panel · Bagualero Mates`;
    const cancelado = pedido.estado === 'Cancelado';

    const productos = pedido.items.map(item => `
        <li class="item-pedido">
            ${productoMini(item.imagen, item.nombre)}
            <span class="item-pedido__cantidad">${item.cantidad} × ${precio(item.precio_unitario)}</span>
            <strong>${precio(item.subtotal)}</strong>
        </li>`).join('');

    const historial = pedido.historial.map(cambio => `
        <li>
            ${etiquetaEstado(cambio.estado)}
            <span class="historial__fecha">${fecha(cambio.fecha_cambio, true)}</span>
            ${cambio.comentario ? `<p class="historial__comentario">${escapar(cambio.comentario)}</p>` : ''}
        </li>`).join('');

    // Cambiar el estado (un pedido cancelado ya no se puede cambiar)
    const cambiarEstado = cancelado
        ? '<p class="panel-caja__ayuda">El pedido está cancelado: su stock ya se repuso y no se puede cambiar de estado.</p>'
        : `
            <form id="form-estado">
                <div class="campo">
                    <label for="nuevo-estado">Nuevo estado</label>
                    <select id="nuevo-estado" name="id_estado">
                        ${estados.filter(estado => estado.id_estado !== pedido.id_estado)
                            .map(estado => `<option value="${estado.id_estado}">${escapar(estado.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div class="campo">
                    <label for="comentario">Comentario (opcional)</label>
                    <input id="comentario" name="comentario" maxlength="255" placeholder="Por ejemplo: pago recibido">
                </div>
                <button class="boton boton--bloque" type="submit">Cambiar estado</button>
                <p class="panel-caja__ayuda">Si lo cancelás, el stock de sus productos vuelve a estar disponible.</p>
            </form>`;

    document.getElementById('contenido').innerHTML = `
        <div class="admin-encabezado">
            <div>
                <nav class="migas" aria-label="Estás en"><a href="admin-pedidos.html">Pedidos</a> / #${pedido.id_pedido}</nav>
                <h1>Pedido #${pedido.id_pedido}</h1>
                <p class="admin-encabezado__subtitulo">${fecha(pedido.fecha_pedido, true)} · ${etiquetaEstado(pedido.estado)}</p>
            </div>
            <a class="boton boton--borde" href="admin-pedidos.html">Volver</a>
        </div>

        <div class="admin-columnas admin-columnas--formulario">
            <div class="admin-columnas__principal">
                <section class="panel-caja" aria-labelledby="titulo-productos">
                    <h2 id="titulo-productos">Productos</h2>
                    <ul class="lista-pedido">${productos}</ul>
                    <p class="total-pedido">Total <strong>${precio(pedido.total)}</strong></p>
                </section>
                <section class="panel-caja" aria-labelledby="titulo-historial">
                    <h2 id="titulo-historial">Historial de estados</h2>
                    <ol class="historial">${historial}</ol>
                </section>
            </div>

            <div class="admin-columnas__lateral">
                <section class="panel-caja" aria-labelledby="titulo-cambiar">
                    <h2 id="titulo-cambiar">Estado</h2>
                    ${cambiarEstado}
                </section>
                <section class="panel-caja" aria-labelledby="titulo-cliente">
                    <h2 id="titulo-cliente">Cliente</h2>
                    <dl class="datos-lista">
                        <div><dt>Nombre</dt><dd>${escapar(pedido.cliente)}</dd></div>
                        <div><dt>Correo</dt><dd><a href="mailto:${escapar(pedido.email)}">${escapar(pedido.email)}</a></dd></div>
                        <div><dt>Teléfono</dt><dd>${escapar(pedido.telefono_contacto)}</dd></div>
                        ${pedido.nota_cliente ? `<div><dt>Nota</dt><dd>${escapar(pedido.nota_cliente)}</dd></div>` : ''}
                    </dl>
                </section>
                <section class="panel-caja" aria-labelledby="titulo-entrega">
                    <h2 id="titulo-entrega">Entrega y pago</h2>
                    <dl class="datos-lista">
                        <div><dt>Entrega</dt><dd>${escapar(pedido.metodo_entrega)}</dd></div>
                        ${pedido.direccion_entrega ? `<div><dt>Dirección</dt><dd>${escapar(pedido.direccion_entrega)}</dd></div>` : ''}
                        <div><dt>Pago</dt><dd>${escapar(pedido.metodo_pago)}</dd></div>
                    </dl>
                </section>
            </div>
        </div>`;

    document.getElementById('form-estado')?.addEventListener('submit', guardarEstado);
}

async function guardarEstado(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    const idEstado = Number(formulario.elements.id_estado.value);
    const nuevo = estados.find(estado => estado.id_estado === idEstado);

    if (nuevo.nombre === 'Cancelado' &&
        !confirm(`¿Cancelar el pedido #${idPedido}?\nEl stock de sus productos vuelve a estar disponible y no se puede deshacer.`)) {
        return;
    }

    const boton = formulario.querySelector('[type="submit"]');
    boton.disabled = true;
    const respuesta = await api(`admin/pedidos/${idPedido}/estado`, 'PATCH', {
        id_estado: idEstado,
        comentario: formulario.elements.comentario.value.trim(),
    });

    if (!respuesta.ok) {
        boton.disabled = false;
        avisar(respuesta.error, { tipo: 'error' });
        return;
    }
    avisar(nuevo.nombre === 'Cancelado' ? 'Pedido cancelado: el stock se repuso' : `El pedido pasó a «${nuevo.nombre}»`);
    dibujar(respuesta.data);
}
