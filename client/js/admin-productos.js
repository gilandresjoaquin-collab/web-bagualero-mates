/**
 * Panel: lista de productos, con búsqueda y filtros, y dar de baja o reactivar (HU-18).
 */

const filtros = { buscar: '', categoria: '', estado: '' };
let temporizador = null;
let consultaActual = 0;

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }

    const respuestaCategorias = await api('admin/categorias');
    const categorias = respuestaCategorias.ok ? respuestaCategorias.data : [];

    document.getElementById('contenido').innerHTML = `
        ${encabezadoAdmin('Productos', '<span id="resumen-productos"></span>',
            `<a class="boton" href="admin-producto.html">${icono('mas', 18)} Nuevo producto</a>`)}

        <form id="form-filtros" class="panel-caja filtros-admin" role="search">
            <div class="buscador">
                <label class="oculto-visual" for="buscar-producto">Buscar productos</label>
                ${icono('buscar', 20)}
                <input type="search" id="buscar-producto" name="buscar" placeholder="Buscar por nombre o SKU…">
            </div>
            <label class="oculto-visual" for="filtro-categoria">Categoría</label>
            <select id="filtro-categoria" name="categoria">
                <option value="">Categoría: Todas</option>
                ${categorias.map(c => `<option value="${c.id_categoria}">${escapar(c.nombre)}</option>`).join('')}
            </select>
            <label class="oculto-visual" for="filtro-estado">Estado</label>
            <select id="filtro-estado" name="estado">
                <option value="">Estado: Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Dados de baja</option>
            </select>
        </form>

        <section class="panel-caja" aria-label="Lista de productos">
            <div id="lista-productos"><p class="cargando">Cargando…</p></div>
        </section>`;

    const formulario = document.getElementById('form-filtros');
    // Al escribir se busca solo, un ratito después de la última tecla
    formulario.addEventListener('input', () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => leerFiltros(formulario), 300);
    });
    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        leerFiltros(formulario);
    });
    document.getElementById('lista-productos').addEventListener('change', cambiarEstado);

    // Mensaje al volver del formulario después de guardar
    if (new URLSearchParams(location.search).get('guardado')) {
        avisar('Producto guardado');
        history.replaceState(null, '', 'admin-productos.html');
    }
    cargar();
}

function leerFiltros(formulario) {
    filtros.buscar = formulario.elements.buscar.value.trim();
    filtros.categoria = formulario.elements.categoria.value;
    filtros.estado = formulario.elements.estado.value;
    cargar();
}

async function cargar() {
    const numero = ++consultaActual;
    const parametros = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor));
    const respuesta = await api('admin/productos?' + parametros);
    if (numero !== consultaActual) {
        return; // llegó tarde: ya se pidió otra búsqueda
    }

    const lista = document.getElementById('lista-productos');
    if (!respuesta.ok) {
        lista.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }

    const { productos, total, dados_de_baja: dadosDeBaja } = respuesta.data;
    document.getElementById('resumen-productos').textContent =
        `${total} ${total === 1 ? 'producto' : 'productos'} · ${dadosDeBaja} ${dadosDeBaja === 1 ? 'dado' : 'dados'} de baja`;

    if (productos.length === 0) {
        lista.innerHTML = '<p class="admin-vacio">No hay productos con esos filtros.</p>';
        return;
    }

    lista.innerHTML = `
        <table class="tabla">
            <thead>
                <tr>
                    <th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Stock</th>
                    <th>Dest.</th><th>Activo</th><th><span class="oculto-visual">Acciones</span></th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(producto => `
                    <tr${producto.activo ? '' : ' class="tabla__fila--apagada"'}>
                        <td data-titulo="Producto">${productoMini(producto.imagen, producto.nombre)}</td>
                        <td data-titulo="SKU">${escapar(producto.sku)}</td>
                        <td data-titulo="Categoría">${escapar(producto.categoria)}</td>
                        <td data-titulo="Precio"><strong>${precio(producto.precio)}</strong></td>
                        <td data-titulo="Stock"><span class="unidades${producto.stock === 0 ? ' unidades--cero' : ''}">${producto.stock}</span></td>
                        <td data-titulo="Destacado">${producto.destacado ? '<span aria-label="Sí">★</span>' : '<span aria-label="No">—</span>'}</td>
                        <td data-titulo="Activo">
                            <input class="interruptor" type="checkbox" role="switch" ${producto.activo ? 'checked' : ''}
                                   data-id="${producto.id_producto}" data-nombre="${escapar(producto.nombre)}"
                                   aria-label="Activo: ${escapar(producto.nombre)}">
                        </td>
                        <td data-titulo="">
                            <a class="boton-icono" href="admin-producto.html?id=${producto.id_producto}" aria-label="Editar ${escapar(producto.nombre)}">
                                ${icono('editar', 18)}
                            </a>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

/** Interruptor "Activo": da de baja (con confirmación, HU-18) o reactiva. */
async function cambiarEstado(evento) {
    const interruptor = evento.target.closest('.interruptor');
    if (!interruptor) {
        return;
    }
    const activo = interruptor.checked;
    const nombre = interruptor.dataset.nombre;

    if (!activo && !confirm(`¿Dar de baja «${nombre}»?\nDeja de verse en la tienda, pero queda guardado y se puede reactivar.`)) {
        interruptor.checked = true;
        return;
    }

    interruptor.disabled = true;
    const respuesta = await api(`admin/productos/${interruptor.dataset.id}/estado`, 'PATCH', { activo });
    if (!respuesta.ok) {
        avisar(respuesta.error, { tipo: 'error' });
        interruptor.checked = !activo;
        interruptor.disabled = false;
        return;
    }
    avisar(activo ? `«${nombre}» está otra vez a la venta` : `«${nombre}» se dio de baja`);
    cargar();
}
