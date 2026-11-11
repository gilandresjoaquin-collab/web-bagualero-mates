<?php
/**
 * Carrito de compras: ver, agregar, cambiar cantidades, quitar y vaciar (HU-11 y HU-12).
 * Se guarda en la base (carrito_items), así no se pierde al cerrar el navegador.
 * Todas las rutas devuelven el carrito completo, para que la página muestre los totales del servidor.
 */

const MENSAJE_CANTIDAD = 'La cantidad tiene que ser un número entero mayor a 0';

/** El carrito de un usuario, con el subtotal de cada producto, el total y la cantidad de productos. */
function carrito_de(int $id_usuario): array
{
    $consulta = conexion()->prepare(
        'SELECT p.id_producto, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.activo,
                ' . SQL_FOTO_PRINCIPAL . ' AS imagen, ci.cantidad
         FROM carrito_items ci
         JOIN productos p ON p.id_producto = ci.id_producto
         JOIN categorias c ON c.id_categoria = p.id_categoria
         WHERE ci.id_usuario = ?
         ORDER BY ci.fecha_agregado, p.id_producto'
    );
    $consulta->execute([$id_usuario]);

    $items = [];
    $total = 0;
    $cantidad_total = 0;
    $hay_problemas = false;

    foreach ($consulta->fetchAll() as $fila) {
        $precio = (float) $fila['precio'];
        $cantidad = (int) $fila['cantidad'];
        $stock = (int) $fila['stock'];
        $activo = (bool) $fila['activo'];
        // Se puede comprar si el producto sigue a la venta y el stock alcanza
        $disponible = $activo && $cantidad <= $stock;

        $items[] = [
            'id_producto' => (int) $fila['id_producto'],
            'nombre'      => $fila['nombre'],
            'categoria'   => $fila['categoria'],
            'imagen'      => $fila['imagen'],
            'precio'      => $precio,
            'cantidad'    => $cantidad,
            'stock'       => $stock,
            'activo'      => $activo,
            'subtotal'    => round($precio * $cantidad, 2),
            'disponible'  => $disponible,
        ];
        $total += $precio * $cantidad;
        $cantidad_total += $cantidad;
        $hay_problemas = $hay_problemas || !$disponible;
    }

    return [
        'items'          => $items,
        'cantidad_total' => $cantidad_total,
        'total'          => round($total, 2),
        'hay_problemas'  => $hay_problemas, // algún producto sin stock suficiente o dado de baja
    ];
}

/** Datos de un producto para controlar el stock, o null si no existe. */
function producto_con_stock(int $id_producto): ?array
{
    $consulta = conexion()->prepare('SELECT id_producto, nombre, stock, activo FROM productos WHERE id_producto = ?');
    $consulta->execute([$id_producto]);
    return $consulta->fetch() ?: null;
}

/** "No hay stock suficiente de: Mate… (disponibles: 1)", el mismo formato que el contrato. */
function mensaje_sin_stock(array $producto): string
{
    if ($producto['stock'] > 0) {
        return "No hay stock suficiente de: {$producto['nombre']} (disponibles: {$producto['stock']})";
    }
    return "No hay stock de: {$producto['nombre']}";
}

/** GET /api/carrito */
function carrito_ver(): void
{
    responder_ok(carrito_de(usuario_actual()['id_usuario']));
}

/** POST /api/carrito — Agrega un producto (si ya estaba, suma la cantidad). Nunca más que el stock (HU-11). */
function carrito_agregar(): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $datos = leer_json();
    $id_producto = entero_positivo($datos, 'id_producto', 'Elegí un producto válido');
    $cantidad = isset($datos['cantidad']) ? entero_positivo($datos, 'cantidad', MENSAJE_CANTIDAD) : 1;

    $producto = producto_con_stock($id_producto);
    if (!$producto || !$producto['activo']) {
        responder_error('Producto no encontrado', 404);
    }

    // Lo que ya había en el carrito más lo nuevo no puede superar el stock
    $consulta = conexion()->prepare('SELECT cantidad FROM carrito_items WHERE id_usuario = ? AND id_producto = ?');
    $consulta->execute([$id_usuario, $id_producto]);
    $en_carrito = (int) $consulta->fetchColumn();
    $nueva_cantidad = $en_carrito + $cantidad;

    if ($nueva_cantidad > $producto['stock']) {
        $mensaje = mensaje_sin_stock($producto);
        if ($en_carrito > 0) {
            $mensaje .= ". Ya tenés $en_carrito en el carrito";
        }
        responder_error($mensaje, 409);
    }

    $consulta = conexion()->prepare(
        'INSERT INTO carrito_items (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)'
    );
    $consulta->execute([$id_usuario, $id_producto, $nueva_cantidad]);

    responder_ok(carrito_de($id_usuario));
}

/** PUT /api/carrito/{id_producto} — Cambia la cantidad de un producto, sin superar el stock (HU-12). */
function carrito_modificar(int $id_producto): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $cantidad = entero_positivo(leer_json(), 'cantidad', MENSAJE_CANTIDAD);

    $consulta = conexion()->prepare('SELECT 1 FROM carrito_items WHERE id_usuario = ? AND id_producto = ?');
    $consulta->execute([$id_usuario, $id_producto]);
    if (!$consulta->fetch()) {
        responder_error('Ese producto no está en tu carrito', 404);
    }

    $producto = producto_con_stock($id_producto);
    if (!$producto['activo']) {
        responder_error("{$producto['nombre']} ya no está a la venta: quitalo del carrito", 409);
    }
    if ($cantidad > $producto['stock']) {
        responder_error(mensaje_sin_stock($producto), 409);
    }

    $consulta = conexion()->prepare('UPDATE carrito_items SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?');
    $consulta->execute([$cantidad, $id_usuario, $id_producto]);

    responder_ok(carrito_de($id_usuario));
}

/** DELETE /api/carrito/{id_producto} — Quita un producto del carrito (HU-12). */
function carrito_quitar(int $id_producto): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $consulta = conexion()->prepare('DELETE FROM carrito_items WHERE id_usuario = ? AND id_producto = ?');
    $consulta->execute([$id_usuario, $id_producto]);

    responder_ok(carrito_de($id_usuario));
}

/** DELETE /api/carrito — Vacía el carrito. */
function carrito_vaciar(): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $consulta = conexion()->prepare('DELETE FROM carrito_items WHERE id_usuario = ?');
    $consulta->execute([$id_usuario]);

    responder_ok(carrito_de($id_usuario));
}
