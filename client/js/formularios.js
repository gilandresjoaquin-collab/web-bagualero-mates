/**
 * Ayudas para los formularios: leer los datos, validarlos y mostrar los errores.
 * Las reglas son las mismas que valida el servidor (server/includes/validaciones.php),
 * así el usuario ve el error al instante, sin esperar la respuesta.
 *
 * El HTML de cada campo es:
 *   <div class="campo"> <label for="x">…</label> <input id="x" name="…"> </div>
 * y cada formulario tiene arriba un <div class="alerta alerta--error" role="alert" hidden></div>.
 */

/** Devuelve los datos del formulario como objeto. Recorta los espacios, salvo en las contraseñas. */
function leerFormulario(formulario) {
    const datos = {};
    for (const [nombre, valor] of new FormData(formulario)) {
        const esContrasena = formulario.elements[nombre].type === 'password';
        datos[nombre] = typeof valor === 'string' && !esContrasena ? valor.trim() : valor;
    }
    return datos;
}

/** Borra los errores y la alerta que se mostraron antes. */
function limpiarErrores(formulario) {
    formulario.querySelectorAll('.campo--error').forEach(campo => campo.classList.remove('campo--error'));
    formulario.querySelectorAll('.campo__error').forEach(mensaje => mensaje.remove());
    formulario.querySelectorAll('[aria-invalid]').forEach(entrada => {
        entrada.removeAttribute('aria-invalid');
        entrada.removeAttribute('aria-describedby');
    });
    formulario.querySelector('.alerta').hidden = true;
}

/**
 * Muestra cada error debajo de su campo. Recibe un objeto { nombreDelCampo: 'mensaje' }.
 * Devuelve true si había algún error, y deja el cursor en el primero.
 */
function mostrarErrores(formulario, errores) {
    const campos = Object.keys(errores);

    campos.forEach(nombre => {
        const entrada = formulario.elements[nombre];
        const mensaje = document.createElement('p');
        mensaje.className = 'campo__error';
        mensaje.id = entrada.id + '-error';
        mensaje.textContent = errores[nombre];

        entrada.closest('.campo').classList.add('campo--error');
        entrada.closest('.campo').appendChild(mensaje);
        entrada.setAttribute('aria-invalid', 'true');
        entrada.setAttribute('aria-describedby', mensaje.id); // el lector de pantalla lee el error
    });

    if (campos.length > 0) {
        formulario.elements[campos[0]].focus();
    }
    return campos.length > 0;
}

/** Muestra un mensaje general arriba del formulario (por ejemplo, el error que devolvió el servidor). */
function mostrarAlerta(formulario, mensaje) {
    const alerta = formulario.querySelector('.alerta');
    alerta.textContent = mensaje;
    alerta.hidden = false;
}

/** Desactiva el botón mientras se envía el formulario, para evitar el doble clic. */
function enviando(formulario, activo, texto = 'Enviando…') {
    // formulario.elements también incluye los botones de afuera conectados con form="id-del-formulario"
    const boton = [...formulario.elements].find(elemento => elemento.type === 'submit');
    if (activo) {
        boton.dataset.texto = boton.textContent;
        boton.textContent = texto;
        boton.disabled = true;
    } else {
        boton.textContent = boton.dataset.texto;
        boton.disabled = false;
    }
}

/* ---------- Reglas (cada una devuelve el mensaje de error, o '' si está bien) ---------- */

/** Campo de texto obligatorio. "nombre" va con artículo: 'el nombre', 'la dirección'. */
function errorTexto(valor, nombre, maximo) {
    if (!valor) {
        return `Completá ${nombre}`;
    }
    if ([...valor].length > maximo) {
        return `${nombre[0].toUpperCase() + nombre.slice(1)} no puede tener más de ${maximo} caracteres`;
    }
    return '';
}

function errorEmail(email) {
    if (!email) {
        return 'Completá el correo';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'El correo no tiene un formato válido';
    }
    return '';
}

/** Solo números, espacios y + - ( ), con al menos 6 números. */
function errorTelefono(telefono) {
    if (!telefono) {
        return 'Completá el teléfono';
    }
    const numeros = (telefono.match(/\d/g) || []).length;
    if (!/^[0-9 +()-]+$/.test(telefono) || numeros < 6) {
        return 'El teléfono no es válido: usá solo números (por ejemplo, 2235550000)';
    }
    return '';
}

/** Al menos 8 caracteres, con al menos una letra y un número (HU-07). */
function errorPassword(password) {
    if ([...password].length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password)) {
        return 'La contraseña tiene que tener al menos 8 caracteres, con al menos una letra y un número';
    }
    if (new TextEncoder().encode(password).length > 72) {
        return 'La contraseña no puede tener más de 72 caracteres';
    }
    return '';
}
