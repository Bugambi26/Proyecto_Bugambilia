# Fase 0 — Descubrimiento y Requerimientos (Completada)

## Proyecto
Página web para una estética, con presentación de empresa, catálogo de productos y servicios, chatbot de recomendación y módulo de inventario con operaciones ABC (Alta, Baja, Cambio).

---

## 1. Catálogo de productos y servicios

- **Categorías definidas:** Faciales y Capilares
- **Productos capilares:** 7 productos
- **Productos faciales:** pendiente por confirmar con la clienta (dato aún no levantado)

> ⚠️ Pendiente antes de avanzar al mockup del catálogo: número exacto de productos faciales.

---

## 2. Enfoque del chatbot

**Decisión: enfoque híbrido (árbol de decisión + IA generativa)**

- Se usa un **árbol de decisión** para generar las preguntas base que se le hacen al cliente (estructuradas, con opciones definidas).
- Las respuestas del cliente a esas preguntas se convierten en **palabras clave / contexto**.
- Ese contexto se pasa a un **modelo de IA generativa**, que lo usa para interpretar la necesidad del cliente y generar la recomendación de forma más natural, sin salirse del catálogo real de productos.

Esto evita tanto la rigidez de un árbol puro como el riesgo de alucinación de una IA generativa sin contexto.

---

## 3. Módulo de inventario (ABC)

- **Usuarios del módulo:** la dueña del negocio y el equipo de desarrollo.
- **Roles:** no se requiere un sistema de roles granular — basta con un solo rol de administrador autenticado, ya que no hay múltiples niveles de acceso que diferenciar.

---

## 4. Alcance funcional del sitio

- **Catálogo:** mostrar productos y servicios (sin carrito ni pasarela de pago).
- **Agenda/citas:** **descartado.** El sitio no agenda ni consulta citas.
- **Ubicación de sucursales:** el sitio debe mostrar la ubicación de los establecimientos donde se venden estos productos (solo visualización, ej. mapa embebido con dirección de cada punto de venta).

---

## 5. Identidad visual

- Ya está definida (logo, colores, tipografía) — no se requiere trabajo de branding, solo aplicar los activos existentes al diseño del sitio.

---

## 6. Hosting y dominio

- Aún no existen. Se deben definir en la fase de arquitectura técnica (junto con el stack), antes del despliegue.

---

## Resumen de alcance final (post Fase 0)

| Módulo | Incluido |
|---|---|
| Presentación de empresa | ✅ |
| Catálogo de productos y servicios | ✅ (sin carrito/pagos) |
| Chatbot de recomendación (árbol + IA) | ✅ |
| Inventario ABC | ✅ (1 solo rol admin) |
| Ubicación de sucursales (mapa) | ✅ (solo visualización) |
| Agenda/citas | ❌ Descartado |

## Pendiente antes de cerrar Fase 0 por completo
- [ ] Número exacto de productos faciales
