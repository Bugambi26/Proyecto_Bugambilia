# Catálogo de productos y servicios — Proyecto Bugambilia

Información oficial proporcionada por la clienta (Bugambilia Hair Boutique). Fuente de datos para el catálogo del sitio, el modelo de la base de datos y el motor de recomendación del chatbot (Fase 4).

---

## Resumen

| Tipo | Categoría | Cantidad | ¿Entra al inventario ABC? |
|---|---|---|---|
| Productos | Capilares (Línea Bugambilia) | 20 productos en 6 líneas | Sí |
| Servicios | Faciales | 4 tratamientos | No (contenido fijo y promocional) |
| Servicios | Capilares (corte, tinte, tratamientos) | Pendiente | No |

---

# PARTE 1 — PRODUCTOS CAPILARES

## Línea Bugambilia · Professional Hair Care

**Concepto de marca:** colección de cuidado capilar profesional que atiende distintas necesidades del cabello mediante rituales especializados. Debe sentirse como una marca cosmética premium, no como productos genéricos de salón.

**Valores de la identidad:** elegancia, feminidad, profesionalismo, belleza, resultados y exclusividad.

**Arquitectura de cada producto** (se refleja en la entidad `PRODUCTO` / `LINEA` del ER):

1. Nombre de la línea
2. Nombre del ritual (en inglés)
3. Tipo de producto
4. Ingrediente(s) protagonista(s)

## Tabla de productos

| # | Línea | Ritual | Tipo de producto | Ingrediente(s) protagonista(s) |
|---|---|---|---|---|
| 1 | Rubios Perfectos | Blonde Ritual | Shampoo Matizante | Aceite de pepita de uva |
| 2 | Rubios Perfectos | Blonde Ritual | Mascarilla Matizante | Aceite de pepita de uva |
| 3 | Rubios Perfectos | Blonde Ritual | Crema para Peinar Antioxidante | Aceite de pepita de uva |
| 4 | Cobres Brillantes | Copper Ritual | Shampoo Cobre | Cacao |
| 5 | Cobres Brillantes | Copper Ritual | Bálsamo Hidratante | Cacao |
| 6 | Cobres Brillantes | Copper Ritual | Crema para Peinar | Cacao |
| 7 | Hidratación | Hydra Ritual | Shampoo Hidratante | Aloe vera + sangre de grado |
| 8 | Hidratación | Hydra Ritual | Bálsamo Hidratante | Aloe vera + sangre de grado |
| 9 | Hidratación | Hydra Ritual | Crema para Peinar | Aloe vera + sangre de grado |
| 10 | Reestructurante | Repair Ritual | Shampoo | Ácido hialurónico |
| 11 | Reestructurante | Repair Ritual | Bálsamo | Células madre |
| 12 | Reestructurante | Repair Ritual | Crema para Peinar | Colágeno + mezcla de tres aceites |
| 13 | Crecimiento | Growth Ritual | Shampoo | Minoxidil + bergamota + otros activos |
| 14 | Crecimiento | Growth Ritual | Loción | Minoxidil + bergamota + otros activos |
| 15 | Crecimiento | Growth Ritual | Aceite | Minoxidil + bergamota + otros activos |
| 16 | Cotton Candy | The Complete Hair Ritual | Shampoo | Antioxidantes + hidratación + colágeno + elastina |
| 17 | Cotton Candy | The Complete Hair Ritual | Mascarilla | Antioxidantes + hidratación + colágeno + elastina |
| 18 | Cotton Candy | The Complete Hair Ritual | Bálsamo | Antioxidantes + hidratación + colágeno + elastina |
| 19 | Cotton Candy | The Complete Hair Ritual | Crema para Peinar | Antioxidantes + hidratación + colágeno + elastina |
| 20 | Cotton Candy | The Complete Hair Ritual | Aceite | Antioxidantes + hidratación + colágeno + elastina |

> En Blonde, Copper, Hydra, Growth y Cotton Candy los ingredientes están definidos **por línea**, no por producto. Solo Repair Ritual define un ingrediente distinto para cada producto.

## Detalle por línea

### 01 · Rubios Perfectos — Blonde Ritual
- **Descripción:** línea especializada en el mantenimiento y cuidado de cabellos rubios, para conservar una apariencia luminosa, brillante y tonalmente equilibrada.
- **Productos:** Shampoo Matizante, Mascarilla Matizante, Crema para Peinar Antioxidante.
- **Ingrediente protagonista:** aceite de pepita de uva.
- **Concepto visual:** elegante, luminoso y sofisticado; rubios fríos, brillo y perfección tonal.

### 02 · Cobres Brillantes — Copper Ritual
- **Descripción:** cuidado y mantenimiento de tonos cobrizos, para conservar intensidad, brillo y una apariencia saludable.
- **Productos:** Shampoo Cobre, Bálsamo Hidratante, Crema para Peinar.
- **Ingrediente protagonista:** cacao.
- **Concepto visual:** cálido, sensual, brillante y sofisticado.

### 03 · Hidratación — Hydra Ritual
- **Descripción:** ritual de hidratación para cabello que necesita recuperar suavidad, luminosidad y una sensación de mayor nutrición.
- **Productos:** Shampoo Hidratante, Bálsamo Hidratante, Crema para Peinar.
- **Ingredientes protagonistas:** aloe vera + sangre de grado.
- **Concepto visual:** fresco, limpio, natural y elegante.

### 04 · Reestructurante — Repair Ritual
- **Descripción:** ritual especializado para cabello sensibilizado, procesado o que necesita un cuidado intensivo.
- **Productos:** Shampoo con Ácido Hialurónico, Bálsamo con Células Madre, Crema para Peinar con Colágeno + Mezcla de Tres Aceites.
- **Concepto visual:** tecnología, reparación, lujo y tratamiento profesional.

### 05 · Crecimiento — Growth Ritual
- **Descripción:** línea enfocada en el cuidado del cuero cabelludo y en rutinas orientadas al crecimiento y fortalecimiento del cabello.
- **Productos:** Shampoo, Loción, Aceite.
- **Activos protagonistas:** minoxidil + bergamota + otros activos.
- **Concepto visual:** botánico, potente, profesional y sofisticado.
- ⚠️ **Nota regulatoria de la clienta:** las declaraciones de beneficios y el uso de activos como el minoxidil deben validarse según la formulación final y los requisitos regulatorios aplicables. **Implicación para el sitio y el chatbot:** no publicar ni generar afirmaciones de resultados sobre crecimiento hasta que la clienta confirme los textos validados.

### 06 · Cotton Candy — The Complete Hair Ritual
- **Descripción:** la línea más amplia de Bugambilia. Ritual integral que combina antioxidantes, hidratación, colágeno y elastina para una experiencia completa de cuidado, desde la limpieza hasta el tratamiento y la finalización del cabello.
- **Productos:** Shampoo, Mascarilla, Bálsamo, Crema para Peinar, Aceite.
- **Activos protagonistas:** antioxidantes + hidratación + colágeno + elastina.
- **Concepto visual:** femenino, dulce, sofisticado, sensorial y "muy Bugambilia".

## Etiquetado (referencia para la ficha de producto)

Cada etiqueta contempla: logo Bugambilia, nombre de la línea, nombre del ritual, tipo de producto, ingredientes protagonistas, beneficio principal, contenido neto, información técnica y regulatoria, e identidad visual diferenciada por línea. Toda la colección mantiene la misma arquitectura de etiqueta y solo cambian los elementos propios de cada línea.

---

# PARTE 2 — SERVICIOS FACIALES

**Presentación:** Bugambilia Hair Boutique cuenta con tratamientos faciales que atienden distintas necesidades de la piel, desde una limpieza profunda hasta protocolos enfocados en luminosidad, hidratación y textura. Cada tratamiento puede personalizarse según las condiciones y objetivos de cada persona.

| Servicio | Enfoque | Ideal para |
|---|---|---|
| Limpieza Facial Profunda | Limpieza y renovación de la piel | Pieles con impurezas, poros congestionados, exceso de grasa o apariencia opaca |
| Hollywood Peel | Luminosidad y renovación | Quienes buscan un efecto glow y una piel visiblemente más uniforme y radiante |
| BB Glow | Luminosidad y apariencia uniforme | Pieles que buscan mayor luminosidad, uniformidad y un aspecto más fresco |
| Hidrafacial | Limpieza + exfoliación + extracción + hidratación | Todo tipo de pieles que buscan una renovación completa y un aspecto saludable y radiante |

### Limpieza Facial Profunda
- **Enfoque:** limpieza y renovación de la piel.
- **Descripción:** elimina impurezas, exceso de grasa, células muertas y residuos acumulados. Ayuda a descongestionar los poros, mejorar la textura y devolver a la piel una apariencia más limpia, suave y luminosa.
- **Ideal para:** pieles con impurezas, poros congestionados, exceso de grasa o apariencia opaca.

### Hollywood Peel
- **Enfoque:** luminosidad y renovación.
- **Descripción:** mejora la apariencia general de la piel, aporta luminosidad y favorece una textura más uniforme. Mejora visiblemente la apariencia de poros, textura, exceso de grasa y manchas superficiales, dejando la piel más lisa, fresca y luminosa.
- **Ideal para:** quienes buscan un efecto glow y una piel visiblemente más uniforme y radiante.

### BB Glow
- **Enfoque:** luminosidad y apariencia uniforme.
- **Descripción:** mejora la apariencia del tono y aporta luminosidad e hidratación. Da una apariencia más uniforme, radiante y descansada, con un acabado de "buena cara".
- **Ideal para:** pieles que buscan mayor luminosidad, uniformidad y un aspecto más fresco.

### Hidrafacial
- **Enfoque:** limpieza + exfoliación + extracción + hidratación.
- **Descripción:** tratamiento integral que limpia profundamente, elimina células muertas e impurezas, realiza extracciones y aporta hidratación. Deja la piel limpia, suave, hidratada y con luminosidad inmediata.
- **Ideal para:** todo tipo de pieles que buscan una renovación completa y un aspecto saludable y radiante.

**Cierre de la sección:** "Piel limpia. Piel cuidada. Piel luminosa."

---

# PARTE 3 — DIRECCIÓN VISUAL Y TONO (para mockups y textos del sitio)

- **Mensaje central:** lujo accesible + experiencia profesional + feminidad sofisticada.
- **Evitar:** estética demasiado clínica, genérica o de supermercado.
- **Idea guía:** una marca que una mujer quiere tener en su baño porque es bonita, y que además reconoce como producto profesional creado desde la experiencia de salón.
- **Firma de marca:** "Tu cabello. Tu ritual. Tu Bugambilia."

---

# PARTE 4 — NOTAS PARA LA FASE 4 (chatbot)

Necesidades del cabello que la propia descripción de cada línea menciona. Es un punto de partida para la lista cerrada de etiquetas; la lista final se define en la Fase 4.

| Línea | Necesidades mencionadas en su descripción |
|---|---|
| Blonde Ritual | Cabello rubio; mantener luminosidad, brillo y tono equilibrado |
| Copper Ritual | Cabello cobrizo; conservar intensidad, brillo y apariencia saludable |
| Hydra Ritual | Cabello que necesita suavidad, luminosidad y nutrición |
| Repair Ritual | Cabello sensibilizado, procesado o que requiere cuidado intensivo |
| Growth Ritual | Cuidado del cuero cabelludo, crecimiento y fortalecimiento (sujeto a validación regulatoria) |
| Cotton Candy | Cuidado integral: limpieza, tratamiento y finalización |

Recordatorios:
- El chatbot recomienda **solo productos**. Si ningún producto cubre la necesidad, sugiere una cita de diagnóstico con el botón a Instagram.
- Los tratamientos faciales no los recomienda el chatbot; se muestran como contenido promocional en el sitio.

---

## Pendientes por confirmar con la clienta

- [ ] Precio de los 20 productos.
- [ ] Contenido neto de cada producto.
- [ ] Beneficio principal **por producto** (la información actual describe beneficios por línea).
- [ ] Textos validados de beneficios para Growth Ritual (minoxidil).
- [ ] Precio y duración de cada tratamiento facial.
- [ ] Información de los servicios capilares (corte, tinte y tratamientos).
- [ ] Fotos del servicio realizado y de antes/después para los faciales.
