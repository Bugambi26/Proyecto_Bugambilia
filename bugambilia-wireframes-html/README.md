# Bugambilia — wireframes funcionales (HTML + CSS + JS)

Prototipo navegable del sitio de Bugambilia Hair Boutique y de su panel de administración. Reproduce el diseño de los wireframes de la Fase 2, pero con todo funcionando: filtros, comparador antes/después, chatbot, inventario, sucursales y árbol del chatbot.

**No usa frameworks ni dependencias.** Solo HTML, CSS y JavaScript del navegador. Las tipografías van dentro del proyecto, así que no carga nada externo y funciona sin internet.

---

## Cómo abrirlo

**Opción 1 (la más simple):** doble clic en `index.html`.

**Opción 2 (recomendada):** levantar un servidor local, que se parece más a como funcionará en producción.

```bash
# con Python
python -m http.server 8000
# o con Node
npx serve .
```

Luego abre <http://localhost:8000>.

### Acceso al panel (solo demo)

| Correo | Contraseña |
|---|---|
| `admin@bugambilia.mx` | `bugambilia` |

El panel está en `admin/login.html`, o en el enlace **Acceso administrador** del pie de página.

> **Importante:** esta "sesión" es una simulación en el navegador para que el prototipo funcione. **No es seguridad real.** En el sistema final, el login, la recuperación de contraseña y la protección del panel los hace el backend.

### Datos

Los cambios del panel (stock, bajas, productos nuevos, sucursales, árbol) se guardan en el **localStorage** del navegador, y el sitio público los refleja. Para volver a los datos originales, borra los datos del sitio en el navegador (DevTools → Application → Local Storage).

---

## Estructura

```
bugambilia-wireframes-html/
├── index.html          Inicio
├── catalogo.html       Catálogo (filtros por línea, tipo y búsqueda)
├── producto.html       Detalle (?id=shampoo-matizante)
├── sucursales.html     Mapa + horarios
├── admin/
│   ├── login.html      Login + recuperar contraseña (2 pasos)
│   ├── inventario.html Tabla ABC + stock + paginación
│   ├── producto.html   Alta y cambio (mismo formulario)
│   ├── sucursales.html Agregar / editar / eliminar + horario por día
│   └── arbol.html      Editor de preguntas, opciones y necesidades
├── img/                Imágenes optimizadas en WebP (≈2.4 MB en total)
│   ├── logo.webp / logo-blanco.webp   Logo con fondo transparente (claro / oscuro)
│   ├── hero.webp, antes.webp, despues.webp
│   ├── productos/      21 fotos, nombradas con el id del producto
│   ├── lineas/         7 fotos de grupo, nombradas con el id de la línea
│   ├── ingredientes/   7 fotos del ingrediente protagonista de cada línea
│   └── sucursales/     kokoro.webp
├── css/
│   ├── styles.css      Tokens de diseño + componentes + sitio público + chatbot
│   ├── admin.css       Estilos propios del panel
│   └── theme.css       Tema Bugambilia: paleta, tipografías, texturas (capa de mockup)
├── fonts/              Cormorant Garamond + Jost (woff2, licencia OFL)
└── js/
    ├── data.js         Datos semilla + almacenamiento local + utilidades
    ├── main.js         Interacción del sitio público
    ├── chatbot.js      Widget del asistente (árbol → recomendación)
    └── admin.js        Lógica de las 5 pantallas del panel
```

---

## Cómo está hecho cada parte

### 1. HTML semántico

Cada página usa las etiquetas según su significado: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `table`, `dl`, `fieldset` y `dialog`. Así el navegador, los lectores de pantalla y Google entienden la estructura sin depender del CSS.

Accesibilidad aplicada:
- Enlace **"Saltar al contenido"** al inicio de cada página.
- Todos los controles son elementos reales (`<button>`, `<a>`, `<input>` con `<label>`), así que funcionan con teclado.
- `aria-current`, `aria-pressed`, `aria-expanded` y `aria-selected` indican el estado de menús, filtros, acordeones y pestañas.
- Áreas de toque de al menos 44 px.
- `aria-live` en los textos que cambian solos (contador del catálogo, conversación del chatbot).

### 2. CSS con variables (tokens de diseño)

Al inicio de `styles.css` están todos los valores del diseño como **variables CSS**:

```css
:root {
  --ink: #1F1F1F;
  --line: #CFCFCB;
  --accent: #2F5E9E;
  --font: 'IBM Plex Sans', system-ui, sans-serif;
  --r-sm: 4px;
}
```

Cuando llegue la identidad visual de la clienta, para los mockups de alta fidelidad, basta con cambiar estos valores y todo el sitio se actualiza.

Los componentes siguen una convención tipo **BEM** (`bloque__elemento--modificador`):
- `.btn`, `.btn--primary`, `.btn--sm`
- `.product-card`, `.product-card__body`
- `.compare`, `.compare__handle`

### 3. Layout con Flexbox y Grid (sin sistema de columnas)

- **Flexbox con `flex-wrap`** para menús, botones y layouts de dos columnas (`.split`). En pantallas angostas se acomodan solos uno debajo del otro, sin media queries.
- **Grid con `repeat(auto-fill, minmax(220px, 1fr))`** para las tarjetas del catálogo. El navegador decide cuántas columnas caben (1 en celular, 3 o 4 en escritorio).
- Solo hay un `@media` por archivo, para reducir tamaños de títulos y alturas en celular.

### 4. Componentes interactivos (JavaScript sin librerías)

| Parte | Cómo funciona |
|---|---|
| **Comparador antes/después** | Un `<input type="range">` invisible encima de la imagen. Al moverlo cambia la variable CSS `--pos`, y el CSS recorta la capa "después" con `clip-path`. Funciona con ratón, dedo y teclado. |
| **Pestañas Faciales/Capilares** | Patrón ARIA de tabs: `role="tab"`, `aria-selected`, navegación con flechas. |
| **Catálogo** | Los filtros (línea, tipo, búsqueda) se combinan y vuelven a pintar las tarjetas. La línea se guarda en la URL (`?linea=hydra`), así que el enlace se puede compartir. |
| **Detalle de producto** | Una sola página `producto.html` lee `?id=` de la URL y llena los datos. Así funciona también en Next.js con rutas dinámicas. |
| **Sucursales** | Acordeón (una tarjeta abierta a la vez). Los marcadores del mapa abren su tarjeta. El día de hoy se resalta en el horario. WhatsApp, Llamar y Cómo llegar generan enlaces reales cuando hay datos. |
| **Chatbot** | Se inyecta en todas las páginas públicas desde `chatbot.js`. Recorre el árbol, junta las necesidades de cada respuesta y busca productos activos que las cubran. Si hay coincidencias muestra la recomendación (estado B); si no, sugiere diagnóstico + Instagram (estado C). La redacción de la IA está **simulada** en `redactarRecomendacion()`: en producción esa función hará un `fetch()` al backend. |
| **Diálogos de confirmación** | Elemento nativo `<dialog>` con `showModal()`. El navegador ya resuelve el fondo oscuro, la tecla Esc y el foco. |

**Delegación de eventos:** en vez de poner un listener a cada botón de la tabla o de las tarjetas, se pone uno solo en el contenedor y se revisa qué se clicó (`e.target.closest(...)`). Así funciona aunque la tabla se vuelva a pintar.

**Seguridad básica:** todo texto que viene de los datos pasa por `BG.util.esc()` antes de insertarse como HTML, para evitar inyección de código.

### 5. Imágenes

Las fotos originales (PNG de ~1–2 MB cada una, ~60 MB en total) se convirtieron a **WebP** y se redujeron al tamaño en que se muestran: 700 px los productos, 1200 px las líneas y 1600 px el hero. Todo el sitio pesa unos 2.4 MB de imágenes.

- Cada imagen real usa la misma clase `.ph` del placeholder que reemplaza, así que hereda sus medidas. La regla `img.ph` le quita el borde punteado y usa `object-fit` para que no se deforme.
- Las fotos de producto usan `object-fit: contain` sobre el mismo beige de su fondo (`--product-bg`), para que la botella nunca se corte.
- Las rutas se guardan relativas a la raíz (`img/productos/x.webp`). `BG.util.src()` les antepone `../` dentro de `/admin`.
- `loading="lazy"` en todo lo que está debajo del primer pantallazo.
- En el panel, la imagen que se sube se reduce a 600 px con un `<canvas>` y se guarda con el producto. En producción se sube al servidor.
- Siguen como placeholder (pendientes con la clienta): foto del equipo y del espacio, antes/después de faciales, foto de la sucursal Estética Bugambilia.

### 6. Datos y "base de datos" local

`data.js` contiene los 21 productos (nombre, beneficio y contenido tomados de las etiquetas), 7 líneas, 2 sucursales y el árbol de ejemplo. Los datos se guardan con el prefijo `bugambilia:v2:`, así que los cambios hechos con la versión anterior (20 productos) se ignoran.

Las páginas nunca leen esos arreglos directamente. Usan funciones como `BG.db.productos()` y `BG.db.guardarProductos()`. Hoy esas funciones leen y escriben en localStorage; cuando exista el backend, solo se cambian esas funciones por llamadas a la API y el resto del código queda igual.

Se usan `<script>` normales (no módulos ES) para que el proyecto abra con doble clic. Los módulos ES no cargan desde `file://`.

### 7. Tema visual (de wireframe a mockup)

El diseño está separado en dos capas:

| Capa | Archivos | Qué decide |
|---|---|---|
| Estructura (wireframe) | `styles.css`, `admin.css` | Layout, tamaños, componentes, responsivo |
| Piel (mockup) | `theme.css` (se carga al final) | Colores, tipografías, texturas, sombras, adornos |

Si quitas `theme.css` de los `<link>`, el sitio vuelve a verse como el wireframe en grises. Así se demuestra que el mockup no cambió la estructura que ya se había aprobado.

**Paleta**, tomada del logo y de los pósters de la clienta. Es provisional hasta tener los códigos oficiales; para cambiarla basta con editar la sección 1 de `theme.css`.

| Uso | Color |
|---|---|
| Fondo crema (fondo del logo) | `#F7EFE6` |
| Arena (secciones alternas) | `#EAD7C3` / `#F2E6D8` |
| Chocolate (botones, pie) | `#5C3F2E` / `#3E2A1F` |
| Bugambilia (acento, chatbot) | `#B0245A` |
| Dorado (líneas, adornos) | `#B98A4B` |
| Tinta (texto) | `#241A15` |

Además, cada línea tiene el color de la banda de su etiqueta (`color` y `tinta` en `data.js`). Ese color se pasa como variables CSS `--l-bg` / `--l-ink` a las tarjetas, los filtros, el banner y el detalle.

**Tipografía:** *Cormorant Garamond* (serif elegante, como los títulos de los pósters) para los títulos y *Jost* (sans geométrica) para el texto y las mayúsculas espaciadas tipo "SWEET RITUAL".

**Texturas y detalles:**
- Grano de papel: ruido SVG muy suave en el fondo.
- La flor del logo como adorno de las etiquetas, marca de agua del hero y del pie.
- Cinta animada con los verbos de los pósters (se detiene si el usuario pidió reducir el movimiento).
- Sombras cálidas y esquinas redondeadas; botones tipo píldora como el botón de los pósters.

### 8. Panel de administración

- **Inventario:** filtros, paginación de 10 en 10, stock con −/+, baja con confirmación (desactiva, no borra) y reactivación desde el filtro "Inactivos".
- **Producto:** un solo formulario para alta y cambio, con validación (nombre obligatorio, precio > 0, stock entero ≥ 0) y vista previa en vivo de la tarjeta del catálogo.
- **Sucursales:** el marcador se coloca con un clic en el mapa (o con flechas del teclado). Marcar "Cerrado" desactiva las horas de ese día.
- **Árbol:** permite agregar y quitar opciones y necesidades, y elegir a qué pregunta lleva cada opción o "Fin". La vista del flujo avisa si hay opciones sin texto o preguntas a las que nada lleva. Solo puede haber una pregunta inicial.

---

## Pendientes (marcados con `[corchetes]` en el sitio)

- Precio de los productos.
- Ingrediente protagonista del Kit Antioxidante.
- Servicios capilares (corte, tinte, tratamientos).
- Dirección, teléfono, WhatsApp, horario y coordenadas de las sucursales.
- Preguntas y necesidades reales del árbol (Fase 4).
- URL de Instagram: en `js/data.js` → `CONFIG.instagram`.
- Colores y tipografía de la marca: se aplican en los tokens de `css/styles.css` (el logo ya está integrado).
