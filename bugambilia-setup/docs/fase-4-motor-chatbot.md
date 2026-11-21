# Proyecto Bugambilia — Fase 4: Motor de recomendación del chatbot

Cerrada el 27 de octubre de 2026.

> **Actualización (21 nov 2026), por el cambio de catálogo a 7 líneas y 21 productos (ver `catalogo-productos-y-servicios-bugambilia.md`):**
> - Las 6 necesidades, el árbol (sección 3), la regla de selección (sección 4) y la redacción con Gemini (sección 5) **no cambian**.
> - La tabla de la sección 2 queda sustituida: los beneficios son los de las etiquetas (`prisma/seed.ts`) y cada producto lleva **una** necesidad, la de su línea (**21 relaciones**): Blonde → `cabello-rubio`, Copper → `cabello-cobrizo`, Hydra → `hidratacion`, Repair → `reparacion`, Growth → `crecimiento`, **Cotton Candy (Sweet Ritual) → `hidratacion`**, **Kit Antioxidante → `cuidado-integral`**. Las dos últimas son propuesta según el mockup y están **pendientes de confirmar con la clienta**.
> - Casos esperados actualizados: Rubio + Reparación → Blonde (3) + Repair (3); Rubio + Hidratación → Blonde (3) + Hydra (3) (Hydra y Cotton Candy empatan en especificidad, gana el orden del catálogo); Otro tono + Hidratación → Hydra (3) + Cotton Candy (3); Otro tono + Rutina completa → Kit Antioxidante (3); Cobrizo + Otra → Copper (3); Otro tono + Otra → cita de diagnóstico.
> - Growth: el beneficio de la Loción Activadora ("Estimula el crecimiento y reduce la caída") es el texto de la etiqueta; la regla 3 del prompt sigue aplicando (Gemini solo usa esas palabras, sin prometer plazos).

El chatbot recomienda rituales capilares de Bugambilia con un árbol de 2 preguntas, 6 necesidades y una regla de selección sin IA; Gemini solo redacta los textos de conexión.

Principios:
- **Fidelidad al catálogo:** toda necesidad, beneficio y texto sale del catálogo o fue validado por la clienta.
- **Sin cambios al ER.**
- **Recomendación determinista:** los mismos datos de entrada producen siempre los mismos productos; la IA solo cambia la redacción.
- No se guardan conversaciones; las necesidades viven solo en la sesión.

## 1. Necesidades (lista cerrada)

| Clave | Nombre | Descripción | Línea de origen |
| --- | --- | --- | --- |
| `cabello-rubio` | Cabello rubio | Mantener luminosidad, brillo y tono equilibrado | Blonde Ritual |
| `cabello-cobrizo` | Cabello cobrizo | Conservar intensidad, brillo y apariencia saludable | Copper Ritual |
| `hidratacion` | Hidratación | Recuperar suavidad, luminosidad y nutrición | Hydra Ritual |
| `reparacion` | Reparación | Cabello sensibilizado, procesado o que requiere cuidado intensivo | Repair Ritual |
| `crecimiento` | Crecimiento y fortalecimiento | Cuidado del cuero cabelludo orientado al crecimiento y fortalecimiento del cabello | Growth Ritual |
| `cuidado-integral` | Cuidado integral | Rutina completa de limpieza, tratamiento y finalización | Cotton Candy |

- "Brillo" no es etiqueta independiente (va incluido en color e hidratación).
- Necesidades fuera del catálogo (frizz, caspa, caída, etc.) no se modelan; terminan en la cita de diagnóstico.

## 2. Beneficio principal (validado por la clienta) y etiquetado

25 relaciones en PRODUCTO_NECESIDAD: cada producto con la etiqueta de su línea + `hidratacion` en los 5 de Cotton Candy.

| # | Producto | Beneficio principal | Necesidades |
| --- | --- | --- | --- |
| 1 | Blonde · Shampoo Matizante | Limpia el cabello rubio y ayuda a mantener un tono equilibrado. | `cabello-rubio` |
| 2 | Blonde · Mascarilla Matizante | Tratamiento para cabello rubio que ayuda a conservar un tono equilibrado y luminoso. | `cabello-rubio` |
| 3 | Blonde · Crema para Peinar Antioxidante | Finaliza el peinado del cabello rubio con un acabado luminoso y brillante. | `cabello-rubio` |
| 4 | Copper · Shampoo Cobre | Limpia el cabello cobrizo y ayuda a conservar la intensidad de su tono. | `cabello-cobrizo` |
| 5 | Copper · Bálsamo Hidratante | Tratamiento hidratante para mantener el brillo y la apariencia saludable del cabello cobrizo. | `cabello-cobrizo` |
| 6 | Copper · Crema para Peinar | Finaliza el peinado del cabello cobrizo con un acabado brillante y de aspecto saludable. | `cabello-cobrizo` |
| 7 | Hydra · Shampoo Hidratante | Limpia el cabello mientras ayuda a recuperar su suavidad. | `hidratacion` |
| 8 | Hydra · Bálsamo Hidratante | Tratamiento que aporta nutrición y suavidad al cabello. | `hidratacion` |
| 9 | Hydra · Crema para Peinar | Finaliza el peinado con un cabello suave y luminoso. | `hidratacion` |
| 10 | Repair · Shampoo con Ácido Hialurónico | Limpieza pensada para cabello sensibilizado o procesado. | `reparacion` |
| 11 | Repair · Bálsamo con Células Madre | Tratamiento de cuidado intensivo para cabello sensibilizado o procesado. | `reparacion` |
| 12 | Repair · Crema para Peinar con Colágeno + Tres Aceites | Finaliza el peinado del cabello procesado como parte de su ritual de cuidado intensivo. | `reparacion` |
| 13 | Growth · Shampoo | Limpia el cuero cabelludo como primer paso de una rutina orientada al crecimiento y fortalecimiento del cabello. | `crecimiento` |
| 14 | Growth · Loción | Tratamiento para el cuero cabelludo, orientado al crecimiento y fortalecimiento del cabello. | `crecimiento` |
| 15 | Growth · Aceite | Tratamiento para el cuero cabelludo que complementa la rutina de crecimiento y fortalecimiento del cabello. | `crecimiento` |
| 16 | Cotton Candy · Shampoo | Primer paso del ritual integral: limpieza del cabello. | `cuidado-integral`, `hidratacion` |
| 17 | Cotton Candy · Mascarilla | Tratamiento del ritual integral con antioxidantes, hidratación, colágeno y elastina. | `cuidado-integral`, `hidratacion` |
| 18 | Cotton Candy · Bálsamo | Tratamiento del ritual integral para un cabello cuidado y nutrido. | `cuidado-integral`, `hidratacion` |
| 19 | Cotton Candy · Crema para Peinar | Finalización del ritual integral para un acabado cuidado. | `cuidado-integral`, `hidratacion` |
| 20 | Cotton Candy · Aceite | Último paso del ritual integral: finalización del cabello. | `cuidado-integral`, `hidratacion` |

## 3. Árbol de preguntas

**P1 (es_inicial = true): ¿De qué tono es tu cabello?**

| Opción | Lleva a | Activa |
| --- | --- | --- |
| Rubio | P2 | `cabello-rubio` |
| Cobrizo | P2 | `cabello-cobrizo` |
| Otro tono | P2 | — |

**P2: ¿Qué necesita principalmente tu cabello?**

| Opción | Lleva a | Activa |
| --- | --- | --- |
| Hidratación, suavidad y nutrición | Fin | `hidratacion` |
| Reparación: está sensibilizado o procesado | Fin | `reparacion` |
| Crecimiento y fortalecimiento | Fin | `crecimiento` |
| Una rutina completa de cuidado | Fin | `cuidado-integral` |
| Otra necesidad | Fin | — |

"Otro tono" + "Otra necesidad" → ninguna etiqueta → cita de diagnóstico.

## 4. Regla de selección (sin IA)

1. Entran los productos con `activo = true` y `stock > 0` que tengan al menos una de las necesidades activas (OR).
2. Si no queda ninguno: cita de diagnóstico con botón a Instagram; **no se llama a la IA**.
3. Agrupar por línea (ritual).
4. Orden: primero la línea que coincide con la necesidad de P1 (color), después las de P2 (objetivo). Si varias cubren el objetivo, primero la más específica (productos con menos etiquetas).
5. Máximo 2 rituales. Si un ritual quedó sin productos disponibles, se pasa al siguiente.
6. Dentro de cada ritual, orden de rutina por `tipo_producto`: limpieza (Shampoo) → tratamiento (Mascarilla, Bálsamo, Loción) → finalización (Crema para Peinar, Aceite). Empates: orden del catálogo.

| Tono + objetivo | Resultado esperado |
| --- | --- |
| Rubio + Reparación | Blonde (3) + Repair (3) = 6 productos |
| Rubio + Hidratación | Blonde (3) + Hydra (3) = 6; Cotton Candy fuera por el límite |
| Otro tono + Hidratación | Hydra (3) + Cotton Candy (5) = 8 productos |
| Cobrizo + Otra necesidad | Copper (3) |
| Otro tono + Otra necesidad | Cita de diagnóstico |

En el widget, cada ritual se muestra como una tarjeta con sus productos.

## 5. Redacción con Gemini y plantilla de respaldo

`generateObject` (AI SDK): Gemini solo escribe una introducción y un mensaje por ritual. Las tarjetas de producto (nombre, beneficio validado, enlace al detalle) y la firma de cierre las arma el código con datos de la base.

**Prompt de sistema:**

```text
Eres la asistente virtual de Bugambilia Hair Boutique. Tu única tarea es redactar,
en español y hablando de tú, los textos de una recomendación de productos capilares
a partir de los datos de CONTEXTO.

Reglas:
1. Habla solo de los rituales que aparecen en CONTEXTO, en el mismo orden. No menciones
   otros productos, marcas ni tratamientos faciales.
2. Usa únicamente la información de CONTEXTO (necesidades, descripción de cada línea,
   tipo de producto, ingredientes y beneficio principal). No inventes beneficios,
   ingredientes, precios, modos de uso, frecuencias ni resultados.
3. Para Growth Ritual, menciona sus beneficios solo con las palabras de su beneficio
   principal. No prometas resultados ni plazos de crecimiento.
4. No hagas diagnósticos ni des indicaciones médicas.
5. Tono: elegante, cálido, femenino y profesional, como una marca premium de salón.
   Evita sonar clínica, exagerada o publicitaria. Sin emojis.
6. Extensión: "introduccion" de máximo 2 oraciones que conecte con las necesidades;
   un "mensaje" de máximo 2 oraciones por ritual que explique por qué se ajusta.
7. Devuelve solo el objeto con el formato solicitado.
```

**Mensaje con el contexto** (lo arma el servidor; ejemplo rubio + reparación):

```text
CONTEXTO
Necesidades:
- Cabello rubio: mantener luminosidad, brillo y tono equilibrado.
- Reparación: cabello sensibilizado, procesado o que requiere cuidado intensivo.

Rituales (en orden):
1. [id_linea: 1] Rubios Perfectos — Blonde Ritual
   Descripción: <descripción de la línea>
   - Limpieza · Shampoo Matizante · aceite de pepita de uva · <beneficio principal>
   - Tratamiento · Mascarilla Matizante · aceite de pepita de uva · <beneficio principal>
   - Finalización · Crema para Peinar Antioxidante · aceite de pepita de uva · <beneficio principal>
2. [id_linea: 4] Reestructurante — Repair Ritual
   ...
```

**Esquema de salida y validación:**

```ts
const esquema = z.object({
  introduccion: z.string().max(300),
  rituales: z.array(z.object({
    id_linea: z.number(),
    mensaje: z.string().max(300),
  })),
});
// Si los id_linea no coinciden exactamente (mismos y en el mismo orden)
// con los enviados, se descarta la respuesta y se usa la plantilla.
```

**Plantilla de respaldo** (mismo esquema; si Gemini falla, rebasa su límite, tarda más de 8 s o la respuesta es inválida):

| Campo | Texto |
| --- | --- |
| introduccion | "Con base en lo que nos contaste, estos son los rituales que te recomendamos:" |
| mensaje (por ritual) | "{Nombre del ritual}: {descripción de la línea}" |
| cierre (fijo, con IA o sin ella) | "Tu cabello. Tu ritual. Tu Bugambilia." |

Parámetros iniciales (ajustar en pruebas): temperatura 0.4, ~400 tokens de salida, 8 s de espera. Solo se envían necesidades y datos públicos del catálogo.
