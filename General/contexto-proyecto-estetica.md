# Contexto del Proyecto — Página Web para Estética

## Descripción general
Desarrollo de una página web para una clienta con negocio de estética. El sitio debe incluir presentación de la empresa, catálogo de productos y servicios, un chatbot que recomiende productos según las necesidades del cliente, y un módulo interno de inventario con operaciones ABC (Alta, Baja, Cambio).

Equipo: Jochas + Miguel Ángel ("Miguelinchis").

---

## Estado actual: Fase 0 (Descubrimiento) — completada

### 1. Catálogo de productos y servicios
- **Categorías:** Faciales y Capilares
- **Productos capilares:** 7
- **Productos faciales:** pendiente por confirmar con la clienta

### 2. Enfoque del chatbot — decisión: híbrido (árbol + IA generativa)
- Un **árbol de decisión** genera las preguntas base y opciones estructuradas para el cliente.
- Las respuestas se traducen en **palabras clave / contexto**.
- Ese contexto se pasa a una **IA generativa**, que interpreta la necesidad y genera la recomendación de forma natural, sin salirse del catálogo real (evita tanto la rigidez de un árbol puro como el riesgo de alucinación de una IA sin contexto).
- Se descartó usar un bot de Telegram: no existe una "IA de Telegram" propia — lo que existe es el Bot API de Telegram (gratuito y confiable) conectado a un LLM externo, pero eso implicaría que el cliente saliera del sitio web para chatear, lo cual no es lo que se busca. El chatbot vivirá directamente en el sitio como widget.

### 3. Módulo de inventario (ABC)
- **Usuarios:** la dueña del negocio y el equipo de desarrollo.
- **Roles:** un solo rol de administrador autenticado (no se requiere sistema de roles granular).

### 4. Alcance funcional del sitio
- Catálogo de productos y servicios (sin carrito ni pagos).
- **Agenda/citas: descartado** — el sitio no agenda ni consulta citas.
- Debe mostrar la **ubicación de los establecimientos/sucursales** donde se venden los productos (solo visualización, ej. mapa embebido).

### 5. Identidad visual
- Ya definida (logo, colores, tipografía) por la clienta — no se requiere trabajo de branding.

### 6. Hosting y dominio
- Aún no existen. Se definirán en la fase de arquitectura técnica, antes del despliegue.

### Pendiente para cerrar Fase 0 al 100%
- [ ] Número exacto de productos faciales

---

## Resumen de alcance final

| Módulo | Incluido |
|---|---|
| Presentación de empresa | ✅ |
| Catálogo de productos y servicios | ✅ (sin carrito/pagos) |
| Chatbot de recomendación (árbol + IA) | ✅ (widget en el sitio) |
| Inventario ABC | ✅ (1 solo rol admin) |
| Ubicación de sucursales (mapa) | ✅ (solo visualización) |
| Agenda/citas | ❌ Descartado |
| Bot de Telegram | ❌ Descartado |

---

## Plan de fases del proyecto

- **Fase 0 — Descubrimiento y requerimientos:** ✅ completada (ver arriba, pendiente el conteo de productos faciales).
- **Fase 1 — Diagramas:**
  - Diagrama de casos de uso (actores: visitante, administrador, chatbot).
  - Diagrama entidad-relación — entidades clave: `Producto`, `Servicio`, `Categoría`, `Sucursal` (con dirección/coordenadas), `Usuario/Admin`, y relación de etiquetas de "necesidades" entre productos y chatbot. (Ya sin entidad de `Cita`, descartada.)
  - Diagrama de flujo del chatbot (árbol de preguntas → palabras clave → contexto para la IA).
- **Fase 2 — Mockups:** wireframes de baja fidelidad y luego mockup de alta fidelidad en Figma (ya con la identidad visual definida), cubriendo: home, catálogo de productos, catálogo de servicios, widget del chatbot, mapa de sucursales, panel de administración de inventario.
- **Fase 3 — Definición de stack técnico:** frontend, backend, base de datos, proveedor de LLM para el chatbot, autenticación del panel admin, hosting y dominio (aún no elegidos).
- **Fase 4 — Diseño del motor de recomendación del chatbot:** definir categorías/necesidades cerradas, etiquetar productos y servicios con ellas, definir cómo el árbol alimenta de contexto a la IA generativa.
- **Fase 5 — Diseño del módulo de inventario (ABC):** reglas de negocio para Alta/Baja/Cambio (ej. "Baja" como desactivación, no borrado físico), validaciones mínimas.
- **Fase 6 — Plan de desarrollo:** priorizar MVP (presentación + catálogo estático → panel de inventario → chatbot → pulido).

---

## Siguiente paso
Confirmar el número de productos faciales con la clienta, y avanzar a la Fase 1 (diagramas), ya ajustada sin módulo de citas y con la entidad de sucursales incluida.
