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
client/   → frontend: pages/ (HTML), css/, js/, img/ (logo.png)
server/   → backend: api/ (endpoints), config/ (config.example.php → copiar a config.php), database/, uploads/ (fotos de productos)
docs/     → documentación del proyecto (leer antes de programar)
```

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
