-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('Shampoo', 'Mascarilla', 'Balsamo', 'Locion', 'CremaParaPeinar', 'Aceite');

-- CreateEnum
CREATE TYPE "TipoSucursal" AS ENUM ('Propia', 'Tercero');

-- CreateTable
CREATE TABLE "categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linea" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombre_ritual" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "linea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" SERIAL NOT NULL,
    "linea_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo_producto" "TipoProducto" NOT NULL,
    "ingredientes_protagonistas" TEXT NOT NULL,
    "beneficio_principal" TEXT NOT NULL,
    "contenido_neto" TEXT,
    "precio" DECIMAL(10,2),
    "imagen_url" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "necesidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "necesidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_necesidad" (
    "producto_id" INTEGER NOT NULL,
    "necesidad_id" INTEGER NOT NULL,

    CONSTRAINT "producto_necesidad_pkey" PRIMARY KEY ("producto_id","necesidad_id")
);

-- CreateTable
CREATE TABLE "pregunta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "es_inicial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcion" (
    "id" SERIAL NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "pregunta_siguiente_id" INTEGER,

    CONSTRAINT "opcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcion_necesidad" (
    "opcion_id" INTEGER NOT NULL,
    "necesidad_id" INTEGER NOT NULL,

    CONSTRAINT "opcion_necesidad_pkey" PRIMARY KEY ("opcion_id","necesidad_id")
);

-- CreateTable
CREATE TABLE "sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoSucursal" NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "telefono" TEXT,
    "whatsapp" TEXT,
    "foto_url" TEXT,

    CONSTRAINT "sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_apertura" TEXT NOT NULL,
    "hora_cierre" TEXT NOT NULL,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nombre_key" ON "categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "linea_nombre_key" ON "linea"("nombre");

-- CreateIndex
CREATE INDEX "linea_categoria_id_idx" ON "linea"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "producto_linea_id_nombre_key" ON "producto"("linea_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "necesidad_nombre_key" ON "necesidad"("nombre");

-- CreateIndex
CREATE INDEX "producto_necesidad_necesidad_id_idx" ON "producto_necesidad"("necesidad_id");

-- CreateIndex
CREATE INDEX "opcion_pregunta_id_idx" ON "opcion"("pregunta_id");

-- CreateIndex
CREATE INDEX "opcion_pregunta_siguiente_id_idx" ON "opcion"("pregunta_siguiente_id");

-- CreateIndex
CREATE INDEX "opcion_necesidad_necesidad_id_idx" ON "opcion_necesidad"("necesidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "sucursal_nombre_key" ON "sucursal"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "horario_sucursal_id_dia_semana_key" ON "horario"("sucursal_id", "dia_semana");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "linea" ADD CONSTRAINT "linea_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_linea_id_fkey" FOREIGN KEY ("linea_id") REFERENCES "linea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_necesidad" ADD CONSTRAINT "producto_necesidad_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_necesidad" ADD CONSTRAINT "producto_necesidad_necesidad_id_fkey" FOREIGN KEY ("necesidad_id") REFERENCES "necesidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion" ADD CONSTRAINT "opcion_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "pregunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion" ADD CONSTRAINT "opcion_pregunta_siguiente_id_fkey" FOREIGN KEY ("pregunta_siguiente_id") REFERENCES "pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion_necesidad" ADD CONSTRAINT "opcion_necesidad_opcion_id_fkey" FOREIGN KEY ("opcion_id") REFERENCES "opcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion_necesidad" ADD CONSTRAINT "opcion_necesidad_necesidad_id_fkey" FOREIGN KEY ("necesidad_id") REFERENCES "necesidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Restricciones agregadas a mano (Prisma no las expresa en schema.prisma)
-- ─────────────────────────────────────────────────────────────────────────────

-- Fase 5: stock entero >= 0; precio opcional, pero si existe debe ser > 0
ALTER TABLE "producto" ADD CONSTRAINT "producto_stock_no_negativo" CHECK ("stock" >= 0);
ALTER TABLE "producto" ADD CONSTRAINT "producto_precio_positivo" CHECK ("precio" IS NULL OR "precio" > 0);

-- Horario: día 1 (lunes) a 7 (domingo), horas "HH:mm" y apertura antes que cierre
ALTER TABLE "horario" ADD CONSTRAINT "horario_dia_semana_valido" CHECK ("dia_semana" BETWEEN 1 AND 7);
ALTER TABLE "horario" ADD CONSTRAINT "horario_formato_horas" CHECK (
  "hora_apertura" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
  "hora_cierre"   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
);
ALTER TABLE "horario" ADD CONSTRAINT "horario_apertura_antes_de_cierre" CHECK ("hora_apertura" < "hora_cierre");

-- Árbol del chatbot: a lo más una pregunta inicial (que haya exactamente una lo valida la app)
CREATE UNIQUE INDEX "pregunta_una_sola_inicial" ON "pregunta" ("es_inicial") WHERE "es_inicial";
