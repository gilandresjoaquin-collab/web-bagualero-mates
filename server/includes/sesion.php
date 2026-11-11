<?php
/**
 * Sesiones de PHP y control de acceso por rol.
 * En la sesión solo se guarda el id del usuario. Su rol y su estado se leen de la base
 * en cada petición, así una suspensión o un cambio de rol se aplica al instante.
 */

function iniciar_sesion(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start([
            'cookie_httponly' => true,  // JavaScript no puede leer la cookie de sesión
            'cookie_samesite' => 'Lax', // otros sitios no pueden usar la sesión
            'use_strict_mode' => true,  // no acepta ids de sesión inventados
        ]);
    }
}

/** Deja iniciada la sesión de un usuario (al registrarse o al iniciar sesión). */
function guardar_usuario_en_sesion(int $id_usuario): void
{
    iniciar_sesion();
    session_regenerate_id(true); // id de sesión nuevo, para que no se pueda robar la sesión anterior
    $_SESSION['id_usuario'] = $id_usuario;
}

/** Borra los datos de la sesión, la cookie y la sesión en el servidor (HU-09). */
function cerrar_sesion(): void
{
    iniciar_sesion();
    $_SESSION = [];
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => session_get_cookie_params()['path']]);
    session_destroy();
}

/**
 * Devuelve el usuario con sesión iniciada (id_usuario, nombre, apellido, email, telefono y rol)
 * o null si no hay sesión. Si la cuenta fue suspendida, cierra su sesión.
 */
function usuario_actual(): ?array
{
    // Se busca una sola vez por petición
    static $buscado = false;
    static $usuario = null;
    if ($buscado) {
        return $usuario;
    }
    $buscado = true;

    iniciar_sesion();
    if (!isset($_SESSION['id_usuario'])) {
        return null;
    }

    $consulta = conexion()->prepare(
        'SELECT id_usuario, nombre, apellido, email, telefono, rol, estado FROM usuarios WHERE id_usuario = ?'
    );
    $consulta->execute([$_SESSION['id_usuario']]);
    $fila = $consulta->fetch();

    if (!$fila || $fila['estado'] !== 'activo') {
        cerrar_sesion();
        return null;
    }

    unset($fila['estado']);
    $usuario = $fila;
    return $usuario;
}

/**
 * Controla el acceso a una ruta según la columna "acceso" de rutas.php:
 *   'publico' → cualquiera
 *   'cliente' → hace falta sesión iniciada; si no hay, responde 401
 *   'admin'   → hace falta ser administrador; 401 si no hay sesión, 403 si no es admin (HU-16)
 */
function verificar_acceso(string $acceso): void
{
    if ($acceso === 'publico') {
        return;
    }
    if ($acceso !== 'cliente' && $acceso !== 'admin') {
        throw new InvalidArgumentException("Acceso desconocido en rutas.php: '$acceso'");
    }

    $usuario = usuario_actual();
    if ($usuario === null) {
        responder_error('Tenés que iniciar sesión', 401);
    }
    if ($acceso === 'admin' && $usuario['rol'] !== 'administrador') {
        responder_error('Acceso denegado', 403);
    }
}
