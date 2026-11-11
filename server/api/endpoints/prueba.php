<?php
/**
 * GET /api/prueba — Comprueba que la API funciona y que se conecta a la base de datos.
 */
function prueba_conexion(): void
{
    $consulta = conexion()->prepare(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = ?'
    );
    $consulta->execute(['BASE TABLE']);

    responder_ok([
        'mensaje'       => 'La API funciona y está conectada a la base de datos',
        'base_de_datos' => config('db_name'),
        'tablas'        => (int) $consulta->fetchColumn(),
    ]);
}
