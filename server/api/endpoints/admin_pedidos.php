<?php
/**
 * Panel: pedidos y cambio de estado (HU-20 y HU-14).
 */

// Columnas de la lista de pedidos (panel de control y página de pedidos)
const SQL_LISTA_PEDIDOS = "SELECT p.id_pedido, p.fecha_pedido, TRIM(CONCAT(u.nombre, ' ', u.apellido)) AS cliente, u.email,
                                  e.nombre AS estado, me.nombre AS metodo_entrega, mp.nombre AS metodo_pago, t.total
                           FROM pedidos p
                           JOIN usuarios u          ON u.id_usuario = p.id_usuario
                           JOIN estados_pedido e    ON e.id_estado = p.id_estado
                           JOIN metodos_entrega me  ON me.id_metodo_entrega = p.id_metodo_entrega
                           JOIN metodos_pago mp     ON mp.id_metodo_pago = p.id_metodo_pago
                           JOIN v_pedidos_totales t ON t.id_pedido = p.id_pedido";

function pedido_para_lista(array $fila): array
{
    $fila['id_pedido'] = (int) $fila['id_pedido'];
    $fila['total'] = (float) $fila['total'];
    return $fila;
}

/** Lee una fecha AAAA-MM-DD de la URL. Si no vino o no es válida, null. */
function parametro_fecha(string $nombre): ?string
{
    $valor = $_GET[$nombre] ?? '';
    $fecha = is_string($valor) ? DateTime::createFromFormat('!Y-m-d', $valor) : false;
    return $fecha && $fecha->format('Y-m-d') === $valor ? $valor : null;
}

/** GET /api/admin/estados-pedido — Los estados posibles, en orden. */
function admin_estados_listar(): void
{
    $consulta = conexion()->prepare('SELECT id_estado, nombre FROM estados_pedido ORDER BY orden');
    $consulta->execute();
    responder_ok($consulta->fetchAll());
}

/** GET /api/admin/pedidos — Pedidos, del más nuevo al más viejo. Filtros: estado, desde, hasta (HU-20). */
function admin_pedidos_listar(): void
{
    $condiciones = ['1 = 1'];
    $parametros = [];

    $estado = parametro_entero('estado');
    if ($estado !== null) {
        $condiciones[] = 'p.id_estado = ?';
        $parametros[] = $estado;
    }
    $desde = parametro_fecha('desde');
    if ($desde !== null) {
        $condiciones[] = 'p.fecha_pedido >= ?';
        $parametros[] = "$desde 00:00:00";
    }
    $hasta = parametro_fecha('hasta');
    if ($hasta !== null) {
        $condiciones[] = 'p.fecha_pedido < DATE_ADD(?, INTERVAL 1 DAY)'; // incluye todo el día "hasta"
        $parametros[] = $hasta;
    }

    $consulta = conexion()->prepare(
        SQL_LISTA_PEDIDOS . ' WHERE ' . implode(' AND ', $condiciones) . ' ORDER BY p.fecha_pedido DESC, p.id_pedido DESC LIMIT 200'
    );
    $consulta->execute($parametros);
    responder_ok(array_map('pedido_para_lista', $consulta->fetchAll()));
}

/** GET /api/admin/pedidos/{id} — Detalle de un pedido, con los datos del cliente e historial (HU-20). */
function admin_pedidos_detalle(int $id): void
{
    $pedido = pedido_completo($id);
    if (!$pedido) {
        responder_error('Pedido no encontrado', 404);
    }
    responder_ok($pedido);
}

/**
 * PATCH /api/admin/pedidos/{id}/estado — Cambia el estado: { "id_estado": 2, "comentario": "…" }.
 * Cada cambio queda en el historial con su fecha (HU-20). Si se cancela, se repone el stock (HU-14).
 */
function admin_pedidos_estado(int $id): void
{
    $datos = leer_json();
    $id_estado = entero_positivo($datos, 'id_estado', 'Elegí un estado');
    $comentario = campo_texto($datos, 'comentario');
    if (mb_strlen($comentario) > 255) {
        responder_error('El comentario no puede tener más de 255 caracteres', 400);
    }

    $consulta = conexion()->prepare('SELECT nombre FROM estados_pedido WHERE id_estado = ?');
    $consulta->execute([$id_estado]);
    $nuevo = $consulta->fetchColumn();
    if ($nuevo === false) {
        responder_error('Elegí un estado válido', 400);
    }

    $pdo = conexion();
    $pdo->beginTransaction();
    try {
        // Se bloquea el pedido hasta terminar, para que no lo cambien dos personas a la vez
        $consulta = $pdo->prepare(
            'SELECT p.id_estado, e.nombre FROM pedidos p JOIN estados_pedido e ON e.id_estado = p.id_estado
             WHERE p.id_pedido = ? FOR UPDATE'
        );
        $consulta->execute([$id]);
        $actual = $consulta->fetch();

        if (!$actual) {
            $pdo->rollBack();
            responder_error('Pedido no encontrado', 404);
        }
        if ((int) $actual['id_estado'] === $id_estado) {
            $pdo->rollBack();
            responder_error("El pedido ya está en «{$nuevo}»", 409);
        }
        // Un pedido cancelado ya repuso su stock: no puede volver a otro estado
        if ($actual['nombre'] === 'Cancelado') {
            $pdo->rollBack();
            responder_error('Un pedido cancelado no se puede cambiar de estado', 409);
        }

        $pdo->prepare('UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?')->execute([$id_estado, $id]);
        $pdo->prepare('INSERT INTO historial_estados (id_pedido, id_estado, comentario) VALUES (?, ?, ?)')
            ->execute([$id, $id_estado, $comentario ?: null]);

        // Si se cancela, vuelve al stock lo que se había descontado (HU-14)
        if ($nuevo === 'Cancelado') {
            $pdo->prepare(
                'UPDATE productos p JOIN detalle_pedido d ON d.id_producto = p.id_producto
                 SET p.stock = p.stock + d.cantidad
                 WHERE d.id_pedido = ?'
            )->execute([$id]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    responder_ok(pedido_completo($id));
}
