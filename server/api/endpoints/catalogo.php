<?php
/**
 * Catálogo: listado con filtros, detalle de producto, categorías y materiales.
 * HU-01 a HU-05.
 */

// Productos por página del listado (HU-01)
const PRODUCTOS_POR_PAGINA = 12;

// Subconsulta con la foto principal de cada producto (o la primera que tenga).
// "ruta" es el nombre del archivo dentro de server/uploads/.
const SQL_FOTO_PRINCIPAL = '(SELECT i.ruta FROM producto_imagenes i WHERE i.id_producto = p.id_producto
                             ORDER BY i.es_principal DESC, i.orden, i.id_imagen LIMIT 1)';

/** Lee un número entero mayor a 0 de la URL (por ejemplo, ?categoria=1). Si no vino o no es válido, null. */
function parametro_entero(string $nombre): ?int
{
    $valor = filter_var($_GET[$nombre] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    return is_int($valor) ? $valor : null;
}

/** Lee un precio de la URL (por ejemplo, ?precio_max=60000). Si no vino o no es válido, null. */
function parametro_precio(string $nombre): ?float
{
    $valor = filter_var($_GET[$nombre] ?? null, FILTER_VALIDATE_FLOAT);
    return is_float($valor) && $valor >= 0 ? $valor : null;
}

/** Datos de un producto para las tarjetas del listado y del carrito. */
function producto_para_lista(array $fila): array
{
    return [
        'id_producto' => (int) $fila['id_producto'],
        'nombre'      => $fila['nombre'],
        'categoria'   => $fila['categoria'],
        'precio'      => (float) $fila['precio'],
        'stock'       => (int) $fila['stock'],
        'destacado'   => (bool) $fila['destacado'],
        'imagen'      => $fila['imagen'],
    ];
}

/**
 * GET /api/productos — Productos activos, con búsqueda, filtros, orden y paginación (HU-01 a HU-04).
 * Parámetros: buscar, categoria, material, precio_min, precio_max, con_stock, orden, pagina.
 */
function productos_listar(): void
{
    // Solo los productos activos: los dados de baja no se muestran
    $condiciones = ['p.activo = 1'];
    $parametros = [];

    // Búsqueda por nombre: no distingue mayúsculas ni acentos y encuentra partes del nombre (HU-03)
    $buscar = campo_texto($_GET, 'buscar');
    if ($buscar !== '') {
        $condiciones[] = 'p.nombre LIKE ?';
        $parametros[] = '%' . addcslashes($buscar, '%_\\') . '%'; // % y _ se buscan como texto
    }

    $categoria = parametro_entero('categoria');
    if ($categoria !== null) {
        $condiciones[] = 'p.id_categoria = ?';
        $parametros[] = $categoria;
    }

    $material = parametro_entero('material');
    if ($material !== null) {
        $condiciones[] = 'EXISTS (SELECT 1 FROM producto_material pm WHERE pm.id_producto = p.id_producto AND pm.id_material = ?)';
        $parametros[] = $material;
    }

    $precio_min = parametro_precio('precio_min');
    if ($precio_min !== null) {
        $condiciones[] = 'p.precio >= ?';
        $parametros[] = $precio_min;
    }

    $precio_max = parametro_precio('precio_max');
    if ($precio_max !== null) {
        $condiciones[] = 'p.precio <= ?';
        $parametros[] = $precio_max;
    }

    if (($_GET['con_stock'] ?? '') === '1') {
        $condiciones[] = 'p.stock > 0';
    }

    // Orden: solo se aceptan estos valores (nunca se pone en el SQL lo que manda el usuario)
    $ordenes = [
        'nuevos'      => 'p.fecha_alta DESC, p.id_producto DESC',
        'precio_asc'  => 'p.precio ASC, p.id_producto ASC',
        'precio_desc' => 'p.precio DESC, p.id_producto ASC',
    ];
    $orden = $ordenes[$_GET['orden'] ?? ''] ?? $ordenes['nuevos'];

    $donde = implode(' AND ', $condiciones);

    // Total de resultados, para la paginación
    $consulta = conexion()->prepare("SELECT COUNT(*) FROM productos p WHERE $donde");
    $consulta->execute($parametros);
    $total = (int) $consulta->fetchColumn();

    $total_paginas = max(1, (int) ceil($total / PRODUCTOS_POR_PAGINA));
    $pagina = min(parametro_entero('pagina') ?? 1, $total_paginas);
    $desde = ($pagina - 1) * PRODUCTOS_POR_PAGINA;

    // $desde y PRODUCTOS_POR_PAGINA son enteros calculados acá, por eso se pueden escribir en el SQL
    $consulta = conexion()->prepare(
        "SELECT p.id_producto, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.destacado,
                " . SQL_FOTO_PRINCIPAL . " AS imagen
         FROM productos p
         JOIN categorias c ON c.id_categoria = p.id_categoria
         WHERE $donde
         ORDER BY $orden
         LIMIT " . PRODUCTOS_POR_PAGINA . " OFFSET $desde"
    );
    $consulta->execute($parametros);

    responder_ok([
        'productos'     => array_map('producto_para_lista', $consulta->fetchAll()),
        'pagina'        => $pagina,
        'por_pagina'    => PRODUCTOS_POR_PAGINA,
        'total'         => $total,
        'total_paginas' => $total_paginas,
    ]);
}

/** Hasta 4 productos activos para el inicio. $condicion y $orden son fijos (los escribe el código, nunca el usuario). */
function productos_para_inicio(string $condicion, string $orden): void
{
    $consulta = conexion()->prepare(
        "SELECT p.id_producto, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.destacado,
                " . SQL_FOTO_PRINCIPAL . " AS imagen
         FROM productos p JOIN categorias c ON c.id_categoria = p.id_categoria
         WHERE p.activo = 1 AND $condicion
         ORDER BY $orden
         LIMIT 4"
    );
    $consulta->execute();
    responder_ok(array_map('producto_para_lista', $consulta->fetchAll()));
}

/** GET /api/productos/destacados — Los que el administrador marcó como destacados (HU-06). */
function productos_destacados(): void
{
    productos_para_inicio('p.destacado = 1', 'p.fecha_alta DESC, p.id_producto DESC');
}

/** GET /api/productos/novedades — Los últimos productos cargados (HU-06). */
function productos_novedades(): void
{
    productos_para_inicio('1 = 1', 'p.fecha_alta DESC, p.id_producto DESC');
}

/** GET /api/productos/{id} — Detalle de un producto activo, con sus fotos y materiales (HU-05). */
function productos_detalle(int $id): void
{
    $consulta = conexion()->prepare(
        'SELECT p.id_producto, p.id_categoria, c.nombre AS categoria, p.sku, p.nombre, p.descripcion,
                p.medidas, p.precio, p.stock, p.destacado
         FROM productos p
         JOIN categorias c ON c.id_categoria = p.id_categoria
         WHERE p.id_producto = ? AND p.activo = 1'
    );
    $consulta->execute([$id]);
    $producto = $consulta->fetch();

    if (!$producto) {
        responder_error('Producto no encontrado', 404);
    }

    $consulta = conexion()->prepare(
        'SELECT id_imagen, ruta FROM producto_imagenes WHERE id_producto = ? ORDER BY es_principal DESC, orden, id_imagen'
    );
    $consulta->execute([$id]);
    $imagenes = $consulta->fetchAll();

    $consulta = conexion()->prepare(
        'SELECT m.nombre FROM producto_material pm JOIN materiales m ON m.id_material = pm.id_material
         WHERE pm.id_producto = ? ORDER BY m.nombre'
    );
    $consulta->execute([$id]);
    $materiales = $consulta->fetchAll(PDO::FETCH_COLUMN);

    responder_ok([
        'id_producto'  => (int) $producto['id_producto'],
        'id_categoria' => (int) $producto['id_categoria'],
        'categoria'    => $producto['categoria'],
        'sku'          => $producto['sku'],
        'nombre'       => $producto['nombre'],
        'descripcion'  => $producto['descripcion'],
        'medidas'      => $producto['medidas'],
        'precio'       => (float) $producto['precio'],
        'stock'        => (int) $producto['stock'],
        'destacado'    => (bool) $producto['destacado'],
        'imagenes'     => $imagenes,
        'materiales'   => $materiales,
    ]);
}

/** GET /api/categorias — Categorías activas, para el menú y los filtros (HU-02). */
function categorias_listar(): void
{
    $consulta = conexion()->prepare(
        'SELECT id_categoria, nombre, descripcion FROM categorias WHERE activa = 1 ORDER BY id_categoria'
    );
    $consulta->execute();
    responder_ok($consulta->fetchAll());
}

/** GET /api/materiales — Materiales, para los filtros (HU-04). */
function materiales_listar(): void
{
    $consulta = conexion()->prepare('SELECT id_material, nombre FROM materiales ORDER BY nombre');
    $consulta->execute();
    responder_ok($consulta->fetchAll());
}
