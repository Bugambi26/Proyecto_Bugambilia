-- Precio del ritual completo por línea (la clienta vende cada ritual completo a un precio).
ALTER TABLE "linea" ADD COLUMN "precio_ritual" DECIMAL(10,2);

-- Igual que producto.precio: si existe, debe ser mayor a 0.
ALTER TABLE "linea" ADD CONSTRAINT "linea_precio_ritual_positivo" CHECK ("precio_ritual" IS NULL OR "precio_ritual" > 0);
