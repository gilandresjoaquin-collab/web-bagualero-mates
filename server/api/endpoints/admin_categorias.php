<?php
/**
 * Panel: categorías (HU-19).
 */

/** GET /api/admin/categorias — Todas las categorías, con cuántos productos tiene cada una. */
function admin_categorias_listar(): void
{
    $consulta = conexion()->prepare(
        'SELECT c.id_categoria, c.nombre, c.descripcion, c.activa,
                COUNT(p.id_producto) AS productos, COALESCE(SUM(p.activo), 0) AS productos_activos
         FROM categorias c LEFT JOIN productos p ON p.id_categoria = c.id_categoria
         GROUP BY c.id_categoria, c.nombre, c.descripcion, c.activa
         ORDER BY c.id_categoria'
    );
    $consulta->execute();

    $categorias = array_map(fn(array $fila): array => [
        'id_categoria'      => (int) $fila['id_categoria'],
        'nombre'            => $fila['nombre'],
        'descripcion'       => $fila['descripcion'],
        'activa'            => (bool) $fila['activa'],
        'productos'         => (int) $fila['productos'],
        'productos_activos' => (int) $fila['productos_activos'],
    ], $consulta->fetchAll());

    responder_ok($categorias);
}

/** Lee el nombre y la descripción, y guarda. Si el nombre ya existe, responde 409 (HU-19). */
function guardar_categoria(string $sql, array $datos, array $extra = []): void
{
    $nombre = texto_obligatorio($datos, 'nombre', 'el nombre', 60);
    $descripcion = campo_texto($datos, 'descripcion');
    if (mb_strlen($descripcion) > 255) {
        responder_error('La descripción no puede tener más de 255 caracteres', 400);
    }

    try {
        conexion()->prepare($sql)->execute(array_merge([$nombre, $descripcion ?: null], $extra));
    } catch (PDOException $e) {
        if ($e->errorInfo[1] === 1062) { // el nombre es UNIQUE en la base (sin distinguir mayúsculas)
            responder_error('Ya existe una categoría con ese nombre', 409);
        }
        throw $e;
    }
}

/** POST /api/admin/categorias — Crea una categoría. */
function admin_categorias_crear(): void
{
    guardar_categoria('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', leer_json());
    responder_ok(['id_categoria' => (int) conexion()->lastInsertId()], 201);
}

/** PUT /api/admin/categorias/{id} — Edita el nombre y la descripción. */
function admin_categorias_editar(int $id): void
{
    $consulta = conexion()->prepare('SELECT 1 FROM categorias WHERE id_categoria = ?');
    $consulta->execute([$id]);
    if (!$consulta->fetch()) {
        responder_error('Categoría no encontrada', 404);
    }

    guardar_categoria('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?', leer_json(), [$id]);
    responder_ok(['id_categoria' => $id]);
}

/**
 * PATCH /api/admin/categorias/{id}/estado — Activa o desactiva: { "activa": false }.
 * No se puede desactivar una categoría que todavía tiene productos activos (HU-19).
 */
function admin_categorias_estado(int $id): void
{
    $activa = filter_var(leer_json()['activa'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($activa === null) {
        responder_error('Indicá si la categoría queda activa (true) o no (false)', 400);
    }

    $consulta = conexion()->prepare(
        'SELECT c.nombre, COALESCE(SUM(p.activo), 0) AS activos
         FROM categorias c LEFT JOIN productos p ON p.id_categoria = c.id_categoria
         WHERE c.id_categoria = ? GROUP BY c.id_categoria, c.nombre'
    );
    $consulta->execute([$id]);
    $categoria = $consulta->fetch();
    if (!$categoria) {
        responder_error('Categoría no encontrada', 404);
    }

    $activos = (int) $categoria['activos'];
    if (!$activa && $activos > 0) {
        $productos = $activos === 1 ? '1 producto activo' : "$activos productos activos";
        responder_error("No se puede desactivar «{$categoria['nombre']}»: todavía tiene $productos", 409);
    }

    conexion()->prepare('UPDATE categorias SET activa = ? WHERE id_categoria = ?')->execute([(int) $activa, $id]);
    responder_ok(['id_categoria' => $id, 'activa' => $activa]);
}
