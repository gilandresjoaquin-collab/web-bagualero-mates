<?php
/**
 * Panel: productos y sus fotos (HU-17 y HU-18).
 * Los productos nunca se borran: la baja es lógica (activo = 0).
 */

// Las fotos se guardan en server/uploads/ y en la base queda solo el nombre del archivo
const CARPETA_FOTOS = __DIR__ . '/../../uploads/';
const TIPOS_DE_FOTO = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
const TAMANIO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

/** Fotos de un producto, la principal primero. */
function fotos_de(int $id_producto): array
{
    $consulta = conexion()->prepare(
        'SELECT id_imagen, ruta, es_principal FROM producto_imagenes WHERE id_producto = ?
         ORDER BY es_principal DESC, orden, id_imagen'
    );
    $consulta->execute([$id_producto]);
    return array_map(function (array $foto): array {
        $foto['id_imagen'] = (int) $foto['id_imagen'];
        $foto['es_principal'] = (bool) $foto['es_principal'];
        return $foto;
    }, $consulta->fetchAll());
}

/** Responde 404 si el producto no existe (esté activo o no). */
function exigir_producto(int $id_producto): array
{
    $consulta = conexion()->prepare('SELECT id_producto, nombre, id_categoria, activo FROM productos WHERE id_producto = ?');
    $consulta->execute([$id_producto]);
    $producto = $consulta->fetch();
    if (!$producto) {
        responder_error('Producto no encontrado', 404);
    }
    return $producto;
}

/** true si la categoría existe y está activa; responde 400 si no existe. */
function categoria_activa(int $id_categoria): bool
{
    $consulta = conexion()->prepare('SELECT activa FROM categorias WHERE id_categoria = ?');
    $consulta->execute([$id_categoria]);
    $activa = $consulta->fetchColumn();
    if ($activa === false) {
        responder_error('Elegí una categoría', 400);
    }
    return (bool) $activa;
}

/** Lee y valida los datos del formulario de producto (HU-17). */
function datos_producto(array $datos): array
{
    $producto = [
        'nombre'       => texto_obligatorio($datos, 'nombre', 'el nombre', 120),
        'id_categoria' => entero_positivo($datos, 'id_categoria', 'Elegí una categoría'),
        'descripcion'  => campo_texto($datos, 'descripcion'),
        'medidas'      => campo_texto($datos, 'medidas'),
        'sku'          => mb_strtoupper(campo_texto($datos, 'sku')),
        'destacado'    => filter_var($datos['destacado'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'activo'       => filter_var($datos['activo'] ?? true, FILTER_VALIDATE_BOOLEAN),
    ];

    // Precio mayor a 0 y stock no negativo (HU-17)
    $precio = filter_var($datos['precio'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($precio === false || $precio <= 0 || $precio > 99999999) {
        responder_error('El precio tiene que ser mayor a 0', 400);
    }
    $stock = filter_var($datos['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1000000]]);
    if ($stock === false) {
        responder_error('El stock tiene que ser un número entero, 0 o más', 400);
    }
    $producto['precio'] = round($precio, 2);
    $producto['stock'] = $stock;

    if (mb_strlen($producto['descripcion']) > 2000) {
        responder_error('La descripción no puede tener más de 2000 caracteres', 400);
    }
    if (mb_strlen($producto['medidas']) > 80) {
        responder_error('Las medidas no pueden tener más de 80 caracteres', 400);
    }
    if (mb_strlen($producto['sku']) > 30) {
        responder_error('El SKU no puede tener más de 30 caracteres', 400);
    }
    if ($producto['sku'] === '') {
        $producto['sku'] = 'BM-' . strtoupper(bin2hex(random_bytes(3))); // si no se escribe, se genera uno
    }

    // Un producto activo no puede estar en una categoría desactivada
    if (!categoria_activa($producto['id_categoria']) && $producto['activo']) {
        responder_error('La categoría elegida está desactivada: elegí otra o activala primero', 400);
    }

    // Materiales: lista de ids que existan
    $materiales = is_array($datos['materiales'] ?? null) ? $datos['materiales'] : [];
    $materiales = array_values(array_unique(array_filter(array_map('intval', $materiales), fn($id) => $id > 0)));
    if ($materiales) {
        $marcas = implode(',', array_fill(0, count($materiales), '?'));
        $consulta = conexion()->prepare("SELECT COUNT(*) FROM materiales WHERE id_material IN ($marcas)");
        $consulta->execute($materiales);
        if ((int) $consulta->fetchColumn() !== count($materiales)) {
            responder_error('Alguno de los materiales elegidos no existe', 400);
        }
    }
    $producto['materiales'] = $materiales;

    return $producto;
}

/** Guarda el producto (INSERT o UPDATE). Si el SKU ya existe, responde 409 (HU-17). */
function ejecutar_guardado(PDOStatement $consulta, array $valores): void
{
    try {
        $consulta->execute($valores);
    } catch (PDOException $e) {
        if ($e->errorInfo[1] === 1062) { // el SKU es UNIQUE en la base
            conexion()->rollBack();
            responder_error('Ya existe un producto con ese SKU', 409);
        }
        throw $e;
    }
}

/** Reemplaza los materiales de un producto. */
function guardar_materiales(int $id_producto, array $materiales): void
{
    conexion()->prepare('DELETE FROM producto_material WHERE id_producto = ?')->execute([$id_producto]);
    $insertar = conexion()->prepare('INSERT INTO producto_material (id_producto, id_material) VALUES (?, ?)');
    foreach ($materiales as $id_material) {
        $insertar->execute([$id_producto, $id_material]);
    }
}

/**
 * GET /api/admin/productos — Todos los productos, también los dados de baja (HU-18).
 * Parámetros: buscar (nombre o SKU), categoria, estado (activos o inactivos).
 */
function admin_productos_listar(): void
{
    $condiciones = ['1 = 1'];
    $parametros = [];

    $buscar = campo_texto($_GET, 'buscar');
    if ($buscar !== '') {
        $condiciones[] = '(p.nombre LIKE ? OR p.sku LIKE ?)';
        $patron = '%' . addcslashes($buscar, '%_\\') . '%';
        array_push($parametros, $patron, $patron);
    }
    $categoria = parametro_entero('categoria');
    if ($categoria !== null) {
        $condiciones[] = 'p.id_categoria = ?';
        $parametros[] = $categoria;
    }
    $estado = $_GET['estado'] ?? '';
    if ($estado === 'activos') {
        $condiciones[] = 'p.activo = 1';
    } elseif ($estado === 'inactivos') {
        $condiciones[] = 'p.activo = 0';
    }

    $donde = implode(' AND ', $condiciones);
    $consulta = conexion()->prepare(
        "SELECT p.id_producto, p.sku, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.destacado, p.activo,
                " . SQL_FOTO_PRINCIPAL . " AS imagen
         FROM productos p JOIN categorias c ON c.id_categoria = p.id_categoria
         WHERE $donde
         ORDER BY p.activo DESC, p.nombre"
    );
    $consulta->execute($parametros);
    $productos = array_map(function (array $fila): array {
        $producto = producto_para_lista($fila);
        $producto['sku'] = $fila['sku'];
        $producto['activo'] = (bool) $fila['activo'];
        return $producto;
    }, $consulta->fetchAll());

    // Totales de todo el catálogo, para el encabezado de la página
    $consulta = conexion()->prepare('SELECT COUNT(*) AS total, COALESCE(SUM(activo = 0), 0) AS dados_de_baja FROM productos');
    $consulta->execute();
    $totales = $consulta->fetch();

    responder_ok([
        'productos'     => $productos,
        'total'         => (int) $totales['total'],
        'dados_de_baja' => (int) $totales['dados_de_baja'],
    ]);
}

/** GET /api/admin/productos/{id} — Un producto para editarlo, aunque esté dado de baja. */
function admin_productos_detalle(int $id): void
{
    $consulta = conexion()->prepare(
        'SELECT id_producto, id_categoria, sku, nombre, descripcion, medidas, precio, stock, destacado, activo
         FROM productos WHERE id_producto = ?'
    );
    $consulta->execute([$id]);
    $producto = $consulta->fetch();
    if (!$producto) {
        responder_error('Producto no encontrado', 404);
    }

    $consulta = conexion()->prepare('SELECT id_material FROM producto_material WHERE id_producto = ?');
    $consulta->execute([$id]);

    $producto['precio'] = (float) $producto['precio'];
    $producto['destacado'] = (bool) $producto['destacado'];
    $producto['activo'] = (bool) $producto['activo'];
    $producto['materiales'] = array_map('intval', $consulta->fetchAll(PDO::FETCH_COLUMN));
    $producto['imagenes'] = fotos_de($id);
    responder_ok($producto);
}

/** POST /api/admin/productos — Crea un producto (HU-17). Las fotos se suben después. */
function admin_productos_crear(): void
{
    $producto = datos_producto(leer_json());

    $pdo = conexion();
    $pdo->beginTransaction();
    ejecutar_guardado($pdo->prepare(
        'INSERT INTO productos (id_categoria, sku, nombre, descripcion, medidas, precio, stock, destacado, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ), [
        $producto['id_categoria'], $producto['sku'], $producto['nombre'], $producto['descripcion'] ?: null,
        $producto['medidas'] ?: null, $producto['precio'], $producto['stock'], (int) $producto['destacado'], (int) $producto['activo'],
    ]);
    $id = (int) $pdo->lastInsertId();
    guardar_materiales($id, $producto['materiales']);
    $pdo->commit();

    responder_ok(['id_producto' => $id, 'sku' => $producto['sku']], 201);
}

/** PUT /api/admin/productos/{id} — Edita todos los datos de un producto (HU-18). */
function admin_productos_editar(int $id): void
{
    exigir_producto($id);
    $producto = datos_producto(leer_json());

    $pdo = conexion();
    $pdo->beginTransaction();
    ejecutar_guardado($pdo->prepare(
        'UPDATE productos SET id_categoria = ?, sku = ?, nombre = ?, descripcion = ?, medidas = ?, precio = ?,
                              stock = ?, destacado = ?, activo = ?
         WHERE id_producto = ?'
    ), [
        $producto['id_categoria'], $producto['sku'], $producto['nombre'], $producto['descripcion'] ?: null,
        $producto['medidas'] ?: null, $producto['precio'], $producto['stock'], (int) $producto['destacado'],
        (int) $producto['activo'], $id,
    ]);
    guardar_materiales($id, $producto['materiales']);
    $pdo->commit();

    responder_ok(['id_producto' => $id, 'sku' => $producto['sku']]);
}

/** PATCH /api/admin/productos/{id}/estado — Da de baja o reactiva un producto: { "activo": false } (HU-18). */
function admin_productos_estado(int $id): void
{
    $activo = filter_var(leer_json()['activo'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($activo === null) {
        responder_error('Indicá si el producto queda activo (true) o dado de baja (false)', 400);
    }

    $producto = exigir_producto($id);
    if ($activo && !categoria_activa((int) $producto['id_categoria'])) {
        responder_error('La categoría de este producto está desactivada: activala primero', 409);
    }

    conexion()->prepare('UPDATE productos SET activo = ? WHERE id_producto = ?')->execute([(int) $activo, $id]);
    responder_ok(['id_producto' => $id, 'activo' => $activo]);
}

/** Los archivos que llegaron en un campo (uno o varios: name="imagenes[]"). */
function archivos_subidos(string $campo): array
{
    $archivos = $_FILES[$campo] ?? null;
    if (!$archivos) {
        return [];
    }
    if (!is_array($archivos['name'])) {
        return $archivos['error'] === UPLOAD_ERR_NO_FILE ? [] : [$archivos];
    }

    $lista = [];
    foreach ($archivos['name'] as $numero => $nombre) {
        if ($archivos['error'][$numero] !== UPLOAD_ERR_NO_FILE) {
            $lista[] = [
                'name'     => $nombre,
                'tmp_name' => $archivos['tmp_name'][$numero],
                'size'     => $archivos['size'][$numero],
                'error'    => $archivos['error'][$numero],
            ];
        }
    }
    return $lista;
}

/**
 * POST /api/admin/productos/{id}/imagenes — Sube fotos en el campo "imagenes[]" (multipart/form-data).
 * Solo JPG, PNG o WEBP de hasta 2 MB cada una (HU-17). Si alguna no sirve, no se guarda ninguna.
 */
function admin_productos_subir_imagenes(int $id): void
{
    exigir_producto($id);
    $archivos = archivos_subidos('imagenes');
    if (!$archivos) {
        responder_error('Elegí al menos una foto', 400);
    }

    // 1. Se controlan todas antes de guardar
    $fotos = [];
    foreach ($archivos as $archivo) {
        $nombre = $archivo['name'];
        $muyGrande = in_array($archivo['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            || $archivo['size'] > TAMANIO_MAXIMO_FOTO;
        if ($muyGrande) {
            responder_error("«{$nombre}» pesa más de 2 MB", 400);
        }
        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            responder_error("No se pudo subir «{$nombre}»", 400);
        }
        // El tipo se mira en el contenido del archivo, no en su nombre
        $informacion = @getimagesize($archivo['tmp_name']); // false si no es una imagen
        $tipo = $informacion ? $informacion[2] : null;
        if ($tipo === null || !isset(TIPOS_DE_FOTO[$tipo])) {
            responder_error("«{$nombre}» no es una foto JPG, PNG o WEBP", 400);
        }
        $fotos[] = ['temporal' => $archivo['tmp_name'], 'extension' => TIPOS_DE_FOTO[$tipo]];
    }

    // 2. Se guardan con un nombre nuevo, que no depende de lo que mandó el usuario
    $consulta = conexion()->prepare('SELECT COALESCE(MAX(orden), 0), COUNT(*) FROM producto_imagenes WHERE id_producto = ?');
    $consulta->execute([$id]);
    [$orden, $cantidad] = array_map('intval', $consulta->fetch(PDO::FETCH_NUM));

    $insertar = conexion()->prepare('INSERT INTO producto_imagenes (id_producto, ruta, orden, es_principal) VALUES (?, ?, ?, ?)');
    foreach ($fotos as $numero => $foto) {
        $archivo = "producto-$id-" . bin2hex(random_bytes(8)) . '.' . $foto['extension'];
        if (!move_uploaded_file($foto['temporal'], CARPETA_FOTOS . $archivo)) {
            throw new RuntimeException('No se pudo guardar la foto en server/uploads/');
        }
        $orden = min($orden + 1, 255);
        $esPrincipal = $cantidad === 0 && $numero === 0; // la primera foto del producto es la principal
        $insertar->execute([$id, $archivo, $orden, (int) $esPrincipal]);
    }

    responder_ok(fotos_de($id), 201);
}

/** PATCH /api/admin/productos/{id}/imagenes/{id_imagen} — La marca como foto principal. */
function admin_productos_imagen_principal(int $id, int $id_imagen): void
{
    $consulta = conexion()->prepare('SELECT 1 FROM producto_imagenes WHERE id_imagen = ? AND id_producto = ?');
    $consulta->execute([$id_imagen, $id]);
    if (!$consulta->fetch()) {
        responder_error('Foto no encontrada', 404);
    }
    conexion()->prepare('UPDATE producto_imagenes SET es_principal = (id_imagen = ?) WHERE id_producto = ?')
        ->execute([$id_imagen, $id]);
    responder_ok(fotos_de($id));
}

/** DELETE /api/admin/productos/{id}/imagenes/{id_imagen} — Borra una foto (HU-18). */
function admin_productos_borrar_imagen(int $id, int $id_imagen): void
{
    $consulta = conexion()->prepare('SELECT ruta, es_principal FROM producto_imagenes WHERE id_imagen = ? AND id_producto = ?');
    $consulta->execute([$id_imagen, $id]);
    $foto = $consulta->fetch();
    if (!$foto) {
        responder_error('Foto no encontrada', 404);
    }

    conexion()->prepare('DELETE FROM producto_imagenes WHERE id_imagen = ?')->execute([$id_imagen]);
    $archivo = CARPETA_FOTOS . basename($foto['ruta']); // basename: nunca se borra nada fuera de uploads/
    if (is_file($archivo)) {
        unlink($archivo);
    }

    // Si era la principal, pasa a serlo la siguiente
    if ($foto['es_principal']) {
        conexion()->prepare('UPDATE producto_imagenes SET es_principal = 1 WHERE id_producto = ? ORDER BY orden, id_imagen LIMIT 1')
            ->execute([$id]);
    }
    responder_ok(fotos_de($id));
}
