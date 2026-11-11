<?php
/**
 * Funciones para validar los datos que llegan a la API.
 * Si un dato no es válido, responden 400 con el mensaje del error.
 */

/** Devuelve un campo como texto, sin espacios al principio ni al final ('' si no vino). */
function campo_texto(array $datos, string $campo): string
{
    $valor = $datos[$campo] ?? '';
    return is_scalar($valor) ? trim((string) $valor) : '';
}

/** Devuelve una contraseña tal como vino, sin recortar espacios ('' si no vino). */
function campo_password(array $datos, string $campo = 'password'): string
{
    $valor = $datos[$campo] ?? '';
    return is_string($valor) ? $valor : '';
}

/**
 * Devuelve un campo de texto obligatorio: controla que no esté vacío ni supere el largo máximo.
 * $nombre va con artículo, para armar el mensaje: 'el nombre', 'la dirección'.
 */
function texto_obligatorio(array $datos, string $campo, string $nombre, int $maximo): string
{
    $valor = campo_texto($datos, $campo);
    if ($valor === '') {
        responder_error("Completá $nombre", 400);
    }
    if (mb_strlen($valor) > $maximo) {
        responder_error(ucfirst($nombre) . " no puede tener más de $maximo caracteres", 400);
    }
    return $valor;
}

/** Devuelve un número entero mayor a 0 (un id, una cantidad…). Si no es válido, responde 400 con el mensaje. */
function entero_positivo(array $datos, string $campo, string $mensaje): int
{
    $valor = filter_var($datos[$campo] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 1000000]]);
    if (!is_int($valor)) {
        responder_error($mensaje, 400);
    }
    return $valor;
}

function validar_email(string $email): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        responder_error('El correo no tiene un formato válido', 400);
    }
}

/** Solo números, espacios y + - ( ), con al menos 6 números. */
function validar_telefono(string $telefono): void
{
    if (!preg_match('/^[0-9 +()-]+$/', $telefono) || preg_match_all('/\d/', $telefono) < 6) {
        responder_error('El teléfono no es válido: usá solo números (por ejemplo, 2235550000)', 400);
    }
}

/** Al menos 8 caracteres, con al menos una letra y un número (HU-07). */
function validar_password(string $password): void
{
    if (mb_strlen($password) < 8 || !preg_match('/\pL/u', $password) || !preg_match('/\d/', $password)) {
        responder_error('La contraseña tiene que tener al menos 8 caracteres, con al menos una letra y un número', 400);
    }
    // password_hash (bcrypt) solo usa los primeros 72 bytes
    if (strlen($password) > 72) {
        responder_error('La contraseña no puede tener más de 72 caracteres', 400);
    }
}
