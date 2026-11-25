-- La estética atiende todos los días, solo con cita: en lugar de la tabla de horario se
-- muestra un texto. Columna opcional; las sucursales sin nota siguen con su tabla.
ALTER TABLE "sucursal" ADD COLUMN "nota_horario" TEXT;
