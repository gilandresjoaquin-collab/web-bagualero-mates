# CLAUDE.md — Web Bagualero Mates

Instrucciones y contexto para trabajar en este repositorio con Claude Code.

## Qué es el proyecto
Tienda web dinámica de artículos para el mate (mates, bombillas, termos, yerberas, canastas y combos) de Mar del Plata.
Proyecto escolar de 7.° año (E.E.S.T. N.° 2, materia "Proyecto e Implementación y Diseño de Web Dinámica").
- **Equipo:** Joaquín Gil, Lautaro Gejo y Luka Arauz.
- **Profesora / clienta:** Natalia Olea.
- **Entrega final:** fines de noviembre de 2026.

**Prioridad:** es una web SIMPLE y el tiempo es poco.
- Primero que funcione, después que se vea bien.
- No agregar frameworks, librerías ni complejidad que no se pidan.

## Stack (obligatorio)
- **Frontend:** HTML5, CSS3 y JavaScript puro (con `fetch`). Sin React, Vue, Bootstrap ni Tailwind.
- **Backend:** PHP 8 con PDO y sentencias preparadas. API que responde JSON.
- **Base de datos:** MySQL / MariaDB en XAMPP. El script está en `server/database/bagualero_mates.sql`.
- **Entorno:** XAMPP en Windows. El proyecto va dentro de `htdocs`.

## Estructura
```
client/   → frontend:
  index.html  → solo redirige a pages/inicio.html
  pages/      → todas las páginas HTML, al mismo nivel (así las rutas relativas sirven igual en todas)
  css/        → estilos.css (variables de la marca, botones, formularios, encabezado, pie, páginas)
  js/         → api.js (api, usuarioActual), comun.js (encabezado con la sesión, pie, íconos, menús, escapar),
                formularios.js (validar y mostrar errores), productos.js (tarjetaProducto, agregarAlCarrito),
                y un .js por página (login.js, registro.js, catalogo.js, producto.js, carrito.js, checkout.js)
  img/        → logo.png
server/   → backend:
  api/        → .htaccess + index.php (entrada única y manejo de errores), rutas.php (tabla de rutas), endpoints/ (una función por endpoint)
  includes/   → respuestas.php (responder_ok, responder_error, leer_json), conexion.php (config, conexion),
                sesion.php (usuario_actual, verificar_acceso), validaciones.php (texto_obligatorio, validar_email…), enrutador.php
  config/     → config.example.php → copiar a config.php
  database/   → bagualero_mates.sql
  uploads/    → fotos de productos (en producto_imagenes.ruta se guarda solo el nombre del archivo)
docs/     → documentación del proyecto (leer antes de programar)
```

**Cómo agregar un endpoint:**
1. Escribir la función en `server/api/endpoints/<modulo>.php` (por ejemplo, `productos_detalle(int $id)`).
2. Hacer que termine siempre con `responder_ok($datos, $codigo)` o `responder_error($mensaje, $codigo)`.
3. Cargar el archivo y agregar la línea en `server/api/rutas.php`: `['GET', '/productos/{id}', 'productos_detalle', 'publico']`.
   - La 4.ª columna es el acceso del contrato: `'publico'` (🌐), `'cliente'` (👤, cualquier usuario con sesión) o `'admin'` (🔒).
   - El enrutador lo controla antes de llamar a la función: 401 sin sesión, 403 si no es admin. Todo `/admin/...` es siempre `'admin'`.
4. Usar `conexion()` para la base de datos, `leer_json()` para los datos enviados por `POST`, `PUT` o `PATCH`, y `usuario_actual()` para saber quién está logueado.
5. Validar con las funciones de `validaciones.php` (responden 400 con el mensaje si algo está mal).

En la sesión solo se guarda `$_SESSION['id_usuario']`; el rol y el estado se leen de la base en cada petición.

Prueba rápida: `GET server/api/prueba` tiene que responder `"ok": true`.

**Cómo armar una página:**
1. Copiar la estructura de `client/pages/inicio.html`: el `<head>` (Lora + `estilos.css`), `<body data-pagina="...">`, `<header id="encabezado">`, `<main id="contenido">` y `<footer id="pie">`.
2. Al final del `<body>`, en este orden: `api.js`, `comun.js`, `formularios.js` (si tiene formularios) y el `.js` de la página.
3. `data-pagina` resalta la opción del menú: `inicio`, `catalogo`, `combos`, `nosotros` o `contacto`.
4. Usar las clases que ya existen: `contenedor`, `seccion`, `sobretitulo`, `boton` (`boton--borde`, `boton--oscuro`, `boton--claro`, `boton--bloque`), `campo`, `campos-dos`, `alerta--error`, `alerta--exito`.
5. Íconos: `<span data-icono="carrito"></span>` en el HTML o `icono('carrito')` en JS (ver `ICONOS` en `comun.js`).
6. CSS mobile-first: primero el estilo de celular y después `@media (min-width: 768px)` o `(min-width: 1024px)`.

**En el JavaScript de las páginas:**
- `await api('productos')` o `await api('auth/login', 'POST', datos)` → `{ ok, data | error, estado }`. Nunca lanza errores.
- `await usuarioActual()` → el usuario con sesión (`nombre`, `rol`…) o `null`.
- `escapar(texto)` SIEMPRE que se meta en `innerHTML` un dato de la base o del usuario (o usar `textContent`).
- Formularios con `novalidate`: `leerFormulario`, `limpiarErrores`, `mostrarErrores(form, { campo: 'mensaje' })`, `mostrarAlerta`, `enviando` y las reglas `errorEmail`, `errorTelefono`, `errorPassword`, `errorTexto`.
- Para pedir login: enlazar a `enlaceLogin()` (o `login.html?volver=pagina.html`); después de entrar vuelve a esa página.
  `login.html` y `registro.html` son páginas separadas y el enlace entre ellas conserva el `?volver=` (`paginaParaVolver()` en `comun.js`).
- Productos: `precio(50000)` → "$50.000", `fotoProducto(ruta, nombre)` (foto o recuadro con el logo), `tarjetaProducto(p)` y `agregarAlCarrito(id, cantidad)`.
- Mensajes cortos: `avisar('Agregado al carrito', { tipo: 'exito' | 'error' | 'info', enlaces: [{ texto, url }] })`.
- Carrito del encabezado: `actualizarContadorCarrito(cantidad)`. Menú: `marcarMenu('combos')`.
- Los grupos de opciones (`type="radio"`) se marcan uno por uno: `.value = ''` no funciona en los navegadores.
- Páginas privadas (carrito, checkout): si `await usuarioActual()` es `null`, `location.replace(enlaceLogin())`.

**Datos del negocio que faltan** (constantes en el JS, completarlas cuando las tengamos):
- `WHATSAPP` en `client/js/comun.js` (número con código de país).
- `DATOS_TRANSFERENCIA` en `client/js/checkout.js` (alias o CBU que se muestra al confirmar un pedido con transferencia).

## Documentación de referencia (en /docs)
- `02-historias-de-usuario.md`: las 24 historias (HU-01 a HU-24) con sus criterios de aceptación. Es lo que hay que cumplir.
- `04-modelo-entidad-relacion.md` + `img/der-bagualero-mates.png`: las 15 tablas.
- `05-contrato-api.md`: los endpoints, el formato de respuesta y los códigos HTTP.
- `wireframes/`: el diseño de las 10 pantallas, en celular y escritorio. Respetar ese diseño.
- `06-backlog-kanban.md`: las tareas T09–T43 y quién hace cada una.
- `01-documento-de-vision.pdf`: el alcance general.

## Reglas de código
- **Formato de respuesta de la API:**
  - Éxito: `{ "ok": true, "data": ... }`
  - Error: `{ "ok": false, "error": "mensaje" }`
- **Seguridad:**
  - Contraseñas con `password_hash` / `password_verify`.
  - Todas las consultas con PDO y sentencias preparadas.
  - Escapar la salida con `htmlspecialchars`.
  - Validar los datos en el cliente y en el servidor.
- **Autenticación:**
  - Sesiones de PHP (`$_SESSION`).
  - Las rutas de administración devuelven 403 si el usuario no es `administrador`.
- **Rutas en los `fetch`:**
  - Siempre relativas. Nunca `http://localhost/...` ni el nombre de la carpeta del proyecto, porque cada uno puede tenerla con otro nombre.
  - Desde las páginas de `client/pages/`, la API está en `../../server/api/` (por ejemplo, `fetch('../../server/api/productos')`).
- **Credenciales:**
  - Solo en `server/config/config.php`, que está en el `.gitignore`. Nunca subirlas.
- **Productos:**
  - La baja es lógica: `activo = 0`, nunca `DELETE`.
  - El stock se valida y se descuenta dentro de una transacción al confirmar el pedido.
- **Estilo del código:**
  - Nombres en español, coherentes con la base de datos (`productos`, `id_producto`, etc.).
  - Comentarios breves en español.
- **Diseño:**
  - Responsive y mobile-first, sin scroll horizontal desde 320 px.
  - Menú hamburguesa en celular.

## Identidad visual
Variables CSS sugeridas:
```css
--crema: #F0E7D6;   /* fondo */
--marron: #3B2A1B;  /* títulos, header, footer */
--cuero: #A0703F;   /* botones y acciones */
--dorado: #B89A5B;  /* etiquetas y detalles */
--carbon: #1E1E1E;  /* texto */
```
- **Tipografías:** serif para los títulos (por ejemplo, Lora) y sans-serif para el texto.
- **Logo:** `client/img/logo.png`.
- **Lema:** "El mate bien criollo".
- **Instagram:** @bagualero.mates.

## Datos del negocio (para checkout y textos)
- **Entrega:**
  - Envío a domicilio (solo Mar del Plata).
  - Retiro.
  - Punto de encuentro.
- **Pago:** transferencia, efectivo o tarjeta. No hay pagos online reales: solo se registra el método elegido.
- **Estados del pedido:** Pendiente → Confirmado → Enviado / Listo para retirar → Entregado (o Cancelado).
- **Usuario admin inicial** (cargado en el `.sql`):
  - Nombre: `Admin` (sin apellido; no usar nombres de personas)
  - Correo: `admin@bagualeromates.com`
  - Contraseña: `Bagualero2026`

## Orden de trabajo sugerido
1. Base: importar el `.sql`, crear `config.php` y armar la conexión PDO y un helper de respuestas JSON.
2. Autenticación: registro, login, logout, `/me` y control de roles.
3. Catálogo: listado con filtros, detalle y categorías, en backend y frontend.
4. Carrito y checkout, con control de stock.
5. Panel de administración: productos con imágenes, pedidos, categorías y usuarios.
6. Inicio, Nosotros/Contacto, ajustes responsive y pruebas.

Primero se hacen las historias **Imprescindibles**. Las **Importantes** (HU-06, 10, 15, 21, 22 y 23) van solo si queda tiempo.
