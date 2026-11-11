/**
 * Panel: categorías. Crear, editar y activar o desactivar (HU-19).
 */

let categorias = [];
let editando = null; // id de la categoría que se está editando (null: nueva)

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }

    document.getElementById('contenido').innerHTML = `
        ${encabezadoAdmin('Categorías', 'Una categoría no se puede desactivar mientras tenga productos activos.')}

        <div class="admin-columnas admin-columnas--categorias">
            <section class="panel-caja" aria-labelledby="titulo-formulario">
                <h2 id="titulo-formulario">Nueva categoría</h2>
                <form id="form-categoria" novalidate>
                    <div class="alerta alerta--error" role="alert" hidden></div>
                    <div class="campo">
                        <label for="nombre">Nombre <span class="requerido">*</span></label>
                        <input id="nombre" name="nombre" maxlength="60" required>
                    </div>
                    <div class="campo">
                        <label for="descripcion">Descripción</label>
                        <input id="descripcion" name="descripcion" maxlength="255">
                    </div>
                    <div class="botones-fila">
                        <button class="boton" type="submit">Guardar</button>
                        <button class="boton boton--borde" type="button" id="cancelar-edicion" hidden>Cancelar</button>
                    </div>
                </form>
            </section>

            <section class="panel-caja" aria-label="Lista de categorías">
                <div id="lista-categorias"><p class="cargando">Cargando…</p></div>
            </section>
        </div>`;

    document.getElementById('form-categoria').addEventListener('submit', guardar);
    document.getElementById('cancelar-edicion').addEventListener('click', () => editar(null));
    const lista = document.getElementById('lista-categorias');
    lista.addEventListener('click', evento => {
        const boton = evento.target.closest('[data-editar]');
        if (boton) {
            editar(Number(boton.dataset.editar));
        }
    });
    lista.addEventListener('change', cambiarEstado);

    cargar();
}

async function cargar() {
    const respuesta = await api('admin/categorias');
    const lista = document.getElementById('lista-categorias');
    if (!respuesta.ok) {
        lista.innerHTML = `<p class="alerta alerta--error">${escapar(respuesta.error)}</p>`;
        return;
    }
    categorias = respuesta.data;

    lista.innerHTML = `
        <table class="tabla">
            <thead>
                <tr><th>Nombre</th><th>Descripción</th><th>Productos activos</th><th>Activa</th><th><span class="oculto-visual">Acciones</span></th></tr>
            </thead>
            <tbody>
                ${categorias.map(categoria => `
                    <tr${categoria.activa ? '' : ' class="tabla__fila--apagada"'}>
                        <td data-titulo="Nombre"><strong>${escapar(categoria.nombre)}</strong></td>
                        <td data-titulo="Descripción">${escapar(categoria.descripcion || '—')}</td>
                        <td data-titulo="Productos activos">${categoria.productos_activos} de ${categoria.productos}</td>
                        <td data-titulo="Activa">
                            <input class="interruptor" type="checkbox" role="switch" ${categoria.activa ? 'checked' : ''}
                                   data-id="${categoria.id_categoria}" aria-label="Activa: ${escapar(categoria.nombre)}">
                        </td>
                        <td data-titulo="">
                            <button class="boton-icono" type="button" data-editar="${categoria.id_categoria}" aria-label="Editar ${escapar(categoria.nombre)}">
                                ${icono('editar', 18)}
                            </button>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

/** Pasa el formulario a "editar" una categoría (o vuelve a "nueva" con null). */
function editar(id) {
    editando = id;
    const formulario = document.getElementById('form-categoria');
    const categoria = categorias.find(c => c.id_categoria === id);

    limpiarErrores(formulario);
    formulario.elements.nombre.value = categoria ? categoria.nombre : '';
    formulario.elements.descripcion.value = categoria ? (categoria.descripcion || '') : '';
    document.getElementById('titulo-formulario').textContent = categoria ? `Editar «${categoria.nombre}»` : 'Nueva categoría';
    document.getElementById('cancelar-edicion').hidden = !categoria;
    if (categoria) {
        formulario.elements.nombre.focus();
    }
}

async function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    limpiarErrores(formulario);

    const datos = leerFormulario(formulario);
    if (mostrarErrores(formulario, errorTexto(datos.nombre, 'el nombre', 60) ? { nombre: errorTexto(datos.nombre, 'el nombre', 60) } : {})) {
        return;
    }

    enviando(formulario, true, 'Guardando…');
    const respuesta = editando
        ? await api(`admin/categorias/${editando}`, 'PUT', datos)
        : await api('admin/categorias', 'POST', datos);
    enviando(formulario, false);

    if (!respuesta.ok) {
        if (respuesta.estado === 409) {
            mostrarErrores(formulario, { nombre: respuesta.error }); // nombre repetido
        } else {
            mostrarAlerta(formulario, respuesta.error);
        }
        return;
    }

    avisar(editando ? 'Categoría guardada' : 'Categoría creada');
    editar(null);
    cargar();
}

/** Interruptor "Activa". Si tiene productos activos, el servidor no deja desactivarla (HU-19). */
async function cambiarEstado(evento) {
    const interruptor = evento.target.closest('.interruptor');
    if (!interruptor) {
        return;
    }
    const activa = interruptor.checked;

    interruptor.disabled = true;
    const respuesta = await api(`admin/categorias/${interruptor.dataset.id}/estado`, 'PATCH', { activa });
    if (!respuesta.ok) {
        avisar(respuesta.error, { tipo: 'error' });
        interruptor.checked = !activa;
        interruptor.disabled = false;
        return;
    }
    avisar(activa ? 'Categoría activada' : 'Categoría desactivada: ya no se ve en la tienda');
    cargar();
}
