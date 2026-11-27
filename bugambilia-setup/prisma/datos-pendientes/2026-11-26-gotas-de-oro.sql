-- "Gotas de Oro" (26 nov 2026): producto suelto, en su propia línea, INACTIVO hasta que
-- la clienta mande sus datos. Sirve para desarrollo y production; no duplica nada.
-- En production correrlo DESPUÉS de desplegar (si no, el sitio mostraría la línea vacía).
BEGIN;

INSERT INTO linea (categoria_id, nombre, nombre_ritual, descripcion, precio_ritual)
SELECT c.id, 'Gotas de Oro', 'Gotas de Oro', 'Pendiente: dato de la clienta.', NULL
FROM categoria c
WHERE c.nombre = 'Capilares'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO producto (linea_id, nombre, tipo_producto, ingredientes_protagonistas, beneficio_principal,
                      contenido_neto, imagen_url, stock, activo)
SELECT l.id, 'Gotas de Oro', 'Aceite'::"TipoProducto", 'Pendiente: dato de la clienta.',
       'Pendiente: dato de la clienta.', '50 ml', '/img/productos/gotas-de-oro.webp', 30, false
FROM linea l
WHERE l.nombre = 'Gotas de Oro'
ON CONFLICT (linea_id, nombre) DO NOTHING;

COMMIT;
