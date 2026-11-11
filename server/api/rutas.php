<?php
/**
 * Tabla de rutas de la API. Cada línea es un endpoint de docs/05-contrato-api.md:
 *   [método, ruta (sin "/api"), función que la atiende, acceso]
 *
 * Los {parametros} de la ruta son números y llegan a la función en el mismo orden.
 *
 * Acceso (la columna "Acceso" del contrato):
 *   'publico' → 🌐 cualquier visitante
 *   'cliente' → 👤 cualquier usuario con sesión iniciada (incluido el administrador)
 *   'admin'   → 🔒 solo administradores. Las rutas que empiezan con /admin siempre son 'admin'.
 *
 * Para agregar un endpoint:
 *   1. Escribir la función en un archivo de endpoints/ (por ejemplo, endpoints/productos.php).
 *      La función tiene que terminar con responder_ok() o responder_error().
 *   2. Cargar ese archivo con require_once, acá abajo.
 *   3. Agregar la línea en la tabla.
 */

require_once __DIR__ . '/endpoints/prueba.php';
require_once __DIR__ . '/endpoints/auth.php';

return [
    // Diagnóstico
    ['GET',  '/prueba',        'prueba_conexion', 'publico'],
    ['GET',  '/admin/prueba',  'prueba_admin',    'admin'],

    // Autenticación (HU-07, HU-08, HU-09)
    ['POST', '/auth/register', 'auth_registro',   'publico'],
    ['POST', '/auth/login',    'auth_login',      'publico'],
    ['POST', '/auth/logout',   'auth_logout',     'cliente'],
    ['GET',  '/auth/me',       'auth_me',         'cliente'],

    // Así se van a ver las próximas rutas:
    // ['GET',   '/productos',                    'productos_listar',       'publico'],
    // ['GET',   '/productos/{id}',               'productos_detalle',      'publico'],
    // ['PATCH', '/admin/productos/{id}/estado',  'admin_productos_estado', 'admin'],
];
