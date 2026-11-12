<?php
/**
 * Sube la versión de los CSS, los JS y el favicon en todas las páginas (client/pages/*.html).
 *
 * Cada página carga sus archivos con un número de versión: estilos.css?v=3, comun.js?v=3, favicon-32.png?v=3…
 * Cuando cambia uno de esos archivos, se sube la versión y el navegador descarga los nuevos
 * en lugar de usar los que tenía guardados.
 *
 * Uso (desde la carpeta del proyecto):
 *   C:\xampp\php\php.exe herramientas\subir-version.php       → versión actual + 1
 *   C:\xampp\php\php.exe herramientas\subir-version.php 10    → pone la versión 10
 * O doble clic en herramientas\subir-version.bat
 *
 * También agrega el ?v= a los que todavía no lo tengan (por ejemplo, en una página nueva).
 */

// Solo se usa desde la consola: desde el navegador no hace nada
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

$paginas = glob(__DIR__ . '/../client/pages/*.html');

// Archivos propios que cargan las páginas (con o sin ?v=): ../css/*.css, ../js/*.js y ../img/favicon*
$patron = '#((?:href|src)="\.\./(?:css/[^"?\#]+\.css|js/[^"?\#]+\.js|img/favicon[^"?\#]*\.(?:svg|png)))(?:\?v=\d+)?"#';

// Versión actual: la más alta que haya en las páginas
$actual = 1;
foreach ($paginas as $pagina) {
    preg_match_all('#\.(?:css|js|svg|png)\?v=(\d+)"#', file_get_contents($pagina), $versiones);
    foreach ($versiones[1] as $version) {
        $actual = max($actual, (int) $version);
    }
}

$nueva = isset($argv[1]) ? (int) $argv[1] : $actual + 1;
if ($nueva < 1) {
    exit("La versión tiene que ser un número mayor que 0.\n");
}

$archivos = 0;
foreach ($paginas as $pagina) {
    $contenido = file_get_contents($pagina);
    $nuevoContenido = preg_replace($patron, '$1?v=' . $nueva . '"', $contenido, -1, $cantidad);
    $archivos += $cantidad;
    if ($nuevoContenido !== $contenido) {
        file_put_contents($pagina, $nuevoContenido);
    }
}

echo "Versión $actual → $nueva: " . count($paginas) . " páginas, $archivos archivos (CSS, JS y favicon).\n";
