<?php
/**
 * Enrutador de la API: busca la ruta pedida en la tabla de rutas (api/rutas.php)
 * y ejecuta la función que la atiende.
 *
 * @param array  $rutas  Tabla de rutas: [método, patrón, función]
 * @param string $metodo Método HTTP de la petición (GET, POST, PUT, PATCH o DELETE)
 * @param string $ruta   Ruta pedida, sin la carpeta del proyecto (por ejemplo, "productos/5")
 */
function despachar(array $rutas, string $metodo, string $ruta): never
{
    $ruta = '/' . trim($ruta, '/');
    $ruta_existe = false;

    foreach ($rutas as [$metodo_ruta, $patron, $funcion]) {
        // Cada {parametro} del patrón acepta solo números: "/productos/{id}" coincide con "/productos/5"
        $expresion = '#^' . preg_replace('#\{\w+\}#', '(\d+)', $patron) . '$#';

        if (!preg_match($expresion, $ruta, $coincidencias)) {
            continue;
        }
        $ruta_existe = true;

        if ($metodo_ruta === $metodo) {
            // Los números de la URL llegan a la función como parámetros: productos_detalle(5)
            $parametros = array_map('intval', array_slice($coincidencias, 1));
            $funcion(...$parametros);

            // Cada función tiene que terminar con responder_ok() o responder_error()
            responder_error("La ruta $metodo $patron no devolvió ninguna respuesta", 500);
        }
    }

    // La ruta existe pero con otro método (por ejemplo, POST en una ruta que solo acepta GET)
    if ($ruta_existe) {
        responder_error('Método no permitido', 405);
    }
    responder_error('Ruta no encontrada', 404);
}
