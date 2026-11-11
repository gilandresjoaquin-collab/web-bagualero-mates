<?php
/**
 * Finalizar la compra: métodos de entrega y de pago, y crear el pedido (HU-13 y HU-14).
 */

/** GET /api/metodos-entrega — Métodos de entrega activos. */
function metodos_entrega_listar(): void
{
    $consulta = conexion()->prepare(
        'SELECT id_metodo_entrega, nombre, descripcion, requiere_direccion
         FROM metodos_entrega WHERE activo = 1 ORDER BY id_metodo_entrega'
    );
    $consulta->execute();

    $metodos = array_map(function (array $metodo): array {
        $metodo['requiere_direccion'] = (bool) $metodo['requiere_direccion'];
        return $metodo;
    }, $consulta->fetchAll());

    responder_ok($metodos);
}

/** GET /api/metodos-pago — Métodos de pago activos. */
function metodos_pago_listar(): void
{
    $consulta = conexion()->prepare(
        'SELECT id_metodo_pago, nombre, instrucciones FROM metodos_pago WHERE activo = 1 ORDER BY id_metodo_pago'
    );
    $consulta->execute();
    responder_ok($consulta->fetchAll());
}

/**
 * POST /api/pedidos — Crea un pedido con lo que hay en el carrito (HU-13 y HU-14).
 * Todo pasa dentro de una transacción: se controla el stock, se guarda el pedido con el
 * precio de cada producto, se descuenta el stock y se vacía el carrito. Si algo falla, no se guarda nada.
 */
function pedidos_crear(): void
{
    $usuario = usuario_actual();
    $id_usuario = $usuario['id_usuario'];
    $datos = leer_json();

    // Método de entrega
    $id_entrega = entero_positivo($datos, 'id_metodo_entrega', 'Elegí cómo querés recibir el pedido');
    $consulta = conexion()->prepare('SELECT nombre, requiere_direccion FROM metodos_entrega WHERE id_metodo_entrega = ? AND activo = 1');
    $consulta->execute([$id_entrega]);
    $entrega = $consulta->fetch();
    if (!$entrega) {
        responder_error('Elegí cómo querés recibir el pedido', 400);
    }

    // Método de pago
    $id_pago = entero_positivo($datos, 'id_metodo_pago', 'Elegí cómo vas a pagar');
    $consulta = conexion()->prepare('SELECT nombre, instrucciones FROM metodos_pago WHERE id_metodo_pago = ? AND activo = 1');
    $consulta->execute([$id_pago]);
    $pago = $consulta->fetch();
    if (!$pago) {
        responder_error('Elegí cómo vas a pagar', 400);
    }

    // La dirección es obligatoria solo para el envío a domicilio
    $direccion = null;
    if ($entrega['requiere_direccion']) {
        $direccion = texto_obligatorio($datos, 'direccion_entrega', 'la dirección de entrega', 255);
    }

    // Teléfono de contacto: si no lo manda, se usa el de la cuenta
    $telefono = campo_texto($datos, 'telefono_contacto') ?: $usuario['telefono'];
    if (mb_strlen($telefono) > 30) {
        responder_error('El teléfono no puede tener más de 30 caracteres', 400);
    }
    validar_telefono($telefono);

    $nota = campo_texto($datos, 'nota_cliente');
    if (mb_strlen($nota) > 255) {
        responder_error('La nota no puede tener más de 255 caracteres', 400);
    }

    $pdo = conexion();
    $pdo->beginTransaction();
    try {
        // Productos del carrito. FOR UPDATE los bloquea hasta terminar: si dos personas compran
        // la última unidad al mismo tiempo, la segunda espera y después ve que ya no hay stock.
        $consulta = $pdo->prepare(
            'SELECT ci.id_producto, ci.cantidad, p.nombre, p.precio, p.stock, p.activo
             FROM carrito_items ci
             JOIN productos p ON p.id_producto = ci.id_producto
             WHERE ci.id_usuario = ?
             FOR UPDATE'
        );
        $consulta->execute([$id_usuario]);
        $items = $consulta->fetchAll();

        if (!$items) {
            $pdo->rollBack();
            responder_error('Tu carrito está vacío', 400);
        }

        // El servidor vuelve a controlar el stock de cada producto (HU-14)
        $faltantes = [];
        foreach ($items as $item) {
            if (!$item['activo']) {
                $faltantes[] = "{$item['nombre']} (ya no está a la venta)";
            } elseif ($item['cantidad'] > $item['stock']) {
                $faltantes[] = "{$item['nombre']} (disponibles: {$item['stock']})";
            }
        }
        if ($faltantes) {
            $pdo->rollBack();
            responder_error('No hay stock suficiente de: ' . implode(', ', $faltantes), 409);
        }

        // El pedido empieza en estado "Pendiente"
        $consulta = $pdo->prepare('SELECT id_estado FROM estados_pedido WHERE nombre = ?');
        $consulta->execute(['Pendiente']);
        $id_pendiente = (int) $consulta->fetchColumn();

        $consulta = $pdo->prepare(
            'INSERT INTO pedidos (id_usuario, id_metodo_entrega, id_metodo_pago, id_estado, direccion_entrega, telefono_contacto, nota_cliente)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $consulta->execute([$id_usuario, $id_entrega, $id_pago, $id_pendiente, $direccion, $telefono, $nota ?: null]);
        $id_pedido = (int) $pdo->lastInsertId();

        // Detalle con el precio de este momento, y descuento del stock
        $guardar_detalle = $pdo->prepare(
            'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)'
        );
        $descontar_stock = $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id_producto = ?');
        $total = 0;

        foreach ($items as $item) {
            $guardar_detalle->execute([$id_pedido, $item['id_producto'], $item['cantidad'], $item['precio']]);
            $descontar_stock->execute([$item['cantidad'], $item['id_producto']]);
            $total += $item['cantidad'] * (float) $item['precio'];
        }

        // Primer registro del historial de estados (HU-20)
        $consulta = $pdo->prepare('INSERT INTO historial_estados (id_pedido, id_estado, comentario) VALUES (?, ?, ?)');
        $consulta->execute([$id_pedido, $id_pendiente, 'Pedido creado por el cliente']);

        // El carrito queda vacío
        $consulta = $pdo->prepare('DELETE FROM carrito_items WHERE id_usuario = ?');
        $consulta->execute([$id_usuario]);

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack(); // si algo falló, no queda nada a medias
        }
        throw $e;
    }

    responder_ok([
        'id_pedido'          => $id_pedido,
        'estado'             => 'Pendiente',
        'total'              => round($total, 2),
        'metodo_entrega'     => $entrega['nombre'],
        'metodo_pago'        => $pago['nombre'],
        'direccion_entrega'  => $direccion,
        'instrucciones_pago' => $pago['instrucciones'],
    ], 201);
}
