# Proyecto Bugambilia — Fase 3: Definición del stack técnico

Oct 27, 2026 · @Jochas

## Introducción

El Proyecto Bugambilia se construirá con Next.js full-stack, PostgreSQL y servicios en plan gratuito, con un costo mensual de 0 pesos más el dominio anual. Este documento registra cada decisión de la Fase 3, las alternativas evaluadas y la razón de la elección.

La Fase 3 se adelantó sin tener cerrados los mockups en alta fidelidad, porque el stack no depende del diseño visual sino de los requerimientos de la Fase 0 y del diagrama entidad-relación.

Criterios de selección:

- **Tiempo:** quedan unas 6 semanas de estadía (cierre el 9 de diciembre de 2026) y un equipo de 2 personas.
- **Costo:** el sitio debe operar sin pagos mensuales; el único gasto aceptado es el dominio.
- **Conocimiento previo:** priorizar tecnologías que el equipo ya domina (Next.js, React, SQL).
- **Uso comercial permitido:** el sitio es de un negocio, así que los planes gratuitos deben permitir uso comercial.
- **Continuidad:** dominio, cuentas y llaves a nombre de la clienta, para que el sitio no dependa del equipo al terminar la estadía.

## Resumen del stack

| Capa | Elección | Plan |
| --- | --- | --- |
| Framework (frontend + backend) | Next.js full-stack | Código propio |
| Base de datos | PostgreSQL en Neon, con Prisma como ORM | Gratuito |
| Autenticación del panel | Better Auth | Librería open source |
| IA del chatbot | Gemini (familia Flash) vía AI SDK, con respaldo de plantilla | Gratuito |
| Hosting de la app | Netlify | Gratuito (permite uso comercial) |
| Correo transaccional | Resend | Gratuito |
| Imágenes de productos | Cloudinary | Gratuito |
| Imágenes fijas del sitio | Carpeta `public` del proyecto | Sin costo |
| Dominio | Por definir, a nombre de la clienta | Pago anual |

## Decisión 1: Arquitectura general

Se eligió **Next.js full-stack**: páginas públicas, panel de administración y API viven en un solo proyecto y un solo despliegue. La lógica de servidor (inventario ABC y chatbot) se implementa con Route Handlers y Server Actions.

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Next.js full-stack (elegida)** | Un repositorio, un despliegue, buen SEO para el catálogo | — |
| Next.js + NestJS separados | Backend más estructurado | Dos proyectos, dos despliegues, CORS y tipos duplicados; no cabe en 6 semanas |
| HTML/CSS/JS estático + backend pequeño | Sin curva de aprendizaje | Panel admin y chatbot tediosos sin componentes; de todos modos requiere servidor para proteger la llave de la IA |

Justificación:

- El alcance es reducido: 20 productos, una cuenta admin, un chatbot y un mapa de sucursales.
- El renderizado en servidor mejora el posicionamiento del catálogo en buscadores.
- Los wireframes ya pasados a HTML se reutilizan como componentes de React con cambios mínimos.
- La llamada a la IA se hace desde una ruta del servidor, por lo que la API key nunca llega al navegador.

## Decisión 2: Base de datos

Se eligió **PostgreSQL con Prisma** como ORM. Los datos del proyecto son casi todos relacionales: productos con su categoría, la relación muchos a muchos entre productos y necesidades (base del chatbot), sucursales con horario por día y la cuenta admin.

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **PostgreSQL (elegida)** | Relaciones y muchos a muchos; columnas `jsonb` para el árbol del chatbot | — |
| MySQL | El equipo ya lo conoce | Menos opciones gratuitas administradas compatibles con el stack; manejo de JSON menos cómodo |
| MongoDB | El árbol cabe como documento anidado | El filtrado por etiquetas y el diagrama ER son relacionales; implementación y diseño quedarían desalineados |

Justificación:

- El árbol de decisión, editable desde el panel, puede guardarse como tabla de nodos con `parent_id` o como JSON, según convenga en la Fase 4.
- Prisma genera tipos de TypeScript y migraciones a partir del esquema, que sale casi directo del diagrama ER.
- La "Baja" del inventario ABC puede modelarse como desactivación (campo activo/inactivo) en lugar de borrado físico; la regla se cierra en la Fase 5.

## Decisión 3: Autenticación del panel

Se eligió **Better Auth**, una librería de TypeScript que corre dentro de la app y guarda los usuarios en la propia base de datos. Cubre los requisitos: una sola cuenta admin, correo y contraseña, recuperación de contraseña y sin registro público.

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Better Auth (elegida)** | Integración con Next.js y Prisma; usuarios en la base propia; recuperación de contraseña incluida | — |
| Auth.js (NextAuth) | La opción tradicional en Next.js | En modo mantenimiento: su equipo se unió a Better Auth en septiembre de 2025 y la v5 no recibirá funciones nuevas |
| Clerk o Supabase Auth | Componentes de login listos | Servicio externo adicional, con cuenta y límites propios, para una sola usuaria |
| Implementación propia (bcrypt + cookie firmada) | Control total | Recuperación de contraseña, expiración de tokens y protección de rutas quedarían a cargo del equipo, con mayor riesgo de fallas de seguridad |

Decisiones de implementación:

- **Registro desactivado:** la cuenta admin se crea con un script inicial (*seed*); nadie puede darse de alta desde el sitio.
- **Recuperación de contraseña:** el enlace de restablecimiento se envía por correo mediante Resend (Decisión 5).

## Decisión 4: IA del chatbot

Se eligió **Gemini en su plan gratuito, con un respaldo de plantilla**, integrado mediante el AI SDK. El objetivo es que el chatbot no tenga costo de operación y nunca deje al cliente sin respuesta.

El árbol de decisión hace la mayor parte del trabajo sin IA: genera las preguntas, convierte las respuestas en palabras clave y filtra los productos por etiquetas. La IA solo entra al final, con una llamada por consulta, para redactar la recomendación de forma natural sin salirse del catálogo filtrado.

| Alternativa | Costo | Motivo de la decisión |
| --- | --- | --- |
| **Gemini, plan gratuito (elegida)** | 0 | Sin tarjeta para los modelos Flash y Flash-Lite; límites suficientes para una estética local |
| Claude Haiku 5.5 | 0.10 / 0.50 USD por millón de tokens (entrada / salida) | Muy económico, pero sin plan gratuito |
| OpenAI GPT-5.4 nano | 0.20 USD por millón de tokens de entrada | Más caro en salida que Haiku 5.5 y sin plan gratuito |
| Modelo propio (p. ej. Ollama) | Servidor con memoria suficiente | El servidor cuesta más que cualquier API económica |

Respaldo de plantilla: si Gemini rebasa su límite, tarda demasiado o devuelve error, la ruta `/api/chatbot` arma la respuesta con un texto predefinido y los mismos productos que filtró el árbol. La recomendación es idéntica; solo cambia la redacción.

```ts
const productos = await filtrarPorEtiquetas(necesidades); // nunca usa IA

try {
  return await generarConGemini(necesidades, productos);
} catch {
  return armarConPlantilla(necesidades, productos);
}
```

Si el árbol no encuentra productos para las necesidades del cliente, no se llama a la IA: se muestra el mensaje de cita de diagnóstico con el botón a Instagram.

Consideraciones:

- El AI SDK permite cambiar de proveedor modificando una línea, por si la clienta quiere más calidad o volumen en el futuro.
- En el plan gratuito, Google puede usar el contenido enviado para mejorar sus productos. Solo se envían palabras clave y datos públicos del catálogo, nunca datos personales del cliente, y no se guardan conversaciones.

## Decisión 5: Hosting y servicios

Se eligieron **Netlify** (app), **Neon** (PostgreSQL), **Resend** (correo) y **Cloudinary** (imágenes), todos en plan gratuito. El factor decisivo fue el uso comercial: el plan gratuito de Vercel (Hobby) está restringido a uso personal no comercial, y el sitio de un negocio requeriría su plan Pro de 20 USD por usuario al mes.

| Servicio | Uso en el proyecto | Plan gratuito | Alternativa descartada |
| --- | --- | --- | --- |
| **Netlify** | Hosting de la app Next.js | Permite uso comercial | Vercel Hobby (no comercial); Cloudflare (requiere adaptador para Next.js y puede dar problemas con Prisma) |
| **Neon** | Base de datos PostgreSQL administrada | 0.5 GB de almacenamiento y 100 horas de cómputo al mes por proyecto | — |
| **Resend** | Correo de recuperación de contraseña | 3,000 correos al mes, máximo 100 al día | — |
| **Cloudinary** | Fotos de productos subidas desde el panel | 25 créditos al mes (1 crédito = 1 GB de almacenamiento, 1 GB de ancho de banda o 1,000 transformaciones) | Netlify Blobs (sin URLs públicas; consume los mismos créditos que el sitio) |

Detalles de implementación:

- **Neon:** la base se suspende cuando no hay actividad, por lo que la primera consulta después de un rato puede tardar uno o dos segundos más.
- **Cloudinary:** optimiza y redimensiona las fotos automáticamente. El panel limitará el tamaño máximo de archivo (por ejemplo, 5 MB) y en la base solo se guarda la URL de la imagen.
- **Imágenes fijas** (logo, banner, antes/después de servicios): van en la carpeta `public` del proyecto, sin servicio externo.

## Dominio y titularidad de cuentas

El dominio y todas las cuentas de servicios quedarán a nombre de la clienta. Así el sitio sigue funcionando después de la estadía sin depender del equipo de desarrollo.

- **Dominio:** es la dirección del sitio (por ejemplo, `bugambiliahair.com`) y se renta por año. Sin dominio propio el sitio funcionaría en una dirección como `bugambilia.netlify.app`, pero Resend necesita un dominio verificado para enviar correos de forma confiable. Al comparar registradores se debe revisar el precio de renovación, no solo el del primer año, y activar la renovación automática.
- **Terminación:** `.com` suele ser la más económica; `.com.mx` o `.mx` da identidad mexicana a un costo algo mayor. Queda por decidir con la clienta.
- **Cuentas de servicios** (Netlify, Neon, Resend, Cloudinary y la API key de Gemini): se crean con un correo del negocio y el equipo participa como colaborador.

## Diagrama de arquitectura

&#91;embedded content: arquitectura · 1 app, 4 servicios externos\]

Visitantes y administradora solo hablan con la app de Netlify; la app es la única que se conecta a la base de datos, a la IA, al correo y a las imágenes, así que ninguna llave sale del servidor.

## Costos estimados

El costo de operación mensual es de 0 pesos; el único gasto es el dominio, que se paga una vez al año y cuyo monto exacto queda pendiente de elegir registrador y terminación.

| Concepto | Costo |
| --- | --- |
| Netlify, Neon, Resend, Cloudinary | 0 (planes gratuitos) |
| Gemini | 0 (plan gratuito) |
| Better Auth, Prisma, AI SDK, Next.js | 0 (open source) |
| Dominio | Pago anual, por cotizar |

Si en el futuro la clienta prefiere un modelo de IA de pago, con Claude Haiku 5.5 una recomendación de unos 3,000 tokens de entrada y 300 de salida costaría menos de 0.001 USD; mil consultas al mes saldrían en menos de un dólar.

## Riesgos y mitigaciones

El riesgo principal de un stack gratuito es que los proveedores cambien sus límites; cada pieza tiene una salida que no exige rehacer el sistema.

| Riesgo | Mitigación |
| --- | --- |
| Google reduce los límites del plan gratuito de Gemini (ya los recortó en abril de 2026) | Respaldo de plantilla; con el AI SDK se cambia a un modelo de pago en una línea |
| Se agotan los créditos gratuitos de Netlify y el sitio se pausa | El tráfico esperado de una estética local está muy por debajo del límite; las imágenes de productos van a Cloudinary para no consumir esos créditos |
| La base de Neon tarda en despertar tras inactividad | Retraso de uno o dos segundos solo en la primera consulta; aceptable para este tráfico |
| Neon o algún proveedor cambia sus condiciones | PostgreSQL y Prisma son portables: migrar la base es un respaldo, una restauración y un cambio de cadena de conexión |
| El sitio depende de cuentas del equipo al terminar la estadía | Dominio, cuentas y llaves a nombre de la clienta desde el inicio |

## Pendientes con la clienta

- [ ] Elegir y comprar el dominio a su nombre, con renovación automática
- [ ] Crear un correo del negocio para dar de alta las cuentas de los servicios
- [ ] Crear la API key de Gemini desde la cuenta del negocio
- [ ] Compartir la información de los 20 productos capilares (uso, tipo de cabello, problema que atiende) para etiquetarlos en la Fase 4
- [ ] Compartir las imágenes pendientes para cerrar los mockups en alta fidelidad

## Referencias

Consultadas el 27 de octubre de 2026.

- [Vercel — Fair Use Guidelines (uso comercial del plan Hobby)](https://vercel.com/docs/limits/fair-use-guidelines)
- [Vercel vs Netlify — uso comercial en planes gratuitos](https://agentdeals.dev/vercel-vs-netlify)
- [Auth.js en modo mantenimiento y Better Auth](https://auxiliar-ai.pages.dev/auth/)
- [Gemini API — plan gratuito, octubre 2026](https://apidog.com/blog/gemini-api-free-tier/)
- [Gemini API — cambios de abril 2026 al plan gratuito](https://agentdeals.dev/gemini-api-pricing-changes)
- [Claude Haiku 5.5 — precios](https://www.vktr.com/ai-platforms/anthropic-cuts-smallmodel-pricing-90-with-claude-haiku-55/)
- [OpenAI API — precios 2026](https://morphllm.com/openai-api-pricing)
- [Neon — plan gratuito](https://www.jetadmin.io/blog/neon-review/)
- [Resend — precios](https://www.usecarly.com/blog/resend-pricing/)
- [Cloudinary — plan gratuito y créditos](https://cloudinary.com/documentation/developer_onboarding_faq.md)
- [Netlify Blobs vs Vercel Blob](https://www.netlify.com/knowledge-base/netlify-blobs-vs-vercel-blob/)
