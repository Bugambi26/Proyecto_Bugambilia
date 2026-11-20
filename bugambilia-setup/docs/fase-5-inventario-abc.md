# Proyecto Bugambilia — Fase 5: Diseño del módulo de inventario (ABC)

Cerrada el 18 de noviembre de 2026. Criterios: sin cambios al ER, a prueba de errores (una sola usuaria no técnica), la opción más simple que cubra el caso.

## 1. Baja y estados del producto

Baja = **desactivar** (`activo = false`). Deja de verse en catálogo y chatbot, conserva datos, imagen y necesidades, y se reactiva desde el panel. Nunca se borra. El panel lista con filtro Activos / Inactivos.

| Estado | Catálogo | Chatbot |
| --- | --- | --- |
| Activo con stock | Disponible | Se puede recomendar |
| Activo sin stock | "Agotado" | Se excluye |
| Inactivo | No se muestra | Se excluye |

## 2. Alta de productos

| Campo | Obligatorio | Validación |
| --- | --- | --- |
| Línea | Sí | Se elige de las líneas existentes |
| Nombre | Sí | Único dentro de su línea |
| Tipo de producto | Sí | Lista cerrada de 6 tipos |
| Ingredientes protagonistas | Sí | Texto |
| Beneficio principal | Sí | Texto; lo usan la ficha y el chatbot |
| Necesidades | Sí, al menos 1 | Se eligen de la lista de necesidades |
| Contenido neto | No | Texto, por ejemplo "250 ml" |
| Precio | No | Número > 0, en pesos, 2 decimales |
| Imagen | No | JPG, PNG o WebP, máx. 5 MB; sin imagen se muestra el logo |
| Stock | Sí | Entero ≥ 0; empieza en 0 si no se indica |

El producto se crea activo. Líneas y categorías no se administran desde el panel (solo seed).

**Tipo de producto** (enum en Prisma):

| Tipo | Paso de rutina |
| --- | --- |
| Shampoo | Limpieza |
| Mascarilla | Tratamiento |
| Bálsamo | Tratamiento |
| Loción | Tratamiento |
| Crema para Peinar | Finalización |
| Aceite | Finalización |

Precio y contenido neto son opcionales: si faltan, la ficha no los muestra.

## 3. Cambio y stock

- Mismas validaciones del alta (no se guarda un producto sin necesidades).
- Imagen: al reemplazarla, la anterior se borra de Cloudinary; si se quita, vuelve el logo.
- Desactivar pide confirmación ("Este producto dejará de verse en el sitio"). Reactivar desde la ficha.
- Cambio de línea permitido, con aviso de revisar las necesidades.
- **Stock:** un campo numérico; la dueña escribe el total o ajusta con botones + y − antes de guardar. Nunca baja de 0. En 0 → "Agotado" y fuera del chatbot automáticamente; no hay interruptor manual.

## 4. Árbol del chatbot y necesidades (extra)

Se valida en cada cambio; si rompe una regla, se rechaza con un mensaje que dice cuál.

| # | Regla |
| --- | --- |
| 1 | Exactamente una pregunta inicial |
| 2 | Cada pregunta tiene de 2 a 6 opciones |
| 3 | Sin ciclos: siguiendo las opciones nunca se vuelve a una pregunta ya vista |
| 4 | Toda pregunta es alcanzable desde la inicial (solo avisa, no bloquea) |
| 5 | Una opción puede tener 0 o más necesidades |
| 6 | No se borra una pregunta a la que apunta una opción, ni la inicial |

- Pregunta y opciones se crean en un solo formulario.
- Si el chatbot encuentra el árbol roto, muestra la cita de diagnóstico.
- **Necesidades:** crear y editar libremente; eliminar solo si no están ligadas a productos ni opciones (si lo están, el panel dice dónde).

## 5. Sucursales (extra)

| Campo | Obligatorio | Validación |
| --- | --- | --- |
| Nombre | Sí | Único |
| Tipo | Sí | Propia o Tercero |
| Dirección | Sí | Texto |
| Latitud y longitud | Sí | Formato válido; vista previa del punto en el mapa |
| Teléfono | No | 10 dígitos |
| WhatsApp | No | 10 dígitos; enlace `wa.me` con prefijo 52 |
| Foto | No | Cloudinary, JPG/PNG/WebP, máx. 5 MB |
| Horario | Sí, al menos un día | Apertura antes que cierre; días sin horario = "Cerrado" |

- Eliminar = borrado físico con confirmación (borra horarios y foto en Cloudinary).
- Coordenadas capturadas a mano (copiadas de Google Maps) con vista previa.
- Un rango de horario por día: 7 renglones con interruptor de "Cerrado".

## Pendientes

- Cómo se reportan las ventas de Kokoro para descontarlas del stock.
- Confirmar si alguna sucursal tiene horario partido.
- Definir el servicio del mapa del sitio.
- Precio y contenido neto de los 20 productos.
