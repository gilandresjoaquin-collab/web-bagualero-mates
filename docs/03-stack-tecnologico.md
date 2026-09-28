# Stack tecnológico

**Proyecto:** Web Bagualero Mates

## Resumen

| Capa | Tecnología | Versión de referencia |
|---|---|---|
| Frontend (estructura) | HTML5 | Estándar W3C |
| Frontend (estilos) | CSS3 (Flexbox, Grid, Media Queries) | Estándar W3C |
| Frontend (lógica) | JavaScript (ES6+) con `fetch` | Navegadores actuales |
| Backend | PHP con API REST | PHP 8.x (incluido en XAMPP) |
| Acceso a datos | PDO (PHP Data Objects) | Incluido en PHP |
| Base de datos | MySQL / MariaDB | MariaDB 10.4+ (incluido en XAMPP) |
| Servidor web | Apache | Incluido en XAMPP |
| Entorno local | XAMPP | 8.x |
| Control de versiones | Git + GitHub | — |
| Gestión de tareas | GitHub Projects (tablero Kanban) | — |
| Diseño | Wireframes de media fidelidad en PNG | — |

## Arquitectura

La aplicación usa una arquitectura **cliente-servidor** con una **API REST** en el medio:

```
┌────────────────────────┐   HTTP + JSON   ┌────────────────────────┐   SQL (PDO)   ┌────────────────────────┐
│  CLIENTE  (/client)    │ ──────────────► │  SERVIDOR  (/server)   │ ────────────► │  BASE DE DATOS         │
│  HTML · CSS · JS       │ ◄────────────── │  Apache + PHP (API)    │ ◄──────────── │  MySQL / MariaDB       │
│  Celular, tablet y PC  │                 │  Sesiones, validación  │               │  15 tablas en 3FN      │
└────────────────────────┘                 └────────────────────────┘               └────────────────────────┘
```

- **El cliente** (navegador) muestra las pantallas y, con JavaScript, pide y envía los datos a la API sin recargar la página. Así funcionan los filtros, el carrito y el checkout.
- **El servidor** recibe las peticiones, valida los datos, aplica las reglas del negocio (stock, roles, estados) y responde en **JSON**.
- **La base de datos** guarda la información de forma persistente. Lo que se ve en la tienda sale de ahí, por eso el sitio es **dinámico**: si el administrador carga un producto o cambia un precio, el cambio se ve al instante, sin tocar el código.

## Justificación de cada tecnología

### HTML5 y CSS3

- Son el estándar de la web: el sitio funciona en cualquier navegador sin instalar nada. Esto es clave para que se use tanto desde el celular como desde la computadora.
- Con **Flexbox, CSS Grid y Media Queries** se arma el diseño **responsive** (mobile-first) sin depender de librerías externas, como se ve en los wireframes.
- Las **variables CSS** (`--crema`, `--marron`, etc.) permiten aplicar la paleta de la marca de forma consistente en todo el sitio.
- Son la base de la materia, así que todo el equipo las conoce.

### JavaScript (ES6+)

- Permite la interactividad que necesita una tienda: sumar al carrito, recalcular totales, filtrar sin recargar, validar formularios y abrir el menú en el celular.
- Con **`fetch`** consume la API REST y recibe JSON, separando la interfaz de la lógica del servidor.
- Se usa JavaScript puro (sin frameworks). Para el tamaño del proyecto no hace falta la complejidad de React o Vue, y el equipo se enfoca en entender los fundamentos.

### PHP 8

- Es un lenguaje de servidor muy usado en la web y viene incluido en XAMPP, así que no hace falta instalar nada extra.
- Trae de fábrica lo que el proyecto necesita en seguridad:
  - `password_hash` / `password_verify` para guardar las contraseñas cifradas (bcrypt).
  - **Sesiones** (`$_SESSION`) para el login y el control de roles.
  - **PDO** con **sentencias preparadas**, que evitan la inyección SQL.
- Permite armar una API REST simple: cada endpoint recibe la petición, valida los datos, consulta la base y devuelve JSON con `json_encode`.

### MySQL / MariaDB

- Es una base de datos **relacional**, ideal para datos con relaciones claras: usuarios que hacen pedidos, pedidos con productos, productos con categorías.
- Soporta **claves foráneas, restricciones y transacciones** (motor InnoDB). Las transacciones son necesarias para el checkout: el pedido se guarda y el stock se descuenta en una sola operación, o no se hace nada (HU-13 y HU-14).
- Se administra fácilmente con **phpMyAdmin**, incluido en XAMPP.
- Es gratuita y la usan la mayoría de los hostings, por si en el futuro se publica la web.

### XAMPP

- Instala en un paso **Apache + PHP + MariaDB + phpMyAdmin**.
- Los tres integrantes trabajan con **el mismo entorno**, lo que evita el problema de "en mi compu funciona".
- Es gratuito y funciona en Windows, que es el sistema operativo del equipo.

### Git y GitHub

- Git guarda el historial de cambios y permite que los tres trabajen en paralelo con **ramas por funcionalidad** (`feature/catalogo`, `feature/carrito`…).
- En GitHub queda centralizado el código, la documentación (`/docs`) y el tablero de tareas, y el historial de commits muestra los aportes de cada integrante.
- El `.gitignore` evita subir credenciales (`config.php`, `.env`) y archivos innecesarios.

### GitHub Projects (Kanban)

- Queda integrado al repositorio: cada tarea puede vincularse con un issue y con su historia de usuario (HU-XX).
- Columnas: *Backlog → Por hacer → En curso → En revisión → Terminado*, con prioridad y responsable asignado.

## Librerías y herramientas adicionales

Por ahora el proyecto **no usa librerías externas**. Se prioriza el código propio para entender cada parte. Si más adelante se suma alguna, se va a documentar y justificar acá. Hay dos candidatas:

| Posible librería | Para qué | Estado |
|---|---|---|
| SDK de Mercado Pago (modo de prueba) | Integración de pago online | Deseable, no confirmada |
| PHPMailer | Enviar correos (recuperar contraseña, confirmación de pedido) | Deseable, no confirmada |

## Alternativas consideradas

| Alternativa | Por qué no se eligió |
|---|---|
| Node.js + Express | Requiere instalar y configurar más herramientas. PHP ya viene con XAMPP y es la base de la materia. |
| React / Vue | Agregan una curva de aprendizaje y un proceso de compilación que no hacen falta para el tamaño del proyecto. |
| Plataformas de tiendas prearmadas | Tienen costo mensual y no permiten demostrar el desarrollo propio, que es el objetivo del proyecto. |
| Base de datos NoSQL (MongoDB) | Los datos de la tienda son claramente relacionales y necesitan claves foráneas y transacciones. |

## Seguridad aplicada con este stack

- Contraseñas cifradas con `password_hash`; nunca se guardan en texto plano.
- Consultas con **sentencias preparadas (PDO)**, contra la inyección SQL.
- Escape de salida con `htmlspecialchars`, contra XSS.
- Validación de datos **en el cliente (JS) y en el servidor (PHP)**.
- Control de **rol** en cada endpoint del panel de administración: si el usuario no es administrador, la API responde `403`.
- Credenciales de la base de datos en `server/config/config.php`, que está excluido por `.gitignore`.
