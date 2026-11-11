<?php
/**
 * Punto de entrada de la API.
 * El .htaccess manda acá todas las peticiones: server/api/productos/5 → index.php?ruta=productos/5
 */

require __DIR__ . '/../includes/respuestas.php';
require __DIR__ . '/../includes/conexion.php';
require __DIR__ . '/../includes/enrutador.php';

// Los avisos de PHP no se imprimen (romperían el JSON): se convierten en excepciones
ini_set('display_errors', '0');
set_error_handler(function (int $nivel, string $mensaje, string $archivo, int $linea): bool {
    if (!(error_reporting() & $nivel)) {
        return false; // error silenciado con @
    }
    throw new ErrorException($mensaje, 0, $nivel, $archivo, $linea);
});

// Cualquier error no controlado se responde en JSON con código 500
set_exception_handler(function (Throwable $e): void {
    error_log($e); // el detalle completo queda en C:\xampp\apache\logs\error.log

    $mensaje = 'Error interno del servidor';
    if (config('debug')) {
        $mensaje .= ': ' . $e->getMessage() . ' (' . basename($e->getFile()) . ', línea ' . $e->getLine() . ')';
    }
    responder_error($mensaje, 500);
});

// Ruta pedida, sin la carpeta del proyecto (por ejemplo, "productos/5")
$ruta = $_GET['ruta'] ?? '';
unset($_GET['ruta']); // para que no se mezcle con los filtros (?categoria=1, etc.)

$rutas = require __DIR__ . '/rutas.php';
despachar($rutas, $_SERVER['REQUEST_METHOD'], $ruta);
