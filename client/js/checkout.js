/**
 * Finalizar compra: entrega, pago, resumen y confirmación (HU-13 y HU-14).
 */

// Alias o CBU para las transferencias (por ejemplo, 'Alias: bagualero.mates · Titular: …').
// Mientras esté vacío, la confirmación avisa que los datos se envían por mensaje.
const DATOS_TRANSFERENCIA = '';

const contenedor = document.getElementById('checkout');
let carrito = null;
let entregas = [];
let pagos = [];
let usuario = null;
let direccionGuardada = null;

iniciar();

async function iniciar() {
    // Página privada: sin sesión, va al login (y después vuelve acá)
    usuario = await usuarioActual();
    if (!usuario) {
        location.replace(enlaceLogin());
        return;
    }

    const [respuestaCarrito, respuestaEntregas, respuestaPagos, respuestaDirecciones] =
        await Promise.all([api('carrito'), api('metodos-entrega'), api('metodos-pago'), api('usuarios/direcciones')]);
    // Dirección principal guardada en Mi cuenta (puede no tener)
    direccionGuardada = respuestaDirecciones.ok ? respuestaDirecciones.data[0] || null : null;

    const conError = [respuestaCarrito, respuestaEntregas, respuestaPagos].find(respuesta => !respuesta.ok);
    if (conError) {
        contenedor.innerHTML = `<p class="alerta alerta--error">${escapar(conError.error)}</p>`;
        return;
    }

    carrito = respuestaCarrito.data;
    entregas = respuestaEntregas.data;
    pagos = respuestaPagos.data;

    if (carrito.items.length === 0) {
        contenedor.innerHTML = pantallaVacia({
            simbolo: 'carrito',
            titulo: 'Tu carrito está vacío',
            texto: 'Para finalizar una compra, primero agregá productos al carrito.',
            botones: '<a class="boton" href="catalogo.html">Ver el catálogo</a>',
        });
        return;
    }

    dibujarFormulario();
}

/** Opción grande con un botón redondo (entrega o pago). */
function opcion(nombre, valor, titulo, detalle, marcada) {
    return `
        <label class="opcion">
            <input type="radio" name="${nombre}" value="${valor}" ${marcada ? 'checked' : ''}>
            <span>
                <strong>${escapar(titulo)}</strong>
                ${detalle ? `<small>${escapar(detalle)}</small>` : ''}
            </span>
        </label>`;
}

function dibujarFormulario() {
    const productos = carrito.items.map(item => `
        <li class="resumen__producto">
            <span class="resumen__foto">${fotoProducto(item.imagen, '', item.categoria)}</span>
            <span>${escapar(item.nombre)} <small>x${item.cantidad}</small></span>
            <strong>${precio(item.subtotal)}</strong>
        </li>`).join('');

    contenedor.innerHTML = `
        <div class="compra__fila">
            <form id="form-checkout" novalidate>
                <div class="alerta alerta--error" role="alert" hidden></div>

                <section class="tarjeta-formulario checkout__seccion" aria-labelledby="titulo-entrega">
                    <h2 id="titulo-entrega">1. ¿Cómo querés recibirlo?</h2>
                    <fieldset class="opciones">
                        <legend class="oculto-visual">Método de entrega</legend>
                        ${entregas.map((metodo, numero) => opcion('id_metodo_entrega', metodo.id_metodo_entrega, metodo.nombre, metodo.descripcion, numero === 0)).join('')}
                    </fieldset>

                    <div class="campos-dos">
                        <div class="campo" data-domicilio>
                            <label for="calle">Calle y número <span class="requerido">*</span></label>
                            <input id="calle" name="calle" maxlength="100" autocomplete="address-line1" placeholder="Av. Colón 2450">
                        </div>
                        <div class="campo" data-domicilio>
                            <label for="barrio">Barrio</label>
                            <input id="barrio" name="barrio" maxlength="60" placeholder="La Perla">
                        </div>
                        <div class="campo">
                            <label for="telefono">Teléfono de contacto <span class="requerido">*</span></label>
                            <input id="telefono" name="telefono_contacto" type="tel" maxlength="30" autocomplete="tel">
                        </div>
                        <div class="campo" data-domicilio>
                            <label for="referencias">Referencias</label>
                            <input id="referencias" name="referencias" maxlength="70" placeholder="Timbre B, portón negro">
                        </div>
                    </div>
                </section>

                <section class="tarjeta-formulario checkout__seccion" aria-labelledby="titulo-pago">
                    <h2 id="titulo-pago">2. ¿Cómo vas a pagar?</h2>
                    <fieldset class="opciones">
                        <legend class="oculto-visual">Método de pago</legend>
                        ${pagos.map((metodo, numero) => opcion('id_metodo_pago', metodo.id_metodo_pago, metodo.nombre, metodo.instrucciones, numero === 0)).join('')}
                    </fieldset>

                    <div class="campo">
                        <label for="nota">Nota para el vendedor (opcional)</label>
                        <textarea id="nota" name="nota_cliente" maxlength="255" rows="3" placeholder="Es para regalo, ¿lo pueden envolver?"></textarea>
                    </div>
                </section>
            </form>

            <aside class="tarjeta-formulario resumen" aria-label="Tu pedido">
                <h2>Tu pedido</h2>
                <ul class="resumen__productos">${productos}</ul>
                <dl>
                    <div><dt>Subtotal</dt><dd>${precio(carrito.total)}</dd></div>
                    <div><dt>Entrega</dt><dd id="resumen-entrega"></dd></div>
                    <div><dt>Pago</dt><dd id="resumen-pago"></dd></div>
                    <div class="resumen__total"><dt>Total</dt><dd>${precio(carrito.total)}</dd></div>
                </dl>
                ${carrito.hay_problemas ? '<p class="alerta alerta--error">Algunos productos ya no tienen stock suficiente. <a href="carrito.html">Revisá tu carrito</a>.</p>' : ''}
                <button class="boton boton--bloque" type="submit" form="form-checkout" ${carrito.hay_problemas ? 'disabled' : ''}>Confirmar pedido</button>
                <p class="resumen__nota">El stock se confirma en este paso.</p>
            </aside>
        </div>`;

    const formulario = document.getElementById('form-checkout');
    formulario.elements.telefono_contacto.value = usuario.telefono || '';

    // La dirección se completa sola con la de Mi cuenta, y se puede cambiar (HU-13)
    if (direccionGuardada) {
        formulario.elements.calle.value = `${direccionGuardada.calle} ${direccionGuardada.numero}`;
        formulario.elements.barrio.value = direccionGuardada.barrio || '';
        formulario.elements.referencias.value = (direccionGuardada.referencias || '').slice(0, 70);
    }
    formulario.addEventListener('change', actualizar);
    formulario.addEventListener('submit', confirmar);
    actualizar();
}

/** Muestra u oculta los campos de la dirección y actualiza el resumen con lo elegido. */
function actualizar() {
    const formulario = document.getElementById('form-checkout');
    const entrega = entregas.find(metodo => String(metodo.id_metodo_entrega) === formulario.elements.id_metodo_entrega.value);
    const pago = pagos.find(metodo => String(metodo.id_metodo_pago) === formulario.elements.id_metodo_pago.value);

    // La dirección solo se pide para el envío a domicilio
    formulario.querySelectorAll('[data-domicilio]').forEach(campo => {
        campo.hidden = !entrega.requiere_direccion;
    });

    document.getElementById('resumen-entrega').textContent = entrega.nombre;
    document.getElementById('resumen-pago').textContent = pago.nombre;
}

/** "Av. Colón 2450, La Perla, Mar del Plata (Timbre B)": así se guarda en el pedido. */
function armarDireccion(datos) {
    let direccion = datos.calle;
    if (datos.barrio) {
        direccion += `, ${datos.barrio}`;
    }
    direccion += ', Mar del Plata';
    if (datos.referencias) {
        direccion += ` (${datos.referencias})`;
    }
    return direccion;
}

async function confirmar(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    limpiarErrores(formulario);

    const datos = leerFormulario(formulario);
    const entrega = entregas.find(metodo => String(metodo.id_metodo_entrega) === datos.id_metodo_entrega);

    const errores = {};
    if (entrega.requiere_direccion && errorTexto(datos.calle, 'la calle y el número', 100)) {
        errores.calle = errorTexto(datos.calle, 'la calle y el número', 100);
    }
    if (errorTelefono(datos.telefono_contacto)) {
        errores.telefono_contacto = errorTelefono(datos.telefono_contacto);
    }
    if (mostrarErrores(formulario, errores)) {
        return;
    }

    const pedido = {
        id_metodo_entrega: Number(datos.id_metodo_entrega),
        id_metodo_pago: Number(datos.id_metodo_pago),
        direccion_entrega: entrega.requiere_direccion ? armarDireccion(datos) : null,
        telefono_contacto: datos.telefono_contacto,
        nota_cliente: datos.nota_cliente,
    };

    enviando(formulario, true, 'Confirmando…');
    const respuesta = await api('pedidos', 'POST', pedido);

    if (respuesta.ok) {
        actualizarContadorCarrito(0);
        dibujarConfirmacion(respuesta.data, datos.telefono_contacto);
        return;
    }
    enviando(formulario, false);

    // Por ejemplo: "No hay stock suficiente de: Mate… (disponibles: 1)" (HU-14)
    mostrarAlerta(formulario, respuesta.error);
    const alerta = formulario.querySelector('.alerta');
    if (respuesta.estado === 409) {
        const enlace = document.createElement('a');
        enlace.href = 'carrito.html';
        enlace.textContent = 'Revisá tu carrito';
        alerta.append('. ', enlace, '.');
    }
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** Número de pedido y próximos pasos (HU-13). */
function dibujarConfirmacion(pedido, telefono) {
    document.getElementById('paso-confirmacion').classList.add('pasos__paso--activo');
    document.getElementById('titulo').textContent = '¡Gracias por tu compra!';
    document.title = `Pedido N.° ${pedido.id_pedido} · Bagualero Mates`;

    // Cómo pagar: para la transferencia, los datos de la cuenta
    let comoPagar = pedido.instrucciones_pago;
    if (pedido.metodo_pago === 'Transferencia') {
        comoPagar = DATOS_TRANSFERENCIA
            ? `Transferí ${precio(pedido.total)} a: ${DATOS_TRANSFERENCIA}`
            : 'Te vamos a enviar los datos de la cuenta para que hagas la transferencia';
    }

    contenedor.innerHTML = `
        <section class="tarjeta-formulario confirmacion" aria-labelledby="titulo-confirmacion">
            <span class="confirmacion__icono">${icono('check', 32)}</span>
            <h2 id="titulo-confirmacion">Tu pedido N.° ${pedido.id_pedido} quedó registrado</h2>
            <p>Estado: <strong>${escapar(pedido.estado)}</strong></p>

            <dl class="confirmacion__datos">
                <div><dt>Total</dt><dd>${precio(pedido.total)}</dd></div>
                <div>
                    <dt>Entrega</dt>
                    <dd>${escapar(pedido.metodo_entrega)}${pedido.direccion_entrega ? `<br><small>${escapar(pedido.direccion_entrega)}</small>` : ''}</dd>
                </div>
                <div><dt>Pago</dt><dd>${escapar(pedido.metodo_pago)}</dd></div>
            </dl>

            <div class="alerta alerta--exito">
                <strong>Próximos pasos</strong>
                <ol>
                    ${comoPagar ? `<li>${escapar(comoPagar)}.</li>` : ''}
                    <li>Te vamos a escribir al ${escapar(telefono)} para confirmar el pedido y coordinar la entrega.</li>
                </ol>
            </div>

            <div class="botones-fila confirmacion__botones">
                <a class="boton" href="catalogo.html">Seguir comprando</a>
                <a class="boton boton--borde" href="cuenta.html#pedido-${pedido.id_pedido}">Ver mi pedido</a>
            </div>
        </section>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
