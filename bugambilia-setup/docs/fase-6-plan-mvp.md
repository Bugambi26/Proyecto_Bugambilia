# Proyecto Bugambilia — Fase 6: Plan de desarrollo del MVP

Cerrada el 19 de noviembre de 2026. Desarrollo en las semanas 12 a 15; cierre de la estadía el 9 de diciembre.

## 1. Alcance

**Núcleo (obligatorio):**
- Presentación de la empresa
- Catálogo de productos y servicios, con ficha de producto
- Mapa de sucursales con horarios y contacto
- Inicio de sesión con recuperación de contraseña
- Panel con el ABC de productos, stock e imágenes
- Chatbot completo: widget, regla de selección, Gemini y plantilla de respaldo

**Extras (solo si queda tiempo):**
- Editor del árbol del chatbot y de necesidades en el panel
- Alta, edición y eliminación de sucursales en el panel
- Deslizador de antes y después en los servicios

Sin los editores, el árbol, las necesidades y las sucursales vienen del seed.

## 2. Reparto (por módulo)

**Base común (ambos, S12):** proyecto Next.js, esquema Prisma, Neon, seed y primer despliegue en Netlify.

| Persona | Módulo |
| --- | --- |
| Natalinchis | Sitio público + chatbot: presentación, catálogo, servicios, mapa; widget, regla de selección, `/api/chatbot` con Gemini y plantilla |
| Miguelinchis | Panel admin: Better Auth con recuperación vía Resend; ABC de productos con stock e imágenes en Cloudinary; después, los extras |

## 3. Plan semanal

| Semana | Juntos | Natalinchis | Miguelinchis | Al cierre |
| --- | --- | --- | --- | --- |
| S12 (19–22 nov) | Proyecto, esquema, Neon, seed, despliegue | — | — | Sitio vacío desplegado con la base cargada |
| S13 (23–29 nov) | — | Presentación, catálogo con ficha, servicios, mapa | Login, recuperación, ABC de productos | Sitio público navegable y panel ABC funcionando |
| S14 (30 nov–6 dic) | Pruebas cruzadas | Chatbot | Extras | Núcleo completo en producción |
| S15 (7–9 dic) | Correcciones, dominio, entrega y aprobación | — | — | Sitio final con dominio |

- Si el panel ABC no termina en S13, se termina antes de los extras.
- Los extras son lo primero que se recorta.

## 4. Forma de trabajo

- Repositorio en una cuenta de GitHub del negocio; el equipo trabaja como colaborador.
- Llaves solo en variables de entorno de Netlify y `.env` local; `.env.example` sin valores.
- Directo a `main`: `npm run build` antes de cada push, `git pull` antes de empezar, avisar al compañero de cualquier cambio a `schema.prisma` o al seed.

## 5. Terminado y pruebas

Una pieza está terminada cuando cumple su documento de diseño, funciona en Netlify, se ve bien en celular y la probó el compañero.

Pruebas automatizadas con Vitest solo para la regla de selección del chatbot (casos de la tabla de la Fase 4). Pruebas manuales:

| Módulo | Casos clave |
| --- | --- |
| Chatbot | Combinaciones de la Fase 4; Gemini caído → plantilla; producto agotado → no se recomienda |
| Panel ABC | Alta sin necesidades → rechazo; desactivar → desaparece del catálogo y chatbot; stock 0 → "Agotado" |
| Árbol | Las 6 reglas de la Fase 5 |
| Acceso | Login; recuperación por correo; rutas del panel bloqueadas sin sesión |
| Sitio | Mapa con las 2 sucursales; horarios; botones de WhatsApp e Instagram |

## Pendientes con la clienta

- Dominio y API key de Gemini antes del 30 de noviembre.
- Precio y contenido neto de los 20 productos; imágenes.
- Ventas de Kokoro; datos reales de sucursales.
