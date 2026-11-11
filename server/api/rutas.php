<?php
/**
 * Tabla de rutas de la API. Cada línea es un endpoint de docs/05-contrato-api.md:
 *   [método, ruta (sin "/api"), función que la atiende]
 * Los {parametros} de la ruta son números y llegan a la función en el mismo orden.
 *
 * Para agregar un endpoint:
 *   1. Escribir la función en un archivo de endpoints/ (por ejemplo, endpoints/productos.php).
 *      La función tiene que terminar con responder_ok() o responder_error().
 *   2. Cargar ese archivo con require_once, acá abajo.
 *   3. Agregar la línea en la tabla.
 */

require_once __DIR__ . '/endpoints/prueba.php';

return [
    // Diagnóstico
    ['GET', '/prueba', 'prueba_conexion'],

    // Así se van a ver las próximas rutas:
    // ['GET',   '/productos',             'productos_listar'],
    // ['GET',   '/productos/{id}',        'productos_detalle'],
    // ['PATCH', '/admin/productos/{id}/estado', 'admin_productos_estado'],
];
