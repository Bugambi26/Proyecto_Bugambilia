# Prompt — Informe semanal de estadía (Proyecto Bugambilia)

> Cómo usarlo: copia todo lo que está debajo de la línea, adjunta **tu Excel de seguimiento** (F-716-1/A Rev.B) y el **contexto del proyecto** (`contexto-proyecto-estetica.md`), y cambia solo lo que está entre `[CORCHETES]`.

---

Actúa como mi asistente para el seguimiento de mi estadía universitaria. Necesito que redactes y captures el informe semanal en mi formato oficial de seguimiento (Excel F-716-1/A Rev.B, hoja **PLANTILLA**).

## Datos de la entrega
- **Semana a reportar:** S[NÚMERO DE SEMANA]
- **Lo que hice esta semana (notas rápidas, sin redactar):** [ESCRIBE AQUÍ EN VIÑETAS LO QUE HICISTE, AUNQUE SEA INFORMAL]
- **¿Alguna situación que quiera comentar con mi asesor?** [OPCIONAL: retrasos, dudas, cambios de la clienta, pendientes que dependen de otros, etc.]

## Contexto del proyecto
Usa el documento de contexto adjunto. Resumen: **Proyecto Bugambilia**, página web para la estética Bugambilia Hair Boutique con presentación de la empresa, catálogo de productos y servicios (categorías Faciales y Capilares, sin carrito ni pagos), chatbot híbrido de recomendación (árbol de decisión que genera preguntas → palabras clave → contexto para IA generativa), módulo de inventario ABC con un solo rol administrador, y mapa de sucursales. Se descartaron las citas y el bot de Telegram. El proyecto sigue estas fases: 0) Descubrimiento y requerimientos, 1) Diagramas (casos de uso, entidad-relación, flujo del chatbot), 2) Wireframes y mockups en Figma, 3) Stack técnico, 4) Motor de recomendación, 5) Reglas del inventario ABC, 6) Desarrollo por sprints (MVP).

## Dónde va cada cosa en el Excel
- Hoja: **PLANTILLA**.
- El informe va en la columna **Informe Semanal (redacción del estudiante)**, que es el rango combinado **F:L** de la fila de la semana:
  - S1 → F26 · S2 → F27 · S3 → F28 · **S4 → F29** · S5 → F30 · S6 → F31 · S7 → F32 · S8 → F33 · S9 → F34 · S10 → F35 · S11 → F36 · S12 → F37 · S13 → F38 · S14 → F39
- Escribe el texto **solo en la celda F** de esa fila (es la celda principal del combinado F:L).
- **No toques** la columna M:S (comentarios del tutor), las fechas de la columna C, el estado de la columna D, el Recuadro A, el Recuadro D, las fórmulas ni el formato del archivo. No modifiques otras semanas.
- Activa **ajuste de texto** (wrap text) y alineación superior-izquierda solo en la celda que llenes, conservando la fuente existente. Si el texto no se alcanza a leer completo, aumenta únicamente el alto de esa fila.

## Estructura obligatoria del informe
Cada registro debe cubrir, en este orden, los tres puntos que pide el formato, con estas etiquetas tal cual:

**a) Actividades realizadas:** qué se hizo durante la semana, en pasado y en primera persona del plural o singular según corresponda (trabajo en equipo con Miguel Ángel).
**b) Productos o entregables:** lo que resultó concretamente de esas actividades (documento, diagrama, mockup, módulo, minuta, etc.). Si una actividad no generó un entregable tangible, dilo.
**c) Destino del producto o entregable:** dónde queda o a quién se entrega cada producto (ej. repositorio de GitHub, carpeta compartida del proyecto, Figma, se presentó a la clienta, se envió al asesor, etc.).
**Observaciones (opcional):** solo si di alguna situación para comentar con el asesor; si no, omite esta parte.

## Reglas de redacción
- Español formal pero natural, como lo escribiría un estudiante universitario de Ingeniería en TI; nada de frases genéricas o de relleno.
- Extensión: **entre 80 y 130 palabras** por informe, para que quepa legible en la celda.
- Usa **solo lo que yo te dé** en mis notas y lo que está en el contexto del proyecto. **No inventes** actividades, reuniones, fechas, avances ni entregables. Si mis notas son muy escuetas o falta saber el destino de algún entregable, **pregúntame antes de redactar**.
- Mantén coherencia con las semanas anteriores ya capturadas en el Excel (léelas antes): que no se repitan las mismas actividades y que el avance siga el orden de las fases del proyecto.

## Lo que me tienes que regresar
1. El texto del informe en el chat, para que lo pueda revisar y copiar.
2. El **Excel actualizado** con el informe capturado en la celda correcta, con el mismo nombre de archivo y sin ningún otro cambio.
3. Si al revisar el Excel ves algo raro (fechas que no cuadran, una semana anterior vacía, datos generales incompletos), avísame en una línea, **sin corregirlo por tu cuenta**.
