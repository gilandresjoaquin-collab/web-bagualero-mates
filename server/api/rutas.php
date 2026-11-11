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
require_once __DIR__ . '/endpoints/catalogo.php';
require_once __DIR__ . '/endpoints/carrito.php';
require_once __DIR__ . '/endpoints/pedidos.php';

return [
    // Diagnóstico
    ['GET',  '/prueba',        'prueba_conexion', 'publico'],
    ['GET',  '/admin/prueba',  'prueba_admin',    'admin'],

    // Autenticación (HU-07, HU-08, HU-09)
    ['POST', '/auth/register', 'auth_registro',   'publico'],
    ['POST', '/auth/login',    'auth_login',      'publico'],
    ['POST', '/auth/logout',   'auth_logout',     'cliente'],
    ['GET',  '/auth/me',       'auth_me',         'cliente'],

    // Catálogo (HU-01 a HU-05)
    ['GET',  '/productos',      'productos_listar',  'publico'],
    ['GET',  '/productos/{id}', 'productos_detalle', 'publico'],
    ['GET',  '/categorias',     'categorias_listar', 'publico'],
    ['GET',  '/materiales',     'materiales_listar', 'publico'],

    // Carrito (HU-11 y HU-12)
    ['GET',    '/carrito',               'carrito_ver',       'cliente'],
    ['POST',   '/carrito',               'carrito_agregar',   'cliente'],
    ['PUT',    '/carrito/{id_producto}', 'carrito_modificar', 'cliente'],
    ['DELETE', '/carrito/{id_producto}', 'carrito_quitar',    'cliente'],
    ['DELETE', '/carrito',               'carrito_vaciar',    'cliente'],

    // Finalizar la compra (HU-13 y HU-14)
    ['GET',  '/metodos-entrega', 'metodos_entrega_listar', 'publico'],
    ['GET',  '/metodos-pago',    'metodos_pago_listar',    'publico'],
    ['POST', '/pedidos',         'pedidos_crear',          'cliente'],
];
