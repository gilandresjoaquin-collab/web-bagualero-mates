-- =====================================================================
--  Web Bagualero Mates — Script de creación de la base de datos
--  Motor: MySQL / MariaDB (XAMPP) · Charset: utf8mb4
--  Normalización: Tercera Forma Normal (3FN)
--
--  Cómo usarlo: phpMyAdmin → Importar → seleccionar este archivo.
-- =====================================================================

DROP DATABASE IF EXISTS bagualero_mates;
CREATE DATABASE bagualero_mates CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bagualero_mates;

-- ---------------------------------------------------------------------
--  USUARIOS Y CUENTAS
-- ---------------------------------------------------------------------

CREATE TABLE usuarios (
    id_usuario      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(60)  NOT NULL,
    apellido        VARCHAR(60)  NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    telefono        VARCHAR(30)  NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             ENUM('cliente','administrador') NOT NULL DEFAULT 'cliente',
    estado          ENUM('activo','suspendido')     NOT NULL DEFAULT 'activo',
    fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE direcciones (
    id_direccion    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT UNSIGNED NOT NULL,
    calle           VARCHAR(100) NOT NULL,
    numero          VARCHAR(10)  NOT NULL,
    barrio          VARCHAR(60)  NULL,
    ciudad          VARCHAR(60)  NOT NULL DEFAULT 'Mar del Plata',
    referencias     VARCHAR(150) NULL,
    es_principal    TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT fk_direcciones_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CATÁLOGO
-- ---------------------------------------------------------------------

CREATE TABLE categorias (
    id_categoria    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(60)  NOT NULL UNIQUE,
    descripcion     VARCHAR(255) NULL,
    activa          TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE materiales (
    id_material     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_categoria    INT UNSIGNED  NOT NULL,
    sku             VARCHAR(30)   NOT NULL UNIQUE,
    nombre          VARCHAR(120)  NOT NULL,
    descripcion     TEXT          NULL,
    medidas         VARCHAR(80)   NULL,
    precio          DECIMAL(10,2) NOT NULL,
    stock           INT UNSIGNED  NOT NULL DEFAULT 0,
    destacado       TINYINT(1)    NOT NULL DEFAULT 0,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,      -- baja lógica
    fecha_alta      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_productos_precio CHECK (precio > 0),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
) ENGINE=InnoDB;

-- Relación N:M — un producto puede combinar varios materiales (ej.: calabaza + alpaca + cuero)
CREATE TABLE producto_material (
    id_producto     INT UNSIGNED NOT NULL,
    id_material     INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_producto, id_material),
    CONSTRAINT fk_pm_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto) ON DELETE CASCADE,
    CONSTRAINT fk_pm_material FOREIGN KEY (id_material)
        REFERENCES materiales(id_material)
) ENGINE=InnoDB;

CREATE TABLE producto_imagenes (
    id_imagen       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_producto     INT UNSIGNED NOT NULL,
    ruta            VARCHAR(255) NOT NULL,
    orden           TINYINT UNSIGNED NOT NULL DEFAULT 1,
    es_principal    TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_imagenes_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CARRITO
-- ---------------------------------------------------------------------

CREATE TABLE carrito_items (
    id_usuario      INT UNSIGNED NOT NULL,
    id_producto     INT UNSIGNED NOT NULL,
    cantidad        INT UNSIGNED NOT NULL DEFAULT 1,
    fecha_agregado  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_producto),
    CONSTRAINT chk_carrito_cantidad CHECK (cantidad > 0),
    CONSTRAINT fk_carrito_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_carrito_producto FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  PEDIDOS
-- ---------------------------------------------------------------------

CREATE TABLE metodos_entrega (
    id_metodo_entrega   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(40)  NOT NULL UNIQUE,
    descripcion         VARCHAR(150) NULL,
    requiere_direccion  TINYINT(1)   NOT NULL DEFAULT 0,
    activo              TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE metodos_pago (
    id_metodo_pago  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(40)  NOT NULL UNIQUE,
    instrucciones   VARCHAR(255) NULL,
    activo          TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE estados_pedido (
    id_estado       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(40) NOT NULL UNIQUE,
    orden           TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id_pedido           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT UNSIGNED NOT NULL,
    id_metodo_entrega   INT UNSIGNED NOT NULL,
    id_metodo_pago      INT UNSIGNED NOT NULL,
    id_estado           INT UNSIGNED NOT NULL,
    fecha_pedido        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    direccion_entrega   VARCHAR(255) NULL,   -- copia de la dirección al momento de la compra
    telefono_contacto   VARCHAR(30)  NOT NULL,
    nota_cliente        VARCHAR(255) NULL,
    CONSTRAINT fk_pedidos_usuario  FOREIGN KEY (id_usuario)        REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_pedidos_entrega  FOREIGN KEY (id_metodo_entrega) REFERENCES metodos_entrega(id_metodo_entrega),
    CONSTRAINT fk_pedidos_pago     FOREIGN KEY (id_metodo_pago)    REFERENCES metodos_pago(id_metodo_pago),
    CONSTRAINT fk_pedidos_estado   FOREIGN KEY (id_estado)         REFERENCES estados_pedido(id_estado)
) ENGINE=InnoDB;

-- Detalle: guarda el precio al momento de la compra (no cambia si después se modifica el producto)
CREATE TABLE detalle_pedido (
    id_pedido       INT UNSIGNED  NOT NULL,
    id_producto     INT UNSIGNED  NOT NULL,
    cantidad        INT UNSIGNED  NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT fk_detalle_pedido   FOREIGN KEY (id_pedido)   REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE historial_estados (
    id_historial    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_pedido       INT UNSIGNED NOT NULL,
    id_estado       INT UNSIGNED NOT NULL,
    fecha_cambio    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comentario      VARCHAR(255) NULL,
    CONSTRAINT fk_historial_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_historial_estado FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  SITIO INSTITUCIONAL
-- ---------------------------------------------------------------------

CREATE TABLE mensajes_contacto (
    id_mensaje      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(80)  NOT NULL,
    email           VARCHAR(120) NOT NULL,
    mensaje         TEXT         NOT NULL,
    fecha_envio     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido           TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  VISTA: total de cada pedido (se calcula, no se guarda → evita datos redundantes)
-- ---------------------------------------------------------------------

CREATE VIEW v_pedidos_totales AS
SELECT  p.id_pedido,
        SUM(d.cantidad * d.precio_unitario) AS total
FROM    pedidos p
JOIN    detalle_pedido d ON d.id_pedido = p.id_pedido
GROUP BY p.id_pedido;

-- =====================================================================
--  DATOS INICIALES
-- =====================================================================

INSERT INTO categorias (nombre, descripcion) VALUES
 ('Mates',       'Imperiales, camioneros, de calabaza, madera y más'),
 ('Bombillas',   'Bombillas y bombillones de alpaca y acero'),
 ('Termos',      'Termos de acero inoxidable'),
 ('Yerberas',    'Yerberas y azucareras'),
 ('Canastas',    'Canastas y bolsos materos'),
 ('Combos',      'Kits y combos armados');

INSERT INTO materiales (nombre) VALUES
 ('Calabaza'), ('Madera'), ('Cuero'), ('Alpaca'), ('Acero inoxidable'), ('Bronce'), ('Vidrio');

INSERT INTO metodos_entrega (nombre, descripcion, requiere_direccion) VALUES
 ('Envío a domicilio',  'Solo dentro de Mar del Plata',        1),
 ('Retiro',             'Sin cargo. Se envía la dirección',    0),
 ('Punto de encuentro', 'Sin cargo. Se coordina lugar y hora', 0);

INSERT INTO metodos_pago (nombre, instrucciones) VALUES
 ('Transferencia', 'Los datos de la cuenta se muestran al confirmar el pedido'),
 ('Efectivo',      'Se abona al recibir o retirar el pedido'),
 ('Tarjeta',       'Débito o crédito, se coordina al momento de la entrega');

INSERT INTO estados_pedido (nombre, orden) VALUES
 ('Pendiente', 1), ('Confirmado', 2), ('Enviado / Listo para retirar', 3), ('Entregado', 4), ('Cancelado', 5);

-- Usuario administrador inicial
--   Correo: admin@bagualeromates.com · Contraseña: Bagualero2026  (cambiarla al primer ingreso)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol) VALUES
 ('Luka', 'Arauz', 'admin@bagualeromates.com', '2230000000',
  '$2y$12$fmZnnKol.5AB0VI2ifgfseFXIf0.EJHzcUWGZCEuJdTzvula1VrXq', 'administrador');

-- Productos de ejemplo
INSERT INTO productos (id_categoria, sku, nombre, descripcion, medidas, precio, stock, destacado) VALUES
 (1, 'MAT-IMP-014', 'Mate Imperial Virola Combinada', 'Mate imperial de calabaza con virola combinada de alpaca y bronce, base forrada en cuero.', '9 cm alto x 8 cm diámetro', 50000, 4, 1),
 (1, 'MAT-CAM-007', 'Camionero Criollo Forrado en Cuero', 'Mate camionero de calabaza forrado en cuero crudo con costura artesanal.', '10 cm alto x 8 cm diámetro', 38500, 6, 0),
 (2, 'BOM-PDL-003', 'Bombillón Pico de Loro de Alpaca', 'Bombillón de alpaca con pico de loro y filtro desmontable.', '19 cm', 22000, 11, 1),
 (3, 'TER-ACE-001', 'Termo Acero Inoxidable 1 L', 'Termo de doble pared con pico cebador.', '1 litro', 45900, 3, 0);

INSERT INTO producto_material (id_producto, id_material) VALUES
 (1, 1), (1, 4), (1, 6), (1, 3),
 (2, 1), (2, 3),
 (3, 4),
 (4, 5);
