/**
 * Inicio: accesos a cada categoría, Destacados y Nuevos ingresos (HU-06).
 */

iniciar();

async function iniciar() {
    const [categorias, destacados, novedades] = await Promise.all([
        api('categorias'),
        api('productos/destacados'),
        api('productos/novedades'),
    ]);

    // Accesos directos a cada categoría
    if (categorias.ok) {
        document.getElementById('categorias-inicio').innerHTML = categorias.data.map((categoria, orden) => `
            <li>
                <a class="categoria-tarjeta" href="catalogo.html?categoria=${categoria.id_categoria}" style="--orden: ${orden}">
                    <span class="categoria-tarjeta__foto"><img src="${ilustracion(categoria.nombre)}" alt="" loading="lazy"></span>
                    ${escapar(categoria.nombre)}
                </a>
            </li>`).join('');
    }

    mostrarProductos('destacados', destacados);
    mostrarProductos('novedades', novedades);
}

/** Dibuja una sección de productos. Si no hay ninguno, la sección queda oculta. */
function mostrarProductos(seccion, respuesta) {
    if (!respuesta.ok || respuesta.data.length === 0) {
        return;
    }
    const grilla = document.getElementById(`grilla-${seccion}`);
    grilla.innerHTML = respuesta.data.map(tarjetaProducto).join('');
    grilla.addEventListener('click', evento => {
        const agregar = evento.target.closest('[data-agregar]');
        if (agregar) {
            agregarAlCarrito(Number(agregar.dataset.agregar), 1, agregar);
        }
    });
    document.getElementById(seccion).hidden = false;
}
