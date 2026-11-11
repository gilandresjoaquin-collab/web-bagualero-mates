<?php
/**
 * Formulario de contacto (HU-23) y sus mensajes en el panel.
 */

/** POST /api/contacto — Guarda un mensaje: { "nombre", "email", "mensaje" } (los tres obligatorios). */
function contacto_enviar(): void
{
    $datos = leer_json();
    $nombre = texto_obligatorio($datos, 'nombre', 'el nombre', 80);
    $email = mb_strtolower(texto_obligatorio($datos, 'email', 'el correo', 120));
    validar_email($email);
    $mensaje = texto_obligatorio($datos, 'mensaje', 'el mensaje', 2000);

    conexion()->prepare('INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)')
        ->execute([$nombre, $email, $mensaje]);

    responder_ok(['mensaje' => 'Recibimos tu mensaje. Te vamos a responder a la brevedad.'], 201);
}

/** GET /api/admin/mensajes — Mensajes del formulario de contacto, del más nuevo al más viejo. */
function admin_mensajes_listar(): void
{
    $consulta = conexion()->prepare(
        'SELECT id_mensaje, nombre, email, mensaje, fecha_envio FROM mensajes_contacto
         ORDER BY fecha_envio DESC, id_mensaje DESC LIMIT 200'
    );
    $consulta->execute();

    $mensajes = array_map(function (array $fila): array {
        $fila['id_mensaje'] = (int) $fila['id_mensaje'];
        return $fila;
    }, $consulta->fetchAll());

    responder_ok($mensajes);
}
