# Backlog y tablero Kanban

**Tablero:** https://github.com/users/lautigamerxd16-source/projects/4

Este documento tiene todas las tareas del proyecto, organizadas en 4 fases. Cada una tiene responsable, prioridad, estimación y la historia de usuario que resuelve (HU-XX).

## Configuración del tablero

**Columnas (campo _Status_):** `Backlog` → `Por hacer` → `En curso` → `En revisión` → `Terminado`

**Campos personalizados**

| Campo | Tipo | Valores |
|---|---|---|
| Prioridad | Selección única | 🔴 Alta · 🟡 Media · 🟢 Baja |
| Estimación | Número | Puntos (1, 2, 3, 5, 8) |
| Fase | Selección única | 1-Planificación · 2-Backend · 3-Frontend · 4-Pruebas y entrega |
| HU | Texto | Historias relacionadas |

**Responsables**

| Integrante | Usuario de GitHub | Foco principal |
|---|---|---|
| Joaquín Gil | @gilandresjoaquin-collab | Autenticación, usuarios, seguridad, panel de control |
| Lautaro Gejo | @lautigamerxd16-source | Maquetado responsive, catálogo, carrito, categorías |
| Luka Arauz | @Lukaarauz | Productos, pedidos, checkout, contenido del negocio |

---

## Fase 1 — Arquitectura y planificación · Estado: ✅ Terminado

| ID | Tarea | Responsable | Prioridad | Est. | HU |
|---|---|---|---|---|---|
| T01 | Redactar el Documento de Visión | Joaquín | 🔴 Alta | 3 | — |
| T02 | Escribir las historias de usuario con criterios de aceptación | Lautaro | 🔴 Alta | 3 | Todas |
| T03 | Documentar y justificar el stack tecnológico | Luka | 🔴 Alta | 2 | — |
| T04 | Diseñar el DER (3FN) y el script SQL | Joaquín | 🔴 Alta | 5 | Todas |
| T05 | Definir el contrato de API | Lautaro | 🔴 Alta | 3 | Todas |
| T06 | Diseñar los wireframes (celular y PC) | Luka | 🔴 Alta | 5 | HU-24 |
| T07 | Crear el repositorio: estructura, .gitignore y README | Joaquín | 🔴 Alta | 2 | — |
| T08 | Configurar el tablero Kanban y cargar el backlog | Lautaro | 🔴 Alta | 2 | — |

## Fase 2 — Base de datos y backend (PHP) · Estado: 📋 Por hacer

| ID | Tarea | Responsable | Prioridad | Est. | HU |
|---|---|---|---|---|---|
| T09 | Crear la base en XAMPP, conexión PDO y respuestas JSON comunes | Joaquín | 🔴 Alta | 3 | — |
| T10 | Estructura de la API: enrutador y manejo de errores | Joaquín | 🔴 Alta | 3 | — |
| T11 | Endpoint de registro con validaciones y `password_hash` | Joaquín | 🔴 Alta | 3 | HU-07 |
| T12 | Endpoints de login, logout y `/me` con sesiones; rechazar cuentas suspendidas | Joaquín | 🔴 Alta | 3 | HU-08, HU-09, HU-21 |
| T13 | Control de roles: la API del panel responde 403 si no es admin | Joaquín | 🔴 Alta | 2 | HU-16 |
| T14 | Endpoint del catálogo con búsqueda, filtros, orden y paginación | Luka | 🔴 Alta | 5 | HU-01 a HU-04 |
| T15 | Endpoints de detalle, destacados, novedades, categorías y materiales | Luka | 🔴 Alta | 3 | HU-02, HU-05, HU-06 |
| T16 | Endpoints del carrito (ver, agregar, modificar, quitar) validando stock | Lautaro | 🔴 Alta | 3 | HU-11, HU-12 |
| T17 | Endpoint para crear un pedido: transacción, control y descuento de stock | Luka | 🔴 Alta | 5 | HU-13, HU-14 |
| T18 | Endpoints de "mis pedidos" y detalle con historial | Lautaro | 🟡 Media | 2 | HU-15 |
| T19 | Endpoints de perfil, cambio de contraseña y direcciones | Joaquín | 🟡 Media | 3 | HU-10 |
| T20 | Admin: ABM de productos y carga de imágenes | Luka | 🔴 Alta | 5 | HU-17, HU-18 |
| T21 | Admin: ABM de categorías | Lautaro | 🔴 Alta | 2 | HU-19 |
| T22 | Admin: listado de pedidos y cambio de estado (con reposición de stock) | Luka | 🔴 Alta | 3 | HU-20 |
| T23 | Admin: listado de usuarios y suspender o reactivar cuentas | Joaquín | 🟡 Media | 2 | HU-21 |
| T24 | Admin: endpoint del panel de control | Joaquín | 🟡 Media | 3 | HU-22 |
| T25 | Endpoint del formulario de contacto | Lautaro | 🟡 Media | 1 | HU-23 |

## Fase 3 — Frontend (HTML, CSS y JS) · Estado: 📋 Por hacer

| ID | Tarea | Responsable | Prioridad | Est. | HU |
|---|---|---|---|---|---|
| T26 | Estilos base: paleta de la marca, tipografías, header, menú y footer responsive | Lautaro | 🔴 Alta | 5 | HU-24 |
| T27 | Página de inicio | Lautaro | 🟡 Media | 3 | HU-06 |
| T28 | Catálogo con filtros dinámicos y paginación (`fetch`) | Lautaro | 🔴 Alta | 5 | HU-01 a HU-04 |
| T29 | Página de detalle de producto con galería | Luka | 🔴 Alta | 3 | HU-05 |
| T30 | Carrito con cantidades y totales | Lautaro | 🔴 Alta | 3 | HU-11, HU-12 |
| T31 | Checkout: entrega, pago, resumen y confirmación | Luka | 🔴 Alta | 5 | HU-13, HU-14 |
| T32 | Login y registro con validaciones en el cliente | Joaquín | 🔴 Alta | 3 | HU-07, HU-08 |
| T33 | Mi cuenta: pedidos, datos y direcciones | Joaquín | 🟡 Media | 3 | HU-10, HU-15 |
| T34 | Panel de administración: estructura y panel de control | Joaquín | 🟡 Media | 3 | HU-16, HU-22 |
| T35 | Panel de administración: listado y formulario de productos | Luka | 🔴 Alta | 5 | HU-17, HU-18 |
| T36 | Panel de administración: pedidos, categorías y usuarios | Lautaro | 🔴 Alta | 5 | HU-19, HU-20, HU-21 |
| T37 | Páginas "Nosotros" y "Contacto" | Luka | 🟡 Media | 2 | HU-23 |

## Fase 4 — Integración, pruebas y entrega · Estado: 🗂️ Backlog

| ID | Tarea | Responsable | Prioridad | Est. | HU |
|---|---|---|---|---|---|
| T38 | Cargar los productos reales, con fotos y precios | Luka | 🟡 Media | 3 | — |
| T39 | Pruebas en celular y PC (Chrome, Firefox, Edge y Safari) | Lautaro | 🔴 Alta | 3 | HU-24 |
| T40 | Pruebas de seguridad: inyección SQL, XSS y acceso por rol | Joaquín | 🔴 Alta | 3 | HU-16 |
| T41 | Pruebas funcionales de punta a punta del flujo de compra | Luka | 🔴 Alta | 3 | HU-13, HU-14 |
| T42 | Completar el README con la guía de instalación final | Joaquín | 🟡 Media | 1 | — |
| T43 | Preparar la presentación final para el cliente | Lautaro | 🟡 Media | 2 | — |

---

## Resumen de carga por integrante

| Integrante | Tareas | Puntos |
|---|---|---|
| Joaquín Gil | 16 | 45 |
| Lautaro Gejo | 14 | 42 |
| Luka Arauz | 13 | 49 |
| **Total** | **43** | **136** |
