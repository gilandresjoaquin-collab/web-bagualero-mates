# Historias de usuario — Backlog inicial

**Proyecto:** Web Bagualero Mates

Cada historia sigue el formato **Como** _[rol]_ **quiero** _[acción]_ **para** _[beneficio]_ y tiene sus **criterios de aceptación**. Los criterios son las condiciones que tienen que cumplirse para dar la historia por terminada.

**Roles:** Visitante (sin sesión) · Cliente (registrado) · Administrador

**Prioridad (MoSCoW):** 🔴 Imprescindible · 🟡 Importante · 🟢 Deseable

**Estimación:** puntos de historia (1 = muy simple · 2 = simple · 3 = media · 5 = compleja · 8 = muy compleja)

La columna **Característica** indica la característica del Documento de Visión (F-XX) de la que sale cada historia.

---

## Resumen del backlog

| ID | Historia | Rol | Prioridad | Puntos | Característica |
|---|---|---|---|---|---|
| HU-01 | Ver el catálogo de productos | Visitante | 🔴 | 3 | F-01 |
| HU-02 | Navegar por categorías | Visitante | 🔴 | 2 | F-02 |
| HU-03 | Buscar productos por nombre | Visitante | 🔴 | 2 | F-03 |
| HU-04 | Filtrar productos | Visitante | 🔴 | 3 | F-03 |
| HU-05 | Ver el detalle de un producto | Visitante | 🔴 | 2 | F-04 |
| HU-06 | Ver destacados y novedades en el inicio | Visitante | 🟡 | 2 | F-05, F-20 |
| HU-07 | Registrarme | Visitante | 🔴 | 3 | F-06 |
| HU-08 | Iniciar sesión | Cliente | 🔴 | 3 | F-07 |
| HU-09 | Cerrar sesión | Cliente | 🔴 | 1 | F-07 |
| HU-10 | Editar mi perfil y dirección | Cliente | 🟡 | 2 | F-08 |
| HU-11 | Agregar productos al carrito | Cliente | 🔴 | 3 | F-10 |
| HU-12 | Modificar el carrito | Cliente | 🔴 | 2 | F-10 |
| HU-13 | Finalizar la compra (checkout) | Cliente | 🔴 | 5 | F-11, F-12 |
| HU-14 | Comprar solo si hay stock | Cliente | 🔴 | 3 | F-13 |
| HU-15 | Ver mi historial de pedidos | Cliente | 🟡 | 2 | F-14 |
| HU-16 | Acceder al panel protegido | Administrador | 🔴 | 2 | F-09 |
| HU-17 | Cargar un producto nuevo | Administrador | 🔴 | 5 | F-15 |
| HU-18 | Editar y dar de baja productos | Administrador | 🔴 | 3 | F-15 |
| HU-19 | Gestionar categorías | Administrador | 🔴 | 2 | F-16 |
| HU-20 | Gestionar pedidos y sus estados | Administrador | 🔴 | 3 | F-17 |
| HU-21 | Suspender cuentas de usuario | Administrador | 🟡 | 2 | F-18 |
| HU-22 | Ver un resumen en el panel de control | Administrador | 🟡 | 3 | F-19 |
| HU-23 | Conocer el emprendimiento y contactarlo | Visitante | 🟡 | 2 | F-21 |
| HU-24 | Usar la web desde el celular | Visitante | 🔴 | 5 | F-22 |

**Total:** 24 historias · 65 puntos

---

## 1. Catálogo

### HU-01 — Ver el catálogo de productos
> **Como** visitante **quiero** ver el listado de productos disponibles **para** conocer todo lo que ofrece Bagualero Mates.

**Criterios de aceptación**

- Se muestran los productos activos en una grilla con imagen, nombre y precio.
- Los productos dados de baja no aparecen en el listado.
- El listado se pagina de a 12 productos.
- Los productos sin stock se muestran con la etiqueta “Sin stock” y sin el botón de compra.
- Si no hay productos, se muestra el mensaje “Todavía no hay productos cargados”.

### HU-02 — Navegar por categorías
> **Como** visitante **quiero** ver los productos agrupados por categoría (mates, bombillas, termos, etc.) **para** encontrar más rápido lo que busco.

**Criterios de aceptación**

- El menú muestra todas las categorías activas.
- Al elegir una categoría se listan solo los productos de esa categoría.
- La categoría seleccionada queda resaltada en el menú.

### HU-03 — Buscar productos por nombre
> **Como** visitante **quiero** buscar productos escribiendo su nombre **para** llegar directo a lo que me interesa.

**Criterios de aceptación**

- La búsqueda no distingue mayúsculas de minúsculas y encuentra coincidencias parciales (por ejemplo, “imperial” encuentra “Mate Imperial Virola Combinada”).
- Si no hay resultados, se muestra “No encontramos productos para «texto buscado»”.
- La búsqueda puede combinarse con los filtros de HU-04.

### HU-04 — Filtrar productos
> **Como** visitante **quiero** filtrar productos por categoría, material, rango de precio y disponibilidad **para** comparar opciones que se ajusten a lo que necesito.

**Criterios de aceptación**

- Se pueden aplicar varios filtros a la vez.
- El listado se actualiza sin recargar la página.
- Se puede ordenar por precio (menor a mayor y mayor a menor) y por más nuevos.
- El botón “Limpiar filtros” vuelve al listado completo.

### HU-05 — Ver el detalle de un producto
> **Como** visitante **quiero** ver la página de detalle de un producto **para** conocer sus fotos, material, medidas, precio y disponibilidad antes de comprar.

**Criterios de aceptación**

- Se muestran el nombre, las imágenes (con galería si hay más de una), la descripción, el material, las medidas, el precio y el stock.
- Si el producto no existe o está dado de baja, se muestra una página de “Producto no encontrado”.
- Si el visitante no inició sesión y toca “Agregar al carrito”, el sistema lo invita a iniciar sesión o registrarse.

### HU-06 — Ver destacados y novedades en el inicio
> **Como** visitante **quiero** ver en la página de inicio los productos destacados y los nuevos ingresos **para** enterarme de las novedades de la tienda.

**Criterios de aceptación**

- El inicio muestra una sección “Destacados”, con los productos que el administrador marcó como destacados.
- El inicio muestra una sección “Nuevos ingresos”, con los últimos productos cargados.
- El inicio muestra accesos directos a cada categoría.

---

## 2. Usuarios y cuentas

### HU-07 — Registrarme
> **Como** visitante **quiero** crear una cuenta con mis datos **para** poder hacer pedidos.

**Criterios de aceptación**

- Campos obligatorios: nombre, apellido, correo, teléfono y contraseña (con confirmación).
- El correo debe tener un formato válido y no puede estar registrado. Si ya existe, se muestra “Ya existe una cuenta con ese correo”.
- La contraseña tiene al menos 8 caracteres, con al menos una letra y un número.
- La contraseña se guarda cifrada con `password_hash`; nunca en texto plano.
- Las validaciones se hacen tanto en el navegador como en el servidor.
- Al registrarse, la cuenta queda creada con rol **cliente** y la sesión queda iniciada.

### HU-08 — Iniciar sesión
> **Como** cliente **quiero** iniciar sesión con mi correo y contraseña **para** acceder a mi carrito y a mis pedidos.

**Criterios de aceptación**

- Si los datos son correctos, se inicia la sesión y se redirige a la página anterior.
- Si los datos son incorrectos, se muestra “Correo o contraseña incorrectos”, sin aclarar cuál de los dos falló.
- Si la cuenta está suspendida, se rechaza el ingreso con el mensaje “Tu cuenta está suspendida. Contactanos para más información”.
- Si el usuario es administrador, se muestra el acceso al panel de administración.

### HU-09 — Cerrar sesión
> **Como** cliente **quiero** cerrar mi sesión **para** que nadie use mi cuenta desde el mismo dispositivo.

**Criterios de aceptación**

- Al cerrar sesión, la sesión se destruye en el servidor.
- Después de cerrar sesión no se puede volver a entrar a páginas privadas con el botón “atrás” del navegador.

### HU-10 — Editar mi perfil y dirección
> **Como** cliente **quiero** editar mis datos personales y mi dirección de entrega **para** no tener que escribirlos en cada compra.

**Criterios de aceptación**

- Se pueden modificar el nombre, el apellido, el teléfono y la dirección (calle, número, barrio, ciudad y referencias).
- El correo no se puede cambiar desde esta pantalla.
- Para cambiar la contraseña hay que ingresar la contraseña actual.
- Al guardar se muestra “Datos actualizados correctamente”.

---

## 3. Compra

### HU-11 — Agregar productos al carrito
> **Como** cliente **quiero** agregar productos al carrito **para** comprar varios productos en un mismo pedido.

**Criterios de aceptación**

- Desde el detalle del producto se elige la cantidad y se toca “Agregar al carrito”.
- No se puede agregar una cantidad mayor al stock disponible.
- El ícono del carrito muestra la cantidad total de productos.
- El carrito se mantiene aunque el cliente cierre el navegador y vuelva a entrar.

### HU-12 — Modificar el carrito
> **Como** cliente **quiero** cambiar las cantidades o quitar productos del carrito **para** ajustar mi compra antes de confirmarla.

**Criterios de aceptación**

- Se puede aumentar o disminuir la cantidad de cada producto, siempre sin superar el stock.
- Se puede quitar un producto del carrito.
- Los subtotales y el total se recalculan automáticamente.
- Si el carrito queda vacío, se muestra “Tu carrito está vacío” con un enlace al catálogo.

### HU-13 — Finalizar la compra (checkout)
> **Como** cliente **quiero** confirmar mi pedido eligiendo cómo recibirlo y cómo pagarlo **para** completar la compra de forma simple.

**Criterios de aceptación**

- **Métodos de entrega:** envío a domicilio (solo Mar del Plata), retiro o punto de encuentro.
- Si el cliente elige envío a domicilio, la dirección es obligatoria y se completa sola con la del perfil, aunque se puede cambiar.
- **Métodos de pago:** transferencia, efectivo o tarjeta.
- Antes de confirmar se muestra un resumen con los productos, las cantidades, el método de entrega, el método de pago y el total.
- Al confirmar, el pedido se guarda con estado **Pendiente**, con el precio de cada producto al momento de la compra, y el carrito se vacía.
- Al final se muestra el número de pedido y los próximos pasos (por ejemplo, los datos para la transferencia).

### HU-14 — Comprar solo si hay stock
> **Como** cliente **quiero** que el sistema controle el stock al comprar **para** no pagar por un producto que no está disponible.

**Criterios de aceptación**

- Al confirmar el pedido, el servidor vuelve a verificar el stock de cada producto.
- Si algún producto ya no alcanza, el pedido no se genera y se muestra qué producto quedó sin stock suficiente.
- Si el pedido se confirma, el stock se descuenta automáticamente.
- Si el administrador cancela un pedido, el stock se repone.

### HU-15 — Ver mi historial de pedidos
> **Como** cliente **quiero** ver mis pedidos anteriores y en qué estado están **para** hacer el seguimiento de mis compras.

**Criterios de aceptación**

- Se listan los pedidos del cliente con número, fecha, total y estado, del más reciente al más antiguo.
- Al entrar a un pedido se ven sus productos, las cantidades, los precios, el método de entrega y el método de pago.
- Un cliente solo puede ver sus propios pedidos.

---

## 4. Administración

### HU-16 — Acceder al panel protegido
> **Como** administrador **quiero** que el panel de administración solo sea accesible para mi rol **para** proteger la gestión de la tienda.

**Criterios de aceptación**

- Si alguien sin sesión intenta entrar a cualquier ruta del panel, se lo redirige al inicio de sesión.
- Si un cliente intenta entrar a una ruta del panel, se le muestra “Acceso denegado”.
- Los endpoints de la API del panel responden con error `403` si el usuario no es administrador.

### HU-17 — Cargar un producto nuevo
> **Como** administrador **quiero** dar de alta productos con sus datos e imágenes **para** mantener el catálogo actualizado.

**Criterios de aceptación**

- Campos: nombre, descripción, categoría, material, medidas, precio, stock, SKU, destacado (sí/no) e imágenes.
- Son obligatorios el nombre, la categoría, el precio y el stock. El precio debe ser mayor a 0 y el stock no puede ser negativo.
- El SKU no puede repetirse.
- Las imágenes deben ser JPG, PNG o WEBP de hasta 2 MB cada una.
- Al guardar, el producto aparece en el catálogo.

### HU-18 — Editar y dar de baja productos
> **Como** administrador **quiero** modificar los datos de un producto o darlo de baja **para** reflejar cambios de precio, stock o productos que dejo de vender.

**Criterios de aceptación**

- Se pueden editar todos los campos del producto.
- La baja es lógica: el producto deja de verse en la tienda, pero sigue guardado para no perder el historial de pedidos.
- Un producto dado de baja se puede volver a activar.
- Antes de dar de baja un producto, el sistema pide confirmación.

### HU-19 — Gestionar categorías
> **Como** administrador **quiero** crear, editar y desactivar categorías **para** organizar el catálogo.

**Criterios de aceptación**

- No puede haber dos categorías con el mismo nombre.
- No se puede desactivar una categoría que todavía tiene productos activos; en ese caso se muestra un aviso.

### HU-20 — Gestionar pedidos y sus estados
> **Como** administrador **quiero** ver todos los pedidos y cambiar su estado **para** organizar las entregas y los cobros.

**Criterios de aceptación**

- Los pedidos se listan y se pueden filtrar por estado y por fecha.
- Cada pedido muestra los datos del cliente, sus productos, el método de entrega, el método de pago y el total.
- **Estados posibles:** Pendiente → Confirmado → Enviado / Listo para retirar → Entregado. También se puede pasar a Cancelado.
- Cada cambio de estado se registra con su fecha.
- El cliente ve el nuevo estado en su historial (HU-15).

### HU-21 — Suspender cuentas de usuario
> **Como** administrador **quiero** poder suspender cuentas **para** mantener la seguridad del sitio.

**Criterios de aceptación**

- El administrador puede ver el listado de usuarios y buscar por nombre o por correo.
- Al suspender una cuenta, el sistema cambia el estado del usuario en la base de datos y rechaza su login con un mensaje descriptivo (ver HU-08).
- Una cuenta suspendida se puede reactivar.
- El administrador no puede suspender su propia cuenta.

### HU-22 — Ver un resumen en el panel de control
> **Como** administrador **quiero** ver un resumen al entrar al panel **para** saber rápido qué tengo que atender.

**Criterios de aceptación**

- Se muestra la cantidad de pedidos pendientes.
- Se muestran los últimos 5 pedidos.
- Se muestran los productos con poco stock (3 unidades o menos).
- Se muestra el total vendido en el mes, sin contar los pedidos cancelados.

---

## 5. Sitio institucional y experiencia de uso

### HU-23 — Conocer el emprendimiento y contactarlo
> **Como** visitante **quiero** conocer quién está detrás de Bagualero Mates y cómo contactarlo **para** confiar en la tienda y hacer consultas.

**Criterios de aceptación**

- Hay una sección “Nosotros” con la historia y la propuesta del emprendimiento.
- Se muestran los medios de contacto y un enlace a Instagram (@bagualero.mates).
- El formulario de contacto valida que estén completos el nombre, el correo y el mensaje.

### HU-24 — Usar la web desde el celular
> **Como** visitante **quiero** que la web se vea y funcione bien en mi celular **para** poder comprar desde cualquier lugar.

**Criterios de aceptación**

- Todas las pantallas, incluido el panel de administración, se ven correctamente desde 320 px de ancho, sin desplazamiento horizontal.
- En el celular el menú se convierte en un menú desplegable (“hamburguesa”).
- En el celular la grilla muestra 1 o 2 productos por fila; en la computadora, 3 o 4.
- Los botones y campos tienen un tamaño cómodo para usar con el dedo.
- Se probó en Chrome y Safari de celular y en Chrome, Firefox y Edge de escritorio.
