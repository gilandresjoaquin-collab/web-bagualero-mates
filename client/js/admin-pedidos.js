/**
 * Panel: lista de pedidos, con filtros por estado y por fecha (HU-20).
 */

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }

    const respuestaEstados = await api('admin/estados-pedido');
    const estados = respuestaEstados.ok ? respuestaEstados.data : [];

    document.getElementById('contenido').innerHTML = `
        ${encabezadoAdmin('Pedidos', '<span id="resumen-pedidos"></span>')}

        <form id="form-filtros" class="panel-caja filtros-admin filtros-admin--pedidos">
            <div class="campo">
                <label for="filtro-estado">Estado</label>
                <select id="filtro-estado" name="estado">
                    <option value="">Todos</option>
                    ${estados.map(estado => `<option value="${estado.id_estado}">${escapar(estado.nombre)}</option>`).join('')}
                </select>
            </div>
            <div class="campo">
                <label for="filtro-desde">Desde</label>
                <input id="filtro-desde" name="desde" type="date">
            </div>
            <div class="campo">
                <label for="filtro-hasta">Hasta</label>
                <input id="filtro-hasta" name="hasta" type="date">
            </div>
            <button class="boton boton--borde" type="reset">Limpiar filtros</button>
        </form>

        <section class="panel-caja" aria-label="Lista de pedidos">
            <div id="lista-pedidos"><p class="cargando">Cargando…</p></div>
        </section>`;

    const formulario = document.getElementById('form-filtros');
    formulario.addEventListener('change', () => cargar(formulario));
    formulario.addEventListener('submit', evento => evento.preventDefault());
    // "Limpiar": el formulario se vacía y después se recarga la lista
    formulario.addEventListener('reset', () => setTimeout(() => cargar(formulario)));

    cargar(formulario);
}

async function cargar(formulario) {
    const parametros = new URLSearchParams();
    for (const campo of ['estado', 'desde', 'hasta']) {
        if (formulario.elements[campo].value) {
            parametros.set(campo, formulario.elements[campo].value);
        }
    }

    const respuesta = await api('admin/pedidos?' + parametros);
    const lista = document.getElementById('lista-pedidos');
    if (!respuesta.ok) {
        lista.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }

    const pedidos = respuesta.data;
    document.getElementById('resumen-pedidos').textContent =
        `${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}${parametros.toString() ? ' con estos filtros' : ''}`;
    lista.innerHTML = pedidos.length
        ? tablaPedidos(pedidos)
        : '<p class="admin-vacio">No hay pedidos con estos filtros.</p>';
}
