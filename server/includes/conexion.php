<?php
/**
 * Configuración y conexión a la base de datos (PDO).
 */

/**
 * Devuelve un dato de server/config/config.php, por ejemplo config('db_name').
 * Si la clave no existe, devuelve null.
 */
function config(string $clave): mixed
{
    static $config = null;

    if ($config === null) {
        $archivo = __DIR__ . '/../config/config.php';
        if (!is_file($archivo)) {
            responder_error('Falta el archivo server/config/config.php: copiá config.example.php con ese nombre', 500);
        }
        $config = require $archivo;
    }

    return $config[$clave] ?? null;
}

/**
 * Devuelve la conexión PDO. Se crea una sola vez por petición y después se reutiliza.
 *
 * Ejemplo de uso (siempre con sentencias preparadas):
 *   $consulta = conexion()->prepare('SELECT * FROM productos WHERE id_producto = ?');
 *   $consulta->execute([$id]);
 *   $producto = $consulta->fetch();
 */
function conexion(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . config('db_host') . ';dbname=' . config('db_name') . ';charset=' . config('db_charset');

        try {
            $pdo = new PDO($dsn, config('db_user'), config('db_pass'), [
                // Los errores de SQL lanzan excepciones (y la API responde 500)
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                // Las filas vienen como arrays con el nombre de cada columna
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                // Sentencias preparadas reales del motor. Ojo: no se puede repetir
                // el mismo :parametro dos veces en una consulta (usar :buscar1, :buscar2)
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log('Error de conexión a la base de datos: ' . $e->getMessage());
            responder_error('No se pudo conectar a la base de datos. Revisá que MySQL esté iniciado en XAMPP y los datos de config.php', 500);
        }
    }

    return $pdo;
}
