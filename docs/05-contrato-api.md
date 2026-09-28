# Contrato de API (mockup de endpoints)

**Proyecto:** Web Bagualero Mates · **Backend:** PHP · **Formato:** JSON · **Base URL (local):** `http://localhost/web-bagualero-mates/server/api`

Este es el listado inicial de rutas que va a proveer el backend. Puede ajustarse durante el desarrollo; cualquier cambio se va a registrar en este documento.

## Convenciones

- **Formato:** peticiones y respuestas en JSON (`Content-Type: application/json`). La carga de imágenes usa `multipart/form-data`.
- **Autenticación:** sesión de PHP (cookie `PHPSESSID`) que se crea al iniciar sesión.

**Niveles de acceso**

| Ícono | Quién puede usarlo |
|---|---|
| 🌐 **Público** | Cualquier visitante |
| 👤 **Cliente** | Usuario con sesión iniciada |
| 🔒 **Admin** | Solo el rol administrador |

**Formato de respuesta exitosa**

```json
{ "ok": true, "data": { ... } }
```

**Formato de respuesta con error**

```json
{ "ok": false, "error": "Correo o contraseña incorrectos" }
```

**Códigos HTTP**

| Código | Cuándo se usa |
|---|---|
| `200` | OK |
| `201` | Recurso creado |
| `400` | Datos inválidos |
| `401` | Sin sesión iniciada |
| `403` | Sin permiso (por ejemplo, un cliente en una ruta de admin) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (por ejemplo, correo ya registrado o stock insuficiente) |

---

## 1. Autenticación y cuenta

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de un nuevo usuario (rol cliente) | 🌐 | HU-07 |
| `POST` | `/api/auth/login` | Inicio de sesión. Rechaza cuentas suspendidas con un mensaje descriptivo | 🌐 | HU-08, HU-21 |
| `POST` | `/api/auth/logout` | Cierre de sesión | 👤 | HU-09 |
| `GET` | `/api/auth/me` | Datos del usuario con sesión iniciada (y su rol) | 👤 | HU-08 |
| `PUT` | `/api/usuarios/perfil` | Editar nombre, apellido y teléfono | 👤 | HU-10 |
| `PUT` | `/api/usuarios/password` | Cambiar la contraseña (pide la actual) | 👤 | HU-10 |
| `GET` | `/api/usuarios/direcciones` | Listar mis direcciones | 👤 | HU-10 |
| `POST` | `/api/usuarios/direcciones` | Agregar una dirección | 👤 | HU-10 |
| `PUT` | `/api/usuarios/direcciones/{id}` | Editar una dirección | 👤 | HU-10 |
| `DELETE` | `/api/usuarios/direcciones/{id}` | Eliminar una dirección | 👤 | HU-10 |

## 2. Catálogo

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `GET` | `/api/productos` | Listar productos activos, paginados y con filtros (ver parámetros abajo) | 🌐 | HU-01 a HU-04 |
| `GET` | `/api/productos/{id}` | Detalle de un producto, con imágenes y materiales | 🌐 | HU-05 |
| `GET` | `/api/productos/destacados` | Productos marcados como destacados | 🌐 | HU-06 |
| `GET` | `/api/productos/novedades` | Últimos productos cargados | 🌐 | HU-06 |
| `GET` | `/api/categorias` | Listar las categorías activas | 🌐 | HU-02 |
| `GET` | `/api/materiales` | Listar los materiales (para los filtros) | 🌐 | HU-04 |

**Parámetros de `GET /api/productos`**

| Parámetro | Qué hace | Ejemplo |
|---|---|---|
| `buscar` | Busca por nombre | `imperial` |
| `categoria` | Filtra por categoría | `1` |
| `material` | Filtra por material | `4` |
| `precio_min` / `precio_max` | Filtra por rango de precio | `10000` / `60000` |
| `con_stock` | Muestra solo productos con stock | `1` |
| `orden` | Ordena el listado | `precio_asc`, `precio_desc` o `nuevos` |
| `pagina` | Número de página | `2` |

Ejemplo:

```
GET /api/productos?categoria=1&material=4&precio_max=60000&con_stock=1&orden=precio_asc&pagina=1
```

## 3. Carrito

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `GET` | `/api/carrito` | Ver el carrito, con subtotales y total | 👤 | HU-12 |
| `POST` | `/api/carrito` | Agregar un producto (`id_producto`, `cantidad`). Valida el stock | 👤 | HU-11 |
| `PUT` | `/api/carrito/{id_producto}` | Cambiar la cantidad de un producto | 👤 | HU-12 |
| `DELETE` | `/api/carrito/{id_producto}` | Quitar un producto del carrito | 👤 | HU-12 |
| `DELETE` | `/api/carrito` | Vaciar el carrito | 👤 | HU-12 |

## 4. Pedidos (cliente)

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `GET` | `/api/metodos-entrega` | Listar los métodos de entrega activos | 🌐 | HU-13 |
| `GET` | `/api/metodos-pago` | Listar los métodos de pago activos | 🌐 | HU-13 |
| `POST` | `/api/pedidos` | Crear un pedido a partir del carrito: verifica el stock, lo descuenta, guarda el detalle y vacía el carrito (en una transacción) | 👤 | HU-13, HU-14 |
| `GET` | `/api/pedidos` | Listar mis pedidos | 👤 | HU-15 |
| `GET` | `/api/pedidos/{id}` | Detalle de uno de mis pedidos, con su historial de estados | 👤 | HU-15 |

## 5. Contacto

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `POST` | `/api/contacto` | Enviar un mensaje desde el formulario de contacto | 🌐 | HU-23 |

## 6. Administración

Todas las rutas empiezan con `/api/admin`. Si el usuario no es administrador, responden `403 Forbidden`.

| Método | URL | Acción | Acceso | HU |
|---|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Resumen: pedidos pendientes, ventas del mes, poco stock y últimos pedidos | 🔒 | HU-22 |
| `GET` | `/api/admin/productos` | Listar todos los productos, incluidos los inactivos | 🔒 | HU-18 |
| `POST` | `/api/admin/productos` | Crear un producto | 🔒 | HU-17 |
| `PUT` | `/api/admin/productos/{id}` | Editar un producto | 🔒 | HU-18 |
| `PATCH` | `/api/admin/productos/{id}/estado` | Dar de baja o reactivar un producto (baja lógica) | 🔒 | HU-18 |
| `POST` | `/api/admin/productos/{id}/imagenes` | Subir imágenes (JPG, PNG o WEBP, hasta 2 MB) | 🔒 | HU-17 |
| `DELETE` | `/api/admin/productos/{id}/imagenes/{id_imagen}` | Eliminar una imagen | 🔒 | HU-18 |
| `GET` | `/api/admin/categorias` | Listar todas las categorías | 🔒 | HU-19 |
| `POST` | `/api/admin/categorias` | Crear una categoría | 🔒 | HU-19 |
| `PUT` | `/api/admin/categorias/{id}` | Editar una categoría | 🔒 | HU-19 |
| `PATCH` | `/api/admin/categorias/{id}/estado` | Activar o desactivar una categoría (no se puede si tiene productos activos) | 🔒 | HU-19 |
| `GET` | `/api/admin/pedidos` | Listar pedidos, con filtros por estado y fecha | 🔒 | HU-20 |
| `GET` | `/api/admin/pedidos/{id}` | Ver el detalle de un pedido | 🔒 | HU-20 |
| `PATCH` | `/api/admin/pedidos/{id}/estado` | Cambiar el estado de un pedido: registra el historial y, si se cancela, repone el stock | 🔒 | HU-20, HU-14 |
| `GET` | `/api/admin/usuarios` | Listar usuarios, con búsqueda por nombre o correo | 🔒 | HU-21 |
| `PATCH` | `/api/admin/usuarios/{id}/estado` | Suspender o reactivar una cuenta | 🔒 | HU-21 |
| `GET` | `/api/admin/mensajes` | Ver los mensajes de contacto | 🔒 | HU-23 |

**Total:** 44 endpoints.

---

## Ejemplos de uso

### Registro — `POST /api/auth/register`

Petición:

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@correo.com",
  "telefono": "2235550000",
  "password": "Mate2026"
}
```

Respuesta `201 Created`:

```json
{ "ok": true, "data": { "id_usuario": 12, "nombre": "Juan", "rol": "cliente" } }
```

Respuesta `409 Conflict`:

```json
{ "ok": false, "error": "Ya existe una cuenta con ese correo" }
```

### Login de una cuenta suspendida — `POST /api/auth/login`

Respuesta `403 Forbidden`:

```json
{ "ok": false, "error": "Tu cuenta está suspendida. Contactanos para más información" }
```

### Crear pedido — `POST /api/pedidos`

Petición:

```json
{
  "id_metodo_entrega": 1,
  "id_metodo_pago": 1,
  "direccion_entrega": "Av. Colón 2450, La Perla, Mar del Plata",
  "telefono_contacto": "2235550000",
  "nota_cliente": "Es para regalo"
}
```

Respuesta `201 Created`:

```json
{
  "ok": true,
  "data": {
    "id_pedido": 1048,
    "estado": "Pendiente",
    "total": 96000,
    "instrucciones_pago": "Los datos de la cuenta se muestran al confirmar el pedido"
  }
}
```

Respuesta `409 Conflict` (stock insuficiente):

```json
{ "ok": false, "error": "No hay stock suficiente de: Mate Imperial Virola Combinada (disponibles: 1)" }
```

### Suspender una cuenta — `PATCH /api/admin/usuarios/{id}/estado`

Petición:

```json
{ "estado": "suspendido" }
```

Respuesta `200 OK`:

```json
{ "ok": true, "data": { "id_usuario": 12, "estado": "suspendido" } }
```
