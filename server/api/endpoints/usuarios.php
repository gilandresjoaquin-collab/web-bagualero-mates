<?php
/**
 * Mi cuenta: datos del perfil, contraseña y direcciones de entrega (HU-10).
 */

/** PUT /api/usuarios/perfil — Cambia nombre, apellido y teléfono. El correo no se puede cambiar. */
function usuarios_perfil(): void
{
    $datos = leer_json();
    $nombre = texto_obligatorio($datos, 'nombre', 'el nombre', 60);
    $apellido = texto_obligatorio($datos, 'apellido', 'el apellido', 60);
    $telefono = texto_obligatorio($datos, 'telefono', 'el teléfono', 30);
    validar_telefono($telefono);

    $id_usuario = usuario_actual()['id_usuario'];
    conexion()->prepare('UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id_usuario = ?')
        ->execute([$nombre, $apellido, $telefono, $id_usuario]);

    responder_ok(['nombre' => $nombre, 'apellido' => $apellido, 'telefono' => $telefono]);
}

/** PUT /api/usuarios/password — Cambia la contraseña: { "actual": "…", "nueva": "…" }. Pide la actual (HU-10). */
function usuarios_password(): void
{
    $datos = leer_json();
    $actual = campo_password($datos, 'actual');
    $nueva = campo_password($datos, 'nueva');

    if ($actual === '') {
        responder_error('Completá tu contraseña actual', 400);
    }
    validar_password($nueva);

    $id_usuario = usuario_actual()['id_usuario'];
    $consulta = conexion()->prepare('SELECT password_hash FROM usuarios WHERE id_usuario = ?');
    $consulta->execute([$id_usuario]);
    if (!password_verify($actual, $consulta->fetchColumn())) {
        responder_error('La contraseña actual no es correcta', 400);
    }

    conexion()->prepare('UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?')
        ->execute([password_hash($nueva, PASSWORD_DEFAULT), $id_usuario]);
    responder_ok(['mensaje' => 'Contraseña actualizada']);
}

/** Las direcciones del usuario, la principal primero. */
function direcciones_de(int $id_usuario): array
{
    $consulta = conexion()->prepare(
        'SELECT id_direccion, calle, numero, barrio, ciudad, referencias, es_principal
         FROM direcciones WHERE id_usuario = ? ORDER BY es_principal DESC, id_direccion'
    );
    $consulta->execute([$id_usuario]);
    return array_map(function (array $direccion): array {
        $direccion['id_direccion'] = (int) $direccion['id_direccion'];
        $direccion['es_principal'] = (bool) $direccion['es_principal'];
        return $direccion;
    }, $consulta->fetchAll());
}

/** Lee y valida los datos de una dirección. */
function datos_direccion(array $datos): array
{
    $direccion = [
        'calle'       => texto_obligatorio($datos, 'calle', 'la calle', 100),
        'numero'      => texto_obligatorio($datos, 'numero', 'el número', 10),
        'barrio'      => campo_texto($datos, 'barrio'),
        'ciudad'      => campo_texto($datos, 'ciudad') ?: 'Mar del Plata',
        'referencias' => campo_texto($datos, 'referencias'),
    ];
    if (mb_strlen($direccion['barrio']) > 60) {
        responder_error('El barrio no puede tener más de 60 caracteres', 400);
    }
    if (mb_strlen($direccion['ciudad']) > 60) {
        responder_error('La ciudad no puede tener más de 60 caracteres', 400);
    }
    if (mb_strlen($direccion['referencias']) > 150) {
        responder_error('Las referencias no pueden tener más de 150 caracteres', 400);
    }
    return $direccion;
}

/** Responde 404 si la dirección no existe o es de otro usuario. */
function exigir_direccion_propia(int $id_direccion, int $id_usuario): array
{
    $consulta = conexion()->prepare('SELECT id_direccion, es_principal FROM direcciones WHERE id_direccion = ? AND id_usuario = ?');
    $consulta->execute([$id_direccion, $id_usuario]);
    $direccion = $consulta->fetch();
    if (!$direccion) {
        responder_error('Dirección no encontrada', 404);
    }
    return $direccion;
}

/** GET /api/usuarios/direcciones */
function direcciones_listar(): void
{
    responder_ok(direcciones_de(usuario_actual()['id_usuario']));
}

/** POST /api/usuarios/direcciones — Agrega una dirección. La primera queda como principal. */
function direcciones_crear(): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $direccion = datos_direccion(leer_json());
    $esPrimera = count(direcciones_de($id_usuario)) === 0;

    conexion()->prepare(
        'INSERT INTO direcciones (id_usuario, calle, numero, barrio, ciudad, referencias, es_principal) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id_usuario, $direccion['calle'], $direccion['numero'], $direccion['barrio'] ?: null,
        $direccion['ciudad'], $direccion['referencias'] ?: null, (int) $esPrimera,
    ]);

    responder_ok(direcciones_de($id_usuario), 201);
}

/** PUT /api/usuarios/direcciones/{id} — Edita una dirección propia. */
function direcciones_editar(int $id): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    exigir_direccion_propia($id, $id_usuario);
    $direccion = datos_direccion(leer_json());

    conexion()->prepare(
        'UPDATE direcciones SET calle = ?, numero = ?, barrio = ?, ciudad = ?, referencias = ? WHERE id_direccion = ?'
    )->execute([
        $direccion['calle'], $direccion['numero'], $direccion['barrio'] ?: null,
        $direccion['ciudad'], $direccion['referencias'] ?: null, $id,
    ]);

    responder_ok(direcciones_de($id_usuario));
}

/** DELETE /api/usuarios/direcciones/{id} — Borra una dirección propia. */
function direcciones_borrar(int $id): void
{
    $id_usuario = usuario_actual()['id_usuario'];
    $direccion = exigir_direccion_propia($id, $id_usuario);

    conexion()->prepare('DELETE FROM direcciones WHERE id_direccion = ?')->execute([$id]);
    // Si era la principal, pasa a serlo otra
    if ($direccion['es_principal']) {
        conexion()->prepare('UPDATE direcciones SET es_principal = 1 WHERE id_usuario = ? ORDER BY id_direccion LIMIT 1')
            ->execute([$id_usuario]);
    }
    responder_ok(direcciones_de($id_usuario));
}
