<p align="center">
  <img src="client/img/logo.png" alt="Logo de Bagualero Mates" width="180">
</p>

<h1 align="center">Web Bagualero Mates</h1>
<p align="center"><i>Tienda web dinámica de artículos para el mate — “El mate bien criollo”</i></p>

---

## Sobre el proyecto

**Bagualero Mates** es un emprendimiento de Mar del Plata que vende mates, bombillas, bombillones, termos, yerberas, canastas materas y combos. Hoy la venta se hace por Instagram ([@bagualero.mates](https://www.instagram.com/bagualero.mates/)): cada consulta se responde por mensaje privado y cada pedido se coordina a mano.

**Web Bagualero Mates** es la tienda online del emprendimiento. Permite:

- Explorar el catálogo por categorías, con buscador y filtros.
- Ver el detalle de cada producto, con su precio y su stock.
- Crear una cuenta, armar un carrito y hacer pedidos con distintos métodos de pago y de entrega.
- Administrar productos, stock, pedidos y usuarios desde un panel propio.

La web funciona tanto **en el celular como en la computadora** (diseño responsive).

**Público objetivo:** personas mayores de 16 años que consumen mate o buscan un regalo, principalmente de Mar del Plata y la zona.

## Equipo de desarrollo

| Integrante | GitHub |
|---|---|
| Joaquín Gil | [@gilandresjoaquin-collab](https://github.com/gilandresjoaquin-collab) |
| Lautaro Gejo | [@lautigamerxd16-source](https://github.com/lautigamerxd16-source) |
| Luka Arauz | [@Lukaarauz](https://github.com/Lukaarauz) |

**Materia:** Proyecto e Implementación y Diseño de Web Dinámica — 7.° año, Técnico en Programación
**Institución:** E.E.S.T. N.° 2 — Mar del Plata
**Profesora:** Natalia Olea

## Documentación

| # | Documento | Contenido |
|---|---|---|
| 1 | [Documento de Visión](docs/01-documento-de-vision.pdf) | Problema, público objetivo, alcance y características del producto |
| 2 | [Historias de usuario](docs/02-historias-de-usuario.md) ([PDF](docs/02-historias-de-usuario.pdf)) | Backlog inicial con criterios de aceptación |
| 3 | [Stack tecnológico](docs/03-stack-tecnologico.md) | Tecnologías elegidas y su justificación |
| 4 | [Modelo Entidad-Relación](docs/04-modelo-entidad-relacion.md) | DER normalizado a 3FN |
| 5 | [Contrato de API](docs/05-contrato-api.md) | Endpoints del backend |
| 6 | [Wireframes](docs/wireframes/README.md) | Diseño de las pantallas principales (celular y PC) |
| 7 | [Backlog y tablero Kanban](docs/06-backlog-kanban.md) | Tareas priorizadas y asignadas por fase |

**Repositorio:** https://github.com/gilandresjoaquin-collab/web-bagualero-mates

**Tablero Kanban:** https://github.com/users/gilandresjoaquin-collab/projects/2

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | PHP (API REST) |
| Base de datos | MySQL / MariaDB |
| Entorno local | XAMPP |
| Control de versiones | Git + GitHub |

## Estructura del repositorio

```
web-bagualero-mates/
├── client/            → Frontend (lo que ve el usuario en el navegador)
│   ├── css/           → Hojas de estilo
│   ├── js/            → Lógica del lado del cliente (carrito, filtros, llamadas a la API)
│   ├── img/           → Logo e imágenes fijas del sitio
│   └── pages/         → Páginas HTML
├── server/            → Backend
│   ├── api/           → Endpoints de la API REST en PHP
│   ├── config/        → Configuración (config.example.php → copiar a config.php)
│   ├── database/      → Script SQL de creación de la base de datos
│   └── uploads/       → Imágenes de productos subidas desde el panel (no se versionan)
├── docs/              → Documentación del proyecto
├── .gitignore
└── README.md
```

## Cómo ejecutar el proyecto (en local)

> Guía preliminar: se completará a medida que avance el desarrollo.

1. Instalar [XAMPP](https://www.apachefriends.org/) e iniciar **Apache** y **MySQL**.
2. Clonar el repositorio dentro de la carpeta `htdocs` de XAMPP:
   ```bash
   git clone https://github.com/gilandresjoaquin-collab/web-bagualero-mates.git
   ```
3. Entrar a `http://localhost/phpmyadmin` e importar el script `server/database/bagualero_mates.sql`.
4. Copiar `server/config/config.example.php` como `server/config/config.php` y completar los datos de conexión.
5. Abrir `http://localhost/web-bagualero-mates/client/` en el navegador.

## Convenciones de trabajo

- **Ramas:** `main` (versión estable) y una rama por funcionalidad: `feature/catalogo`, `feature/carrito`, etc.
- **Commits:** mensajes cortos, en español y en infinitivo. Ejemplos: `Agregar tabla de productos al DER`, `Corregir validación del registro`.
- **Tareas:** cada tarea del tablero Kanban tiene responsable y se enlaza con su historia de usuario (HU-XX).
