# Proyecto Bugambilia — Fase 4: Motor de recomendación del chatbot

Oct 27, 2026 · @Jochas

## Introducción

El chatbot recomienda rituales capilares de Bugambilia con un árbol de 2 preguntas, 6 necesidades y una regla de selección sin IA; Gemini solo redacta los textos de conexión. Este documento registra cada decisión de la Fase 4, las alternativas evaluadas y la razón de la elección.

Decisiones previas que acotan esta fase (Fases 0, 1 y 3):

- El árbol de decisión hace las preguntas, convierte las respuestas en necesidades y filtra los productos por etiquetas, sin IA.
- La IA (Gemini, plan gratuito, vía AI SDK) se llama una sola vez por consulta, al final, y tiene un respaldo de plantilla.
- El árbol es editable desde el panel admin con las entidades PREGUNTA, OPCION, NECESIDAD, OPCION\_NECESIDAD y PRODUCTO\_NECESIDAD.
- El chatbot recomienda solo productos capilares. Si ninguno cubre la necesidad, sugiere una cita de diagnóstico con un botón a Instagram.
- No se guardan conversaciones; las necesidades viven solo en la sesión.

Criterios de diseño:

- **Fidelidad al catálogo:** toda necesidad, beneficio y texto sale del catálogo o fue validado por la clienta.
- **Sin cambios al ER:** el motor funciona con las entidades y atributos ya modelados.
- **Recomendación determinista:** los mismos datos de entrada producen siempre los mismos productos; la IA solo cambia la redacción.
- **Editable por la dueña:** preguntas, opciones y etiquetas se administran desde el panel.

## Resumen del motor

| Pieza | Decisión |
| --- | --- |
| Necesidades | 6 etiquetas agrupadas en dos dimensiones: color (rubio, cobrizo) y condición (hidratación, reparación, crecimiento, cuidado integral) |
| Beneficio por producto | Redactado a partir de la línea y la función del producto; validado por la clienta |
| Etiquetado | 25 relaciones: cada producto con la etiqueta de su línea + `hidratacion` en los 5 de Cotton Candy |
| Árbol | 2 preguntas fijas: tono (P1) y objetivo (P2); 2 clics por consulta |
| Selección | OR por necesidad, activos con stock; máximo 2 rituales (color primero, luego objetivo por especificidad); productos en orden de rutina |
| Redacción | Salida estructurada: Gemini escribe introducción y un mensaje por ritual; las tarjetas de producto las arma el código |
| Respaldo | Plantilla con el mismo esquema y textos del catálogo |
| Cierre | Firma de marca fija: "Tu cabello. Tu ritual. Tu Bugambilia." |

## Decisión 1: Lista cerrada de necesidades

Se eligió una **lista de 6 necesidades agrupadas**, tomadas literalmente de la descripción de cada línea del catálogo. Las necesidades se separan en dos dimensiones: el color del cabello y su condición u objetivo.

| Clave | Nombre | Descripción | Línea de origen |
| --- | --- | --- | --- |
| `cabello-rubio` | Cabello rubio | Mantener luminosidad, brillo y tono equilibrado | Blonde Ritual |
| `cabello-cobrizo` | Cabello cobrizo | Conservar intensidad, brillo y apariencia saludable | Copper Ritual |
| `hidratacion` | Hidratación | Recuperar suavidad, luminosidad y nutrición | Hydra Ritual |
| `reparacion` | Reparación | Cabello sensibilizado, procesado o que requiere cuidado intensivo | Repair Ritual |
| `crecimiento` | Crecimiento y fortalecimiento | Cuidado del cuero cabelludo orientado al crecimiento y fortalecimiento del cabello | Growth Ritual |
| `cuidado-integral` | Cuidado integral | Rutina completa de limpieza, tratamiento y finalización | Cotton Candy |

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Agrupada, 6 etiquetas (elegida)** | Cada etiqueta es una necesidad distinta y aprovecha la relación muchos a muchos | — |
| Granular, ≈14 etiquetas | La más fiel al texto palabra por palabra | Etiquetas repetidas entre líneas (brillo, luminosidad) que no discriminan; árbol y panel pesados |
| Una etiqueta por línea | La más simple | La etiqueta sería sinónimo de `id_linea` y PRODUCTO\_NECESIDAD sobraría |

Decisiones de detalle:

- **"Brillo" no es etiqueta independiente.** En Blonde y Copper el brillo depende del color; como etiqueta suelta haría que a quien no tiene cabello rubio se le recomendara un matizante. El brillo queda incluido en las etiquetas de color y de hidratación.
- **Necesidades fuera del catálogo** (frizz, cabello graso o seco, caspa, caída, puntas abiertas) no se modelan. Esos casos terminan en la cita de diagnóstico.

## Decisión 2: Beneficio por producto y etiquetado

Cada producto lleva la etiqueta de su línea, y los 5 de Cotton Candy llevan además `hidratacion`: **25 relaciones** en PRODUCTO\_NECESIDAD. El beneficio principal de cada producto se redactó con una regla fija y la clienta lo validó.

**Regla del beneficio:** función del producto en la rutina + objetivo de la línea según el catálogo. La función sigue la descripción de Cotton Candy: el shampoo es limpieza; la mascarilla, el bálsamo y la loción son tratamiento; la crema para peinar y el aceite son finalización. No se añadieron beneficios nuevos ni se atribuyeron efectos a los ingredientes.

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

| Alternativa de etiquetado | Ventaja | Motivo de la decisión |
| --- | --- | --- |
| Solo la etiqueta de la línea (20 relaciones) | La más literal | Quien busca hidratación nunca vería Cotton Candy, aunque el catálogo la declara entre sus activos |
| **Línea + `hidratacion` en Cotton Candy (elegida)** | Respaldo explícito del catálogo; Cotton Candy no depende de un color | — |
| Además `hidratacion` en Copper · Bálsamo Hidratante (26) | Aprovecha el nombre del producto | Asociaría un producto de color a una necesidad general; para quien es cobrizo ya aparece por su color |

Growth Ritual: la clienta validó el uso de la palabra "crecimiento" y confirmó que la loción y el aceite se aplican en el cuero cabelludo. Los textos se mantienen en la forma "orientado al crecimiento", sin promesas de resultado ni plazos.

## Decisión 3: Árbol de preguntas

Se eligió un **árbol de 2 preguntas fijas**: P1 pregunta el tono y P2 el objetivo, así que toda consulta toma 2 clics. El visitante elige una opción por pregunta; cada opción activa cero o más necesidades (OPCION\_NECESIDAD) y lleva a otra pregunta o al final (`id_pregunta_siguiente`).

**P1 (es\_inicial = verdadero): ¿De qué tono es tu cabello?**

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

Si el visitante elige "Otro tono" y "Otra necesidad", no se activa ninguna etiqueta y el chatbot sugiere la cita de diagnóstico.

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Dos preguntas fijas: tono + objetivo (elegida)** | Combina color y condición (por ejemplo, rubio con cabello procesado); fácil de editar para la dueña | — |
| Árbol ramificado por objetivo | Rutas cortas que suelen llevar a una sola línea | No combina color con condición: quien es rubia y tiene el cabello procesado debe elegir entre su tono y su daño |
| Preguntar el tipo de producto | Permitiría pedir solo un shampoo o un tratamiento | El tipo de producto no es una necesidad; requeriría cambiar el ER |

## Decisión 4: Regla de selección

Se eligió **recomendar por ritual**: se muestran máximo 2 líneas completas, primero la del color y después la del objetivo, con sus productos en orden de rutina. El paso no usa IA y da siempre el mismo resultado para las mismas respuestas.

1. Entran los productos con `activo = verdadero` y `stock > 0` que tengan al menos una de las necesidades activas (OR).
2. Si no queda ninguno, se muestra la cita de diagnóstico con el botón a Instagram y no se llama a la IA.
3. Los productos se agrupan por línea (ritual).
4. Las líneas se ordenan: primero la que coincide con la necesidad de P1 (color), después las de P2 (objetivo). Si varias líneas cubren el objetivo, va primero la más específica, es decir, la de productos con menos etiquetas.
5. Se toman máximo 2 rituales. Si un ritual quedó sin productos disponibles, se pasa al siguiente.
6. Dentro de cada ritual, los productos van en orden de rutina según `tipo_producto`: limpieza (shampoo) → tratamiento (mascarilla, bálsamo, loción) → finalización (crema para peinar, aceite). Dentro del mismo paso, se respeta el orden del catálogo.

Por qué no se ordena por número de coincidencias: con este árbol se activan como máximo 2 necesidades (una de color y una de objetivo) y ningún producto tiene ambas. Todos empatarían con 1, y exigir todas las necesidades (AND) dejaría vacía cualquier combinación de color + objetivo. La especificidad y el paso de rutina se calculan con datos que ya existen, sin cambiar el ER.

| Tono + objetivo | Resultado |
| --- | --- |
| Rubio + Reparación | Blonde (3) + Repair (3) = 6 productos |
| Rubio + Hidratación | Blonde (3) + Hydra (3) = 6; Cotton Candy queda fuera por el límite |
| Otro tono + Hidratación | Hydra (3) + Cotton Candy (5) = 8 productos |
| Cobrizo + Otra necesidad | Copper (3) |
| Otro tono + Otra necesidad | Cita de diagnóstico |

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Por ritual, máximo 2 (elegida)** | Coincide con la marca ("Tu ritual"); nunca mezcla líneas en una rutina | — |
| Los 3 mejores productos individuales | Respuesta siempre corta | Mezcla líneas sin respaldo del catálogo y elige al azar entre empates |
| Todos los coincidentes, ordenados | La regla más simple | Hasta 11 productos en un widget de chat y más contexto enviado a Gemini |

Productos agotados: se excluyen. El stock es global, así que un producto agotado no se puede comprar en ninguna de las dos sucursales. En el widget, cada ritual se muestra como una tarjeta con sus productos y no como una lista suelta.

## Decisión 5: Redacción con Gemini y plantilla de respaldo

Se eligió **salida estructurada**: con `generateObject` del AI SDK, Gemini solo escribe una introducción y un mensaje por ritual. Las tarjetas de producto (nombre, beneficio validado, enlace al detalle) y la firma de cierre las arma el código con datos de la base, así que ningún texto validado pasa por la IA.

| Alternativa | Ventaja | Motivo para descartarla |
| --- | --- | --- |
| **Salida estructurada (elegida)** | Nombres, beneficios y enlaces fijos; el código valida la respuesta; la plantilla llena el mismo esquema | — |
| Texto libre de Gemini | Redacción más natural y fácil de implementar | El modelo puede parafrasear beneficios o agregar afirmaciones; los enlaces habría que extraerlos del texto; la plantilla se vería distinta |

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

**Mensaje con el contexto** (lo arma el servidor; ejemplo con rubio + reparación):

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

**Plantilla de respaldo** (mismo esquema; se usa si Gemini falla, rebasa su límite, tarda más de 8 s o devuelve una respuesta inválida):

| Campo | Texto |
| --- | --- |
| introduccion | "Con base en lo que nos contaste, estos son los rituales que te recomendamos:" |
| mensaje (por ritual) | "{Nombre del ritual}: {descripción de la línea}" |
| cierre (fijo en ambos casos) | "Tu cabello. Tu ritual. Tu Bugambilia." |

Parámetros iniciales, a ajustar en pruebas: temperatura 0.4, máximo unos 400 tokens de salida y 8 segundos de espera. Solo se envían necesidades y datos públicos del catálogo, nunca datos personales.

## Riesgos y mitigaciones

El riesgo principal es que la edición del árbol desde el panel o una respuesta de Gemini rompa el resultado. Cada caso tiene una salida que no depende de la IA.

| Riesgo | Mitigación |
| --- | --- |
| Gemini rebasa su límite gratuito, tarda o falla | Plantilla de respaldo con el mismo esquema; la recomendación no cambia |
| Gemini ignora las reglas o devuelve otros rituales | Salida estructurada; el código valida los `id_linea` y, si no coinciden, usa la plantilla; beneficios y enlaces nunca pasan por la IA |
| La dueña edita el árbol y deja una pregunta sin opciones, varias preguntas iniciales o un ciclo | Validaciones del panel al guardar el árbol (se definen en la Fase 5) |
| Un producto nuevo se da de alta sin necesidades | No aparece en ninguna recomendación; el panel debería pedir al menos una necesidad (Fase 5) |
| `tipo_producto` es texto libre y un valor nuevo no tiene paso de rutina | Mapeo en código con un paso por defecto, o lista cerrada de tipos en el panel (Fase 5) |
| Un visitante tiene una necesidad que el catálogo no cubre | Opción "Otra necesidad" sin etiquetas, que lleva a la cita de diagnóstico |

## Pendientes

- [ ] Preguntar a la clienta si quiere atender necesidades que el catálogo no menciona (frizz, caspa, puntas abiertas) y con qué productos
- [ ] Cargar en el *seed* las 6 necesidades, las 25 relaciones producto–necesidad, las 2 preguntas y sus 8 opciones
- [ ] Ajustar en pruebas la temperatura, el límite de tokens y el tiempo de espera de Gemini
- [ ] Definir en la Fase 5 las validaciones del panel para el árbol y el alta de productos
