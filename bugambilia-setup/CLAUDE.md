# Proyecto Bugambilia — Contexto para Claude Code

Sitio web para **Bugambilia Hair Boutique**, una estética en Aguascalientes. Proyecto de estadía universitaria (UPA, Ingeniería en TIID). Equipo de 2: **Natalinchis** y **Miguelinchis**. Cierre de la estadía: **9 de diciembre de 2026**.

La documentación completa de diseño está en `docs/`. Antes de implementar un módulo, lee el documento de su fase. **No inventes datos del catálogo ni reglas de negocio**: si algo no está en `docs/`, pregunta.

## Forma de trabajar

- Responde y comenta en **español**.
- Trabaja **paso a paso**: antes de escribir mucho código, propón el plan breve del paso y espera confirmación. No implementes varios módulos de golpe.
- Si una decisión ya está tomada en `docs/`, no la reabras; si encuentras una contradicción o un hueco, avísalo antes de seguir.
- Se trabaja **directo en `main`**. Antes de cada commit/push: `npm run build` debe pasar. Si cambias `prisma/schema.prisma` o el seed, dilo explícitamente en el resumen para avisar al compañero.
- Nunca subas llaves. Todo secreto va en `.env` (ignorado por git); mantén `.env.example` actualizado sin valores.

## Stack (Fase 3, cerrado)

| Capa | Elección |
|---|---|
| Framework | Next.js full-stack (App Router, TypeScript): páginas públicas, panel admin y API en un solo proyecto. Route Handlers y Server Actions |
| Base de datos | PostgreSQL en **Neon**, ORM **Prisma** |
| Autenticación | **Better Auth** (correo + contraseña, recuperación de contraseña). Registro público desactivado; la única cuenta admin se crea en el seed |
| IA del chatbot | **Gemini** (familia Flash, plan gratuito) vía **AI SDK** (`generateObject`), con plantilla de respaldo |
| Correo | **Resend** (solo recuperación de contraseña) |
| Imágenes de productos y sucursales | **Cloudinary** (máx. 5 MB, JPG/PNG/WebP); en la BD solo se guarda la URL |
| Imágenes fijas del sitio | Carpeta `public/` |
| Hosting | **Netlify** (cada push a `main` despliega a producción) |
| Pruebas | **Vitest** solo para la regla de selección del chatbot; el resto, pruebas manuales |

Mapa de sucursales: **Leaflet + mosaicos de OpenStreetMap** (sin llave; elegido el 23 nov 2026). Componente `src/components/MapaSucursales.tsx`; las coordenadas salen de la base.

## Alcance

**Núcleo (obligatorio):**
- Presentación de la empresa (contenido fijo)
- Catálogo de productos capilares con ficha de producto; servicios faciales como contenido promocional fijo
- Mapa de sucursales con horario y contacto
- Login admin con recuperación de contraseña
- Panel con ABC de productos, stock e imágenes
- Chatbot de recomendación completo

**Extras (solo si sobra tiempo):** editor del árbol y de necesidades en el panel; ABC de sucursales en el panel; deslizador antes/después en servicios. Mientras no existan, esos datos vienen del seed.

**Fuera de alcance:** carrito, pagos, citas/agenda, registro de visitantes, formularios de contacto, guardar conversaciones del chatbot, historial/auditoría del inventario.

## Modelo de datos (diagrama ER, Crow's Foot)

- **CATEGORIA**(id, nombre) 1—N **LINEA**
- **LINEA**(id, categoria_id, nombre, nombre_ritual, descripcion) 1—N **PRODUCTO**
- **PRODUCTO**(id, linea_id, nombre, tipo_producto, ingredientes_protagonistas, beneficio_principal, contenido_neto, precio, imagen_url, stock, activo)
- **NECESIDAD**(id, nombre, descripcion)
- **PRODUCTO_NECESIDAD**(producto_id, necesidad_id) — N:M
- **PREGUNTA**(id, texto, es_inicial)
- **OPCION**(id, pregunta_id, texto, pregunta_siguiente_id?) — `pregunta_siguiente_id` nulo = fin del árbol
- **OPCION_NECESIDAD**(opcion_id, necesidad_id) — N:M
- **SUCURSAL**(id, nombre, tipo [propia | tercero], direccion, latitud, longitud, telefono, whatsapp, foto_url) 1—N **HORARIO**
- **HORARIO**(id, sucursal_id, dia_semana, hora_apertura, hora_cierre)
- **ADMINISTRADOR** del ER lo cubren las tablas que genera Better Auth (user, session, account, verification). No dupliques la entidad.

Restricciones de la Fase 5 (no cambian el ER):
- `tipo_producto` es un **enum**: Shampoo, Mascarilla, Balsamo, Locion, CremaParaPeinar, Aceite.
- `precio` y `contenido_neto` son **opcionales** (aún no los da la clienta); si faltan, la ficha no los muestra.
- Nombre de producto **único dentro de su línea** (no global: "Shampoo" se repite).
- Nombre de sucursal único. Stock entero ≥ 0.

## Catálogo (datos del seed)

**Fuente actual (21 nov 2026): los mockups aprobados con la dueña** (`../bugambilia-wireframes-html/js/data.js`), tomados de las etiquetas reales. Sustituyen al catálogo de 6 líneas / 20 productos de la Fase 4.

- 1 categoría con productos: **Capilares**. "Faciales" son servicios, no productos.
- **7 líneas y 21 productos** (3 por línea): Rubios Perfectos (Blonde Ritual), Cobres Brillantes (Copper Ritual), Hidratación (Hydra Ritual), Reestructurante (Repair Ritual), Crecimiento (Growth Ritual), Cotton Candy (**Sweet Ritual**), **Kit Antioxidante**. Nombres, beneficios, ingredientes por línea y descripciones: ver `prisma/seed.ts`.
- Contenido neto: 250 ml en todos. Fotos de producto en `public/img/productos/` (el seed guarda la ruta en `imagen_url`; las que suba el panel van a Cloudinary).
- Kit Antioxidante: ingrediente protagonista **Sábila** (confirmado 23 nov 2026).
- Pendientes: precios, servicios capilares, fotos del equipo/espacio y antes/después de faciales.
- Sucursales: **Estética Bugambilia** (propia) y **Kokoro** (tercero, con foto). Dirección, coordenadas, teléfono y horario aún no están: valores de ejemplo marcados con `// TODO: dato real de la clienta`.

## Chatbot (Fase 4)

**Necesidades (6):** cabello-rubio, cabello-cobrizo, hidratacion, reparacion, crecimiento, cuidado-integral. Cada producto lleva **una** necesidad, la de su línea (21 relaciones): Blonde → cabello-rubio, Copper → cabello-cobrizo, Hydra → hidratacion, Repair → reparacion, Growth → crecimiento, **Cotton Candy → hidratacion**, **Kit Antioxidante → cuidado-integral**. Las dos últimas quedaron **confirmadas por la clienta** (23 nov 2026).

**Árbol (2 preguntas):**
- P1 (inicial) "¿De qué tono es tu cabello?": Rubio → cabello-rubio; Cobrizo → cabello-cobrizo; Otro tono → (ninguna). Todas llevan a P2.
- P2 "¿Qué necesita principalmente tu cabello?": Hidratación, suavidad y nutrición → hidratacion; Reparación: está sensibilizado o procesado → reparacion; Crecimiento y fortalecimiento → crecimiento; Una rutina completa de cuidado → cuidado-integral; Otra necesidad → (ninguna). Todas llevan al fin.

**Regla de selección (sin IA, determinista; va en una función pura con pruebas Vitest):**
1. Productos con `activo = true` y `stock > 0` que tengan al menos una necesidad activa (OR).
2. Si no hay ninguno → mensaje de cita de diagnóstico + botón a Instagram; **no se llama a la IA**.
3. Agrupar por línea (ritual).
4. Orden: primero la línea de la necesidad de P1 (color), luego las de P2; entre varias de P2, la más específica (productos con menos etiquetas).
5. Máximo **2 rituales**.
6. Dentro del ritual, orden de rutina por `tipo_producto`: limpieza (Shampoo) → tratamiento (Mascarilla, Balsamo, Locion) → finalización (CremaParaPeinar, Aceite); empates por orden del catálogo.

Casos esperados (catálogo de 21 productos): Rubio+Reparación → Blonde + Repair; Rubio+Hidratación → Blonde + Hydra (Hydra y Cotton Candy empatan en especificidad; gana el orden del catálogo); Otro+Hidratación → Hydra + Cotton Candy; Otro+Rutina completa → Kit Antioxidante; Cobrizo+Otra → Copper; Otro+Otra → cita de diagnóstico.

**Redacción:** `generateObject` con esquema `{ introduccion, rituales: [{ id_linea, mensaje }] }`. Gemini solo escribe esos textos; las tarjetas de producto (nombre, beneficio, enlace) y la firma "Tu cabello. Tu ritual. Tu Bugambilia." las arma el código. Si los `id_linea` no coinciden (mismos y en el mismo orden), si Gemini falla, rebasa su límite o tarda más de 8 s → plantilla de respaldo. Prompt de sistema completo en `docs/fase-4-motor-chatbot.md`. Temperatura inicial 0.4, ~400 tokens. Solo se envían datos públicos del catálogo. Growth Ritual: nunca prometer resultados ni plazos de crecimiento.

Las necesidades de la conversación viven solo en la sesión del navegador; no se guarda nada.

## Panel admin (Fase 5)

- **Baja = desactivar** (`activo = false`), reactivable. Nunca se borra un producto. Listado con filtro Activos/Inactivos.
- Estados: activo con stock (disponible) · activo sin stock ("Agotado" en catálogo, excluido del chatbot) · inactivo (oculto en todo).
- **Alta:** obligatorios línea, nombre, tipo, ingredientes, beneficio, stock y **al menos una necesidad**; opcionales precio, contenido neto e imagen.
- **Cambio:** mismas validaciones del alta. Al reemplazar imagen, borrar la anterior de Cloudinary. Desactivar pide confirmación. Cambiar la línea muestra aviso de revisar las necesidades.
- **Stock:** un campo numérico con botones + y −; nunca menor a 0. Sin interruptor manual de "agotado".
- Líneas y categorías no se administran desde el panel (solo seed).
- **Árbol (extra)** — validar en cada cambio y rechazar si rompe una regla: (1) exactamente una pregunta inicial; (2) 2 a 6 opciones por pregunta; (3) sin ciclos; (4) toda pregunta alcanzable desde la inicial (solo avisa); (5) una opción puede tener 0 o más necesidades; (6) no borrar la pregunta inicial ni una a la que apunte una opción. Pregunta y opciones se crean en un solo formulario. Si el chatbot encuentra el árbol roto, muestra la cita de diagnóstico.
- **Necesidades (extra):** crear y editar libremente; eliminar solo si no están ligadas a productos u opciones.
- **Sucursales (extra):** eliminar = borrado físico con confirmación (borra horarios y foto). Latitud/longitud capturadas a mano con vista previa. Teléfono y WhatsApp de 10 dígitos (enlace `wa.me/52…`). Un rango de horario por día; días sin horario = "Cerrado".

## Plan (Fase 6)

| Semana | Entregable |
|---|---|
| S12 (19–22 nov) | **Juntos:** proyecto, esquema Prisma, Neon, seed, primer despliegue en Netlify |
| S13 (23–29 nov) | Natalinchis: presentación, catálogo, servicios, mapa · Miguelinchis: login, recuperación, ABC de productos |
| S14 (30 nov–6 dic) | Natalinchis: chatbot · Miguelinchis: extras · Ambos: pruebas cruzadas |
| S15 (7–9 dic) | Correcciones, dominio y entrega |

### Estado (23 nov 2026)

- **Hecho:** base S12 completa; sitio público con el diseño del mockup (inicio con servicios, catálogo con filtros, ficha, sucursales con mapa Leaflet). Desplegado en https://proyecto-bugambilia.netlify.app (aún privado).
- **Falta — Natalinchis:** el chatbot (S14, según `docs/fase-4-motor-chatbot.md` y `js/chatbot.js` del mockup).
- **Falta — Miguelinchis:** completar Better Auth (`src/lib/auth.ts` ya tiene email+contraseña sin registro; el admin ya existe en la base, sembrado desde `ADMIN_EMAIL`/`ADMIN_PASSWORD`), login y recuperación con Resend, panel ABC con Cloudinary (`next.config.ts` ya permite `res.cloudinary.com`), luego extras.
- **Pendiente de la clienta:** API key de Gemini (antes del 30 nov), dominio, datos reales de sucursales, precios, servicios capilares, textos y fotos de "Sobre Bugambilia".
- **Netlify:** plan gratuito con créditos por despliegue (quedan menos de 200 de 300). Juntar cambios y hacer pocos pushes; `npm run build` local antes de subir.
- **Base de datos:** una sola rama de Neon (`production`) para desarrollo y producción; el seed solo crea, nunca sobrescribe. Cualquier cambio de datos o esquema afecta al sitio publicado.

Si el panel ABC no termina en S13, se termina antes de los extras. Una pieza está terminada cuando cumple su documento de diseño, funciona en Netlify, se ve bien en celular y la probó el compañero.

## Identidad y tono del sitio

**El diseño está decidido con la dueña: seguir exactamente los mockups** de `../bugambilia-wireframes-html/` (sitio público y panel). El CSS del sitio público está portado tal cual en `src/app/bugambilia.css` con los mismos nombres de clase; no se usa Tailwind en el sitio público. Tipografías: Cormorant Garamond (títulos) + Jost (texto), locales en `src/app/fuentes/`. Colores, foto e ingrediente por línea: `src/lib/catalogo.ts`. El panel debe seguir `admin/*.html` y `css/admin.css` del mockup.

Datos que faltan: no se muestran placeholders como "[Precio]"; si un dato no existe, se oculta. Los botones del asistente ("Encuentra tu ritual", burbuja) llevan temporalmente al DM de Instagram hasta que exista el chatbot (S14): `ENLACE_ASISTENTE` en `src/lib/contacto.ts`.

Mensaje: lujo accesible, experiencia profesional, feminidad sofisticada; evitar lo clínico o genérico. Firma: "Tu cabello. Tu ritual. Tu Bugambilia." El chatbot habla de tú.

Next 16 tiene `cacheComponents` activo: toda consulta a la base va en un componente async con `await connection()` dentro de `<Suspense>` (ver `src/lib/datos-catalogo.ts`).
