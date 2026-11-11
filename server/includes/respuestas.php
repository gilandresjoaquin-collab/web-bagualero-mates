<?php
/**
 * Funciones para responder en JSON con el formato del contrato de la API:
 *   Éxito: { "ok": true,  "data": ... }
 *   Error: { "ok": false, "error": "mensaje" }
 * Las dos terminan la ejecución (exit) después de responder.
 */

function responder_ok(mixed $datos = null, int $codigo = 200): never
{
    enviar_json(['ok' => true, 'data' => $datos], $codigo);
}

function responder_error(string $mensaje, int $codigo = 400): never
{
    enviar_json(['ok' => false, 'error' => $mensaje], $codigo);
}

function enviar_json(array $cuerpo, int $codigo): never
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    // Deja legibles los acentos ("Envío" y no "Envío") y las barras ("uploads/foto.jpg")
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

/**
 * Lee los datos enviados como JSON en el cuerpo de la petición (POST, PUT, PATCH).
 * Devuelve un array; si no se envió nada, un array vacío.
 * Si lo enviado no es un JSON válido, responde 400.
 */
function leer_json(): array
{
    $cuerpo = file_get_contents('php://input');
    if ($cuerpo === '' || $cuerpo === false) {
        return [];
    }

    $datos = json_decode($cuerpo, true);
    if (!is_array($datos)) {
        responder_error('Los datos enviados no son un JSON válido', 400);
    }
    return $datos;
}
