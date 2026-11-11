<?php
/**
 * Panel: resumen del panel de control (HU-22) y usuarios (HU-21).
 */

/** GET /api/admin/dashboard — Pendientes, ventas del mes, poco stock y últimos pedidos (HU-22). */
function admin_dashboard(): void
{
    $numero = function (string $sql): float {
        $consulta = conexion()->prepare($sql);
        $consulta->execute();
        return (float) $consulta->fetchColumn();
    };

    $pendientes = $numero(
        "SELECT COUNT(*) FROM pedidos p JOIN estados_pedido e ON e.id_estado = p.id_estado WHERE e.nombre = 'Pendiente'"
    );
    // Total vendido en el mes, sin contar los cancelados
    $ventas_mes = $numero(
        "SELECT COALESCE(SUM(t.total), 0)
         FROM pedidos p
         JOIN v_pedidos_totales t ON t.id_pedido = p.id_pedido
         JOIN estados_pedido e ON e.id_estado = p.id_estado
         WHERE e.nombre <> 'Cancelado' AND p.fecha_pedido >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"
    );
    $productos_activos = $numero('SELECT COUNT(*) FROM productos WHERE activo = 1');

    // Productos activos con 3 unidades o menos
    $consulta = conexion()->prepare(
        'SELECT p.id_producto, p.nombre, p.stock, ' . SQL_FOTO_PRINCIPAL . ' AS imagen
         FROM productos p WHERE p.activo = 1 AND p.stock <= 3 ORDER BY p.stock, p.nombre'
    );
    $consulta->execute();
    $poco_stock = array_map(fn(array $fila): array => [
        'id_producto' => (int) $fila['id_producto'],
        'nombre'      => $fila['nombre'],
        'stock'       => (int) $fila['stock'],
        'imagen'      => $fila['imagen'],
    ], $consulta->fetchAll());

    $consulta = conexion()->prepare(SQL_LISTA_PEDIDOS . ' ORDER BY p.fecha_pedido DESC, p.id_pedido DESC LIMIT 5');
    $consulta->execute();

    responder_ok([
        'pedidos_pendientes' => (int) $pendientes,
        'ventas_mes'         => round($ventas_mes, 2),
        'productos_activos'  => (int) $productos_activos,
        'poco_stock'         => $poco_stock,
        'ultimos_pedidos'    => array_map('pedido_para_lista', $consulta->fetchAll()),
    ]);
}

/** GET /api/admin/usuarios — Usuarios, con búsqueda por nombre o correo (?buscar=) (HU-21). */
function admin_usuarios_listar(): void
{
    $sql = 'SELECT id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro FROM usuarios';
    $parametros = [];

    $buscar = campo_texto($_GET, 'buscar');
    if ($buscar !== '') {
        $sql .= " WHERE CONCAT(nombre, ' ', apellido) LIKE ? OR email LIKE ?";
        $patron = '%' . addcslashes($buscar, '%_\\') . '%';
        $parametros = [$patron, $patron];
    }

    $consulta = conexion()->prepare($sql . ' ORDER BY fecha_registro DESC, id_usuario DESC');
    $consulta->execute($parametros);

    $usuarios = array_map(function (array $fila): array {
        $fila['id_usuario'] = (int) $fila['id_usuario'];
        return $fila;
    }, $consulta->fetchAll());

    responder_ok($usuarios);
}

/**
 * PATCH /api/admin/usuarios/{id}/estado — Suspende o reactiva una cuenta: { "estado": "suspendido" } (HU-21).
 * El administrador no puede suspender su propia cuenta.
 */
function admin_usuarios_estado(int $id): void
{
    $estado = campo_texto(leer_json(), 'estado');
    if (!in_array($estado, ['activo', 'suspendido'], true)) {
        responder_error('El estado tiene que ser "activo" o "suspendido"', 400);
    }
    if ($id === usuario_actual()['id_usuario'] && $estado === 'suspendido') {
        responder_error('No podés suspender tu propia cuenta', 400);
    }

    $consulta = conexion()->prepare('UPDATE usuarios SET estado = ? WHERE id_usuario = ?');
    $consulta->execute([$estado, $id]);

    $consulta = conexion()->prepare('SELECT 1 FROM usuarios WHERE id_usuario = ?');
    $consulta->execute([$id]);
    if (!$consulta->fetch()) {
        responder_error('Usuario no encontrado', 404);
    }

    responder_ok(['id_usuario' => $id, 'estado' => $estado]);
}
