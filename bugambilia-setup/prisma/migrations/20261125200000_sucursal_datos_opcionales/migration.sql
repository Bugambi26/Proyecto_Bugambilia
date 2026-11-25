-- La dueña no publica la dirección de la estética: dirección y coordenadas pasan a ser opcionales.
ALTER TABLE "sucursal" ALTER COLUMN "direccion" DROP NOT NULL;
ALTER TABLE "sucursal" ALTER COLUMN "latitud" DROP NOT NULL;
ALTER TABLE "sucursal" ALTER COLUMN "longitud" DROP NOT NULL;

-- Las coordenadas van juntas: las dos o ninguna.
ALTER TABLE "sucursal" ADD CONSTRAINT "sucursal_coordenadas_completas" CHECK (("latitud" IS NULL) = ("longitud" IS NULL));

-- Perfil de Instagram de la sucursal (Kokoro tiene el suyo).
ALTER TABLE "sucursal" ADD COLUMN "instagram" TEXT;
