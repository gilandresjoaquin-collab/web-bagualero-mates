<?php
/**
 * Autenticación: registro, inicio y cierre de sesión y datos del usuario actual.
 * HU-07, HU-08, HU-09 y HU-21.
 */

/** POST /api/auth/register — Crea una cuenta con rol cliente y deja la sesión iniciada (HU-07). */
function auth_registro(): void
{
    $datos = leer_json();

    $nombre   = texto_obligatorio($datos, 'nombre', 'el nombre', 60);
    $apellido = texto_obligatorio($datos, 'apellido', 'el apellido', 60);
    $email    = mb_strtolower(texto_obligatorio($datos, 'email', 'el correo', 120));
    $telefono = texto_obligatorio($datos, 'telefono', 'el teléfono', 30);
    $password = campo_password($datos);

    validar_email($email);
    validar_telefono($telefono);
    validar_password($password);

    $consulta = conexion()->prepare(
        'INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?)'
    );
    try {
        $consulta->execute([$nombre, $apellido, $email, $telefono, password_hash($password, PASSWORD_DEFAULT), 'cliente']);
    } catch (PDOException $e) {
        // El correo es UNIQUE en la base: si ya existe, MySQL da el error 1062
        if ($e->errorInfo[1] === 1062) {
            responder_error('Ya existe una cuenta con ese correo', 409);
        }
        throw $e;
    }

    $id_usuario = (int) conexion()->lastInsertId();
    guardar_usuario_en_sesion($id_usuario);

    responder_ok(['id_usuario' => $id_usuario, 'nombre' => $nombre, 'rol' => 'cliente'], 201);
}

/** POST /api/auth/login — Inicia la sesión con correo y contraseña (HU-08, HU-21). */
function auth_login(): void
{
    $datos = leer_json();
    $email = mb_strtolower(campo_texto($datos, 'email'));
    $password = campo_password($datos);

    if ($email === '' || $password === '') {
        responder_error('Completá el correo y la contraseña', 400);
    }

    $consulta = conexion()->prepare(
        'SELECT id_usuario, nombre, apellido, email, telefono, password_hash, rol, estado FROM usuarios WHERE email = ?'
    );
    $consulta->execute([$email]);
    $usuario = $consulta->fetch();

    // El mismo mensaje si falla el correo o la contraseña, para no revelar cuál de los dos
    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        responder_error('Correo o contraseña incorrectos', 401);
    }

    // La suspensión se informa solo si la contraseña es correcta
    if ($usuario['estado'] === 'suspendido') {
        responder_error('Tu cuenta está suspendida. Contactanos para más información', 403);
    }

    guardar_usuario_en_sesion($usuario['id_usuario']);

    unset($usuario['password_hash'], $usuario['estado']);
    responder_ok($usuario);
}

/** POST /api/auth/logout — Cierra la sesión (HU-09). */
function auth_logout(): void
{
    cerrar_sesion();
    responder_ok(['mensaje' => 'Sesión cerrada']);
}

/** GET /api/auth/me — Datos del usuario con sesión iniciada, con su rol (HU-08). */
function auth_me(): void
{
    responder_ok(usuario_actual());
}
