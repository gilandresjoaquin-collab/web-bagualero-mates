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
require_once __DIR__ . '/endpoints/usuarios.php';
require_once __DIR__ . '/endpoints/admin_panel.php';
require_once __DIR__ . '/endpoints/admin_productos.php';
require_once __DIR__ . '/endpoints/admin_categorias.php';
require_once __DIR__ . '/endpoints/admin_pedidos.php';

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

    // Mis pedidos (HU-15)
    ['GET',  '/pedidos',      'pedidos_mios',        'cliente'],
    ['GET',  '/pedidos/{id}', 'pedidos_mio_detalle', 'cliente'],

    // Mi cuenta: perfil, contraseña y direcciones (HU-10)
    ['PUT',    '/usuarios/perfil',           'usuarios_perfil',    'cliente'],
    ['PUT',    '/usuarios/password',         'usuarios_password',  'cliente'],
    ['GET',    '/usuarios/direcciones',      'direcciones_listar', 'cliente'],
    ['POST',   '/usuarios/direcciones',      'direcciones_crear',  'cliente'],
    ['PUT',    '/usuarios/direcciones/{id}', 'direcciones_editar', 'cliente'],
    ['DELETE', '/usuarios/direcciones/{id}', 'direcciones_borrar', 'cliente'],

    // Panel de administración (HU-16 a HU-22): todo /admin es solo para administradores
    ['GET',    '/admin/dashboard',                              'admin_dashboard',                  'admin'],
    ['GET',    '/admin/productos',                              'admin_productos_listar',           'admin'],
    ['POST',   '/admin/productos',                              'admin_productos_crear',            'admin'],
    ['GET',    '/admin/productos/{id}',                         'admin_productos_detalle',          'admin'],
    ['PUT',    '/admin/productos/{id}',                         'admin_productos_editar',           'admin'],
    ['PATCH',  '/admin/productos/{id}/estado',                  'admin_productos_estado',           'admin'],
    ['POST',   '/admin/productos/{id}/imagenes',                'admin_productos_subir_imagenes',   'admin'],
    ['PATCH',  '/admin/productos/{id}/imagenes/{id_imagen}',    'admin_productos_imagen_principal', 'admin'],
    ['DELETE', '/admin/productos/{id}/imagenes/{id_imagen}',    'admin_productos_borrar_imagen',    'admin'],
    ['GET',    '/admin/categorias',                             'admin_categorias_listar',          'admin'],
    ['POST',   '/admin/categorias',                             'admin_categorias_crear',           'admin'],
    ['PUT',    '/admin/categorias/{id}',                        'admin_categorias_editar',          'admin'],
    ['PATCH',  '/admin/categorias/{id}/estado',                 'admin_categorias_estado',          'admin'],
    ['GET',    '/admin/estados-pedido',                         'admin_estados_listar',             'admin'],
    ['GET',    '/admin/pedidos',                                'admin_pedidos_listar',             'admin'],
    ['GET',    '/admin/pedidos/{id}',                           'admin_pedidos_detalle',            'admin'],
    ['PATCH',  '/admin/pedidos/{id}/estado',                    'admin_pedidos_estado',             'admin'],
    ['GET',    '/admin/usuarios',                               'admin_usuarios_listar',            'admin'],
    ['PATCH',  '/admin/usuarios/{id}/estado',                   'admin_usuarios_estado',            'admin'],
];
