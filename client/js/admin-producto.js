/**
 * Panel: alta y edición de un producto, con sus fotos (HU-17 y HU-18).
 *   admin-producto.html       → producto nuevo
 *   admin-producto.html?id=5  → editar el producto 5
 */

const idProducto = Number(new URLSearchParams(location.search).get('id')) || null;
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

let producto = null;       // los datos guardados (al editar)
let fotosNuevas = [];      // fotos elegidas para un producto nuevo (se suben después de crearlo)

iniciar();

async function iniciar() {
    if (!await entrarAlPanel()) {
        return;
    }
    const contenido = document.getElementById('contenido');

    const pedidos = [api('admin/categorias'), api('materiales')];
    if (idProducto) {
        pedidos.push(api(`admin/productos/${idProducto}`));
    }
    const [respuestaCategorias, respuestaMateriales, respuestaProducto] = await Promise.all(pedidos);

    if (idProducto && !respuestaProducto.ok) {
        contenido.innerHTML = encabezadoAdmin('Editar producto') + `
            <p class="alerta alerta--error">${escapar(respuestaProducto.error)}</p>
            <a class="boton boton--borde" href="admin-productos.html">Volver a productos</a>`;
        return;
    }
    producto = idProducto ? respuestaProducto.data : null;
    dibujarFormulario(respuestaCategorias.data || [], respuestaMateriales.data || []);

    if (new URLSearchParams(location.search).get('aviso') === 'fotos') {
        avisar('El producto se guardó, pero las fotos no se pudieron subir. Probá de nuevo.', { tipo: 'error' });
    }
}

function dibujarFormulario(categorias, materiales) {
    const datos = producto || { nombre: '', descripcion: '', id_categoria: '', precio: '', stock: '', sku: '', medidas: '', materiales: [], activo: true, destacado: false };
    const titulo = idProducto ? 'Editar producto' : 'Nuevo producto';
    document.title = `${titulo} · Panel · Bagualero Mates`;

    // Categorías activas (y la del producto, aunque esté desactivada)
    const opcionesCategoria = categorias
        .filter(categoria => categoria.activa || categoria.id_categoria === datos.id_categoria)
        .map(categoria => `
            <option value="${categoria.id_categoria}" ${categoria.id_categoria === datos.id_categoria ? 'selected' : ''}>
                ${escapar(categoria.nombre)}${categoria.activa ? '' : ' (desactivada)'}
            </option>`).join('');

    const opcionesMaterial = materiales.map(material => `
        <label class="opcion-chica">
            <input type="checkbox" name="materiales" value="${material.id_material}" ${datos.materiales.includes(material.id_material) ? 'checked' : ''}>
            ${escapar(material.nombre)}
        </label>`).join('');

    document.getElementById('contenido').innerHTML = `
        <div class="admin-encabezado">
            <div>
                <nav class="migas" aria-label="Estás en"><a href="admin-productos.html">Productos</a> / ${idProducto ? 'Editar' : 'Nuevo'}</nav>
                <h1>${titulo}</h1>
            </div>
            <a class="boton boton--borde" href="admin-productos.html">Volver</a>
        </div>

        <form id="form-producto" class="admin-columnas admin-columnas--formulario" novalidate>
            <section class="panel-caja" aria-labelledby="titulo-datos">
                <div class="alerta alerta--error" role="alert" hidden></div>
                <h2 id="titulo-datos">Datos del producto</h2>

                <div class="campo">
                    <label for="nombre">Nombre <span class="requerido">*</span></label>
                    <input id="nombre" name="nombre" maxlength="120" required>
                </div>
                <div class="campo">
                    <label for="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" maxlength="2000" rows="4"></textarea>
                </div>
                <div class="campos-dos">
                    <div class="campo">
                        <label for="categoria">Categoría <span class="requerido">*</span></label>
                        <select id="categoria" name="id_categoria" required>
                            <option value="">Elegí una categoría</option>
                            ${opcionesCategoria}
                        </select>
                    </div>
                    <div class="campo">
                        <label for="medidas">Medidas</label>
                        <input id="medidas" name="medidas" maxlength="80" placeholder="9 cm alto x 8 cm diámetro">
                    </div>
                    <div class="campo">
                        <label for="precio">Precio ($) <span class="requerido">*</span></label>
                        <input id="precio" name="precio" type="number" min="0.01" step="0.01" inputmode="decimal" required>
                    </div>
                    <div class="campo">
                        <label for="stock">Stock <span class="requerido">*</span></label>
                        <input id="stock" name="stock" type="number" min="0" step="1" inputmode="numeric" required>
                    </div>
                    <div class="campo">
                        <label for="sku">SKU</label>
                        <input id="sku" name="sku" maxlength="30" placeholder="Si lo dejás vacío, se genera solo">
                    </div>
                </div>
                <fieldset class="materiales-admin">
                    <legend>Materiales</legend>
                    <div class="materiales-admin__opciones">${opcionesMaterial}</div>
                </fieldset>
            </section>

            <div class="admin-columnas__lateral">
                <section class="panel-caja" aria-labelledby="titulo-fotos">
                    <h2 id="titulo-fotos">Fotos</h2>
                    <label class="subir-fotos">
                        <input type="file" id="fotos" accept="image/jpeg,image/png,image/webp" multiple>
                        ${icono('caja', 22)}
                        <strong>Arrastrá las fotos o tocá para elegirlas</strong>
                        <small>JPG, PNG o WEBP · hasta 2 MB cada una</small>
                    </label>
                    <div id="lista-fotos" class="fotos-admin"></div>
                </section>

                <section class="panel-caja" aria-labelledby="titulo-visibilidad">
                    <h2 id="titulo-visibilidad">Visibilidad</h2>
                    <label class="fila-interruptor">
                        Producto activo (se ve en la tienda)
                        <input class="interruptor" type="checkbox" role="switch" name="activo" ${datos.activo ? 'checked' : ''}>
                    </label>
                    <label class="fila-interruptor">
                        Mostrar en Destacados
                        <input class="interruptor" type="checkbox" role="switch" name="destacado" ${datos.destacado ? 'checked' : ''}>
                    </label>
                    <button class="boton boton--bloque" type="submit">Guardar producto</button>
                </section>
            </div>
        </form>`;

    // Los textos se cargan con .value (así no hace falta escaparlos)
    const formulario = document.getElementById('form-producto');
    for (const campo of ['nombre', 'descripcion', 'precio', 'stock', 'sku', 'medidas']) {
        formulario.elements[campo].value = datos[campo] ?? '';
    }

    dibujarFotos();
    document.getElementById('fotos').addEventListener('change', elegirFotos);
    document.getElementById('lista-fotos').addEventListener('click', accionFoto);
    formulario.addEventListener('submit', guardar);
}

/* ---------- Fotos ---------- */

function dibujarFotos() {
    const lista = document.getElementById('lista-fotos');

    // Producto nuevo: solo los nombres de las fotos elegidas (se suben al guardar)
    if (!idProducto) {
        lista.innerHTML = fotosNuevas.length
            ? `<ul class="fotos-admin__nuevas">${fotosNuevas.map(foto => `<li>${escapar(foto.name)}</li>`).join('')}</ul>
               <p class="panel-caja__ayuda">Se suben al guardar el producto. La primera queda como principal.</p>`
            : '<p class="panel-caja__ayuda">Todavía no elegiste fotos.</p>';
        return;
    }

    lista.innerHTML = producto.imagenes.length
        ? producto.imagenes.map(foto => `
            <figure class="foto-admin">
                <div class="foto-admin__imagen">${fotoProducto(foto.ruta, producto.nombre)}</div>
                <figcaption>
                    ${foto.es_principal
                        ? '<span class="etiqueta">Principal</span>'
                        : `<button class="enlace-boton" type="button" data-principal="${foto.id_imagen}">Hacer principal</button>`}
                    <button class="enlace-boton enlace-boton--peligro" type="button" data-borrar="${foto.id_imagen}">Borrar</button>
                </figcaption>
            </figure>`).join('')
        : '<p class="panel-caja__ayuda">Este producto todavía no tiene fotos.</p>';
}

/** Controla tipo y tamaño antes de subir (HU-17). Devuelve el mensaje de error o ''. */
function errorFotos(archivos) {
    for (const archivo of archivos) {
        if (!TIPOS_DE_FOTO.includes(archivo.type)) {
            return `«${archivo.name}» no es una foto JPG, PNG o WEBP`;
        }
        if (archivo.size > TAMANIO_MAXIMO_FOTO) {
            return `«${archivo.name}» pesa más de 2 MB`;
        }
    }
    return '';
}

async function subirFotos(id, archivos) {
    const datos = new FormData();
    archivos.forEach(archivo => datos.append('imagenes[]', archivo));
    return api(`admin/productos/${id}/imagenes`, 'POST', datos);
}

async function elegirFotos(evento) {
    const entrada = evento.target;
    const archivos = [...entrada.files];
    entrada.value = ''; // así se puede volver a elegir la misma foto
    if (archivos.length === 0) {
        return;
    }

    const error = errorFotos(archivos);
    if (error) {
        avisar(error, { tipo: 'error' });
        return;
    }

    if (!idProducto) {
        fotosNuevas = fotosNuevas.concat(archivos);
        dibujarFotos();
        return;
    }

    // Al editar, se suben en el momento
    document.getElementById('lista-fotos').insertAdjacentHTML('afterbegin', '<p class="cargando">Subiendo…</p>');
    const respuesta = await subirFotos(idProducto, archivos);
    if (respuesta.ok) {
        producto.imagenes = respuesta.data;
        avisar(archivos.length === 1 ? 'Foto subida' : 'Fotos subidas');
    } else {
        avisar(respuesta.error, { tipo: 'error' });
    }
    dibujarFotos();
}

/** "Hacer principal" y "Borrar" de cada foto. */
async function accionFoto(evento) {
    const principal = evento.target.closest('[data-principal]');
    const borrar = evento.target.closest('[data-borrar]');
    let respuesta = null;

    if (principal) {
        respuesta = await api(`admin/productos/${idProducto}/imagenes/${principal.dataset.principal}`, 'PATCH');
    } else if (borrar) {
        if (!confirm('¿Borrar esta foto? No se puede deshacer.')) {
            return;
        }
        respuesta = await api(`admin/productos/${idProducto}/imagenes/${borrar.dataset.borrar}`, 'DELETE');
    } else {
        return;
    }

    if (!respuesta.ok) {
        avisar(respuesta.error, { tipo: 'error' });
        return;
    }
    producto.imagenes = respuesta.data;
    dibujarFotos();
}

/* ---------- Guardar ---------- */

async function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    limpiarErrores(formulario);

    const datos = leerFormulario(formulario);
    const nuevo = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        id_categoria: Number(datos.id_categoria) || null,
        precio: Number(datos.precio),
        stock: Number(datos.stock),
        sku: datos.sku,
        medidas: datos.medidas,
        materiales: [...formulario.querySelectorAll('input[name="materiales"]:checked')].map(casilla => Number(casilla.value)),
        activo: formulario.elements.activo.checked,
        destacado: formulario.elements.destacado.checked,
    };

    // Las mismas reglas que el servidor (HU-17)
    const errores = {};
    if (errorTexto(datos.nombre, 'el nombre', 120)) {
        errores.nombre = errorTexto(datos.nombre, 'el nombre', 120);
    }
    if (!nuevo.id_categoria) {
        errores.id_categoria = 'Elegí una categoría';
    }
    if (!(nuevo.precio > 0)) {
        errores.precio = 'El precio tiene que ser mayor a 0';
    }
    if (datos.stock === '' || !Number.isInteger(nuevo.stock) || nuevo.stock < 0) {
        errores.stock = 'El stock tiene que ser un número entero, 0 o más';
    }
    if (mostrarErrores(formulario, errores)) {
        return;
    }

    // Antes de dar de baja se pide confirmación (HU-18)
    if (producto && producto.activo && !nuevo.activo &&
        !confirm(`¿Dar de baja «${producto.nombre}»?\nDeja de verse en la tienda, pero queda guardado y se puede reactivar.`)) {
        return;
    }

    enviando(formulario, true, 'Guardando…');
    const respuesta = idProducto
        ? await api(`admin/productos/${idProducto}`, 'PUT', nuevo)
        : await api('admin/productos', 'POST', nuevo);

    if (!respuesta.ok) {
        enviando(formulario, false);
        if (respuesta.estado === 409) {
            mostrarErrores(formulario, { sku: respuesta.error }); // SKU repetido
        } else {
            mostrarAlerta(formulario, respuesta.error);
            formulario.querySelector('.alerta').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    if (idProducto) {
        producto = { ...producto, ...nuevo, sku: respuesta.data.sku };
        formulario.elements.sku.value = respuesta.data.sku;
        enviando(formulario, false);
        avisar('Producto guardado');
        return;
    }

    // Producto nuevo: ahora que existe, se suben las fotos elegidas
    const id = respuesta.data.id_producto;
    if (fotosNuevas.length) {
        const subida = await subirFotos(id, fotosNuevas);
        if (!subida.ok) {
            location.href = `admin-producto.html?id=${id}&aviso=fotos`;
            return;
        }
    }
    location.href = 'admin-productos.html?guardado=1';
}
