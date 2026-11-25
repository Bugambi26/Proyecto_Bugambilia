// Seed de Bugambilia Hair Boutique.
// Fuentes: catálogo de los mockups aprobados (bugambilia-wireframes-html) y docs/fase-4-motor-chatbot.md.
//
// Se puede correr varias veces sin duplicar nada: SOLO CREA LO QUE FALTA y nunca
// sobrescribe datos existentes (stock, precios o imágenes que la dueña ya capturó).
// Correr con: npx prisma db seed
//
// No importa src/lib/prisma.ts porque ese archivo es "server-only" (solo Next.js).

import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, TipoProducto, TipoSucursal } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

// ─────────────────────────────── Necesidades (Fase 4) ───────────────────────────────

const NECESIDADES = {
  rubio: { nombre: "Cabello rubio", descripcion: "Mantener luminosidad, brillo y tono equilibrado" },
  cobrizo: { nombre: "Cabello cobrizo", descripcion: "Conservar intensidad, brillo y apariencia saludable" },
  hidratacion: { nombre: "Hidratación", descripcion: "Recuperar suavidad, luminosidad y nutrición" },
  reparacion: {
    nombre: "Reparación",
    descripcion: "Cabello sensibilizado, procesado o que requiere cuidado intensivo",
  },
  crecimiento: {
    nombre: "Crecimiento y fortalecimiento",
    descripcion: "Cuidado del cuero cabelludo orientado al crecimiento y fortalecimiento del cabello",
  },
  integral: { nombre: "Cuidado integral", descripcion: "Rutina completa de limpieza, tratamiento y finalización" },
} as const;

type ClaveNecesidad = keyof typeof NECESIDADES;

// ─────────────────────────────── Catálogo ───────────────────────────────
// Fuente: mockups aprobados con la dueña (bugambilia-wireframes-html/js/data.js), tomados
// de las etiquetas reales: 7 líneas y 22 productos (Crecimiento tiene 4 desde el 25 nov 2026).
// Reemplaza a la versión de 6 líneas y 20 productos de la Fase 4.
// El orden de este arreglo es el "orden del catálogo" (desempate del chatbot).

type ProductoSeed = {
  nombre: string;
  tipo: TipoProducto;
  beneficio: string;
  imagen: string; // archivo en public/img/productos/
  contenido?: string; // si falta, CONTENIDO_NETO
  ingredientes?: string; // si faltan, los de la línea
};

type LineaSeed = {
  nombre: string;
  ritual: string;
  precioRitual: number; // precio del ritual completo en pesos (dado por la clienta, 25 nov 2026)
  descripcion: string;
  ingredientes: string; // definidos por línea en las etiquetas
  // Etiquetado confirmado por la clienta (23 nov 2026): Cotton Candy → hidratación;
  // Kit Antioxidante → cuidado integral.
  necesidades: ClaveNecesidad[];
  productos: ProductoSeed[];
};

const CONTENIDO_NETO = "250 ml"; // el de casi todas las etiquetas (la loción y el aceite de Crecimiento son de 50 ml)

const LINEAS: LineaSeed[] = [
  {
    nombre: "Rubios Perfectos",
    ritual: "Blonde Ritual",
    precioRitual: 680,
    descripcion:
      "Línea especializada en el mantenimiento y cuidado de cabellos rubios, ayudando a conservar una apariencia luminosa, brillante y tonalmente equilibrada.",
    ingredientes: "Aceite de pepita de uva",
    necesidades: ["rubio"],
    productos: [
      { nombre: "Shampoo Matizante", tipo: TipoProducto.Shampoo, beneficio: "Neutraliza, limpia y protege el tono.", imagen: "shampoo-matizante" },
      { nombre: "Mascarilla Matizante", tipo: TipoProducto.Mascarilla, beneficio: "Matiza, repara y da brillo.", imagen: "mascarilla-matizante" },
      { nombre: "Crema para Peinar Antioxidante", tipo: TipoProducto.CremaParaPeinar, beneficio: "Protege el color y facilita el peinado.", imagen: "crema-antioxidante-rubios" },
    ],
  },
  {
    nombre: "Cobres Brillantes",
    ritual: "Copper Ritual",
    precioRitual: 680,
    descripcion:
      "Línea diseñada para el cuidado y mantenimiento de tonos cobrizos, buscando conservar intensidad, brillo y una apariencia saludable.",
    ingredientes: "Cacao",
    necesidades: ["cobrizo"],
    productos: [
      { nombre: "Shampoo Cobre", tipo: TipoProducto.Shampoo, beneficio: "Limpia, intensifica y realza el tono.", imagen: "shampoo-cobre" },
      { nombre: "Bálsamo Hidratante", tipo: TipoProducto.Balsamo, beneficio: "Nutre, suaviza y da brillo.", imagen: "balsamo-cobres" },
      { nombre: "Crema para Peinar", tipo: TipoProducto.CremaParaPeinar, beneficio: "Define, controla y protege el color.", imagen: "crema-cobres" },
    ],
  },
  {
    nombre: "Hidratación",
    ritual: "Hydra Ritual",
    precioRitual: 580,
    descripcion:
      "Ritual de hidratación para cabello que necesita recuperar suavidad, luminosidad y una sensación de mayor nutrición.",
    ingredientes: "Aloe vera + sangre de grado",
    necesidades: ["hidratacion"],
    productos: [
      { nombre: "Shampoo Hidratante", tipo: TipoProducto.Shampoo, beneficio: "Limpieza suave y nutritiva.", imagen: "shampoo-hidratante" },
      { nombre: "Bálsamo Hidratante", tipo: TipoProducto.Balsamo, beneficio: "Suavidad, nutrición y brillo.", imagen: "balsamo-hidratacion" },
      { nombre: "Crema para Peinar", tipo: TipoProducto.CremaParaPeinar, beneficio: "Hidratación, control y suavidad.", imagen: "crema-hidratacion" },
    ],
  },
  {
    nombre: "Reestructurante",
    ritual: "Repair Ritual",
    precioRitual: 680,
    descripcion: "Ritual especializado para cabello sensibilizado, procesado o que necesita un cuidado intensivo.",
    ingredientes: "Ácido hialurónico, células madre, colágeno",
    necesidades: ["reparacion"],
    productos: [
      { nombre: "Shampoo Ácido Hialurónico", tipo: TipoProducto.Shampoo, beneficio: "Limpia y fortalece la fibra capilar.", imagen: "shampoo-hialuronico" },
      { nombre: "Bálsamo Células Madre", tipo: TipoProducto.Balsamo, beneficio: "Repara, nutre y revitaliza.", imagen: "balsamo-celulas-madre" },
      { nombre: "Crema para Peinar Colágeno", tipo: TipoProducto.CremaParaPeinar, beneficio: "Protección, control y movimiento.", imagen: "crema-colageno" },
    ],
  },
  {
    nombre: "Crecimiento",
    ritual: "Growth Ritual",
    precioRitual: 1060,
    descripcion:
      "Una combinación de activos naturales que estimulan el crecimiento, fortalecen la raíz y mantienen un cabello más fuerte, sano y abundante.",
    ingredientes: "Romero, jengibre y biotina",
    necesidades: ["crecimiento"],
    productos: [
      { nombre: "Shampoo Estimulante", tipo: TipoProducto.Shampoo, beneficio: "Limpia, activa y fortalece la raíz.", imagen: "shampoo-estimulante" },
      { nombre: "Bálsamo Fortalecedor", tipo: TipoProducto.Balsamo, beneficio: "Nutre, desenreda y da cuerpo.", imagen: "balsamo-fortalecedor" },
      // Growth Ritual con 4 productos (25 nov 2026, datos de la clienta): la "Loción Activadora" se
      // llama "Loción Crecimiento" y se agregó el aceite. El precio del ritual cubre los 4.
      { nombre: "Loción Crecimiento", tipo: TipoProducto.Locion, beneficio: "Estimula el crecimiento y reduce la caída.", imagen: "locion-crecimiento", contenido: "50 ml" },
      {
        nombre: "Aceite Crecimiento",
        tipo: TipoProducto.Aceite,
        beneficio: "Nutre el cuero cabelludo y fortalece la fibra capilar.",
        imagen: "aceite-crecimiento",
        contenido: "50 ml",
        ingredientes: "Minoxidil, romero y bergamota",
      },
    ],
  },
  {
    nombre: "Cotton Candy",
    ritual: "Sweet Ritual",
    precioRitual: 720,
    descripcion:
      "Una fórmula inspirada en la suavidad del algodón y la calidez de la vainilla, que envuelve tu cabello en un aroma irresistible, dejándolo suave, brillante y lleno de vida.",
    ingredientes: "Extracto de vainilla y algodón",
    necesidades: ["hidratacion"],
    productos: [
      { nombre: "Shampoo Suavizante", tipo: TipoProducto.Shampoo, beneficio: "Limpia delicadamente y deja un cabello suave y sedoso.", imagen: "shampoo-suavizante" },
      { nombre: "Bálsamo Acondicionador", tipo: TipoProducto.Balsamo, beneficio: "Desenreda, hidrata y da brillo.", imagen: "balsamo-acondicionador" },
      { nombre: "Crema para Peinar Control y Suavidad", tipo: TipoProducto.CremaParaPeinar, beneficio: "Facilita el peinado, controla el frizz y deja un acabado sedoso.", imagen: "crema-control-suavidad" },
    ],
  },
  {
    nombre: "Kit Antioxidante",
    ritual: "Kit Antioxidante",
    precioRitual: 510,
    descripcion:
      "Una rutina completa para devolverle vida a tu cabello: elimina la acumulación de minerales, prepara el cabello para recibir mejor los nutrientes y potencia los resultados de tu rutina de cuidado.",
    ingredientes: "Sábila", // confirmado por la clienta (23 nov 2026)
    necesidades: ["integral"],
    productos: [
      { nombre: "Shampoo Antioxidante", tipo: TipoProducto.Shampoo, beneficio: "Limpieza profunda y protección.", imagen: "shampoo-antioxidante" },
      { nombre: "Bálsamo Antioxidante", tipo: TipoProducto.Balsamo, beneficio: "Suavidad, nutrición y brillo.", imagen: "balsamo-antioxidante" },
      { nombre: "Crema para Peinar Antioxidante", tipo: TipoProducto.CremaParaPeinar, beneficio: "Protección, control y movimiento.", imagen: "crema-antioxidante" },
    ],
  },
];

// ─────────────────────────────── Árbol del chatbot (Fase 4) ───────────────────────────────

const P1 = {
  texto: "¿De qué tono es tu cabello?",
  opciones: [
    { texto: "Rubio", necesidades: ["rubio"] },
    { texto: "Cobrizo", necesidades: ["cobrizo"] },
    { texto: "Otro tono", necesidades: [] },
  ] as { texto: string; necesidades: ClaveNecesidad[] }[],
};

const P2 = {
  texto: "¿Qué necesita principalmente tu cabello?",
  opciones: [
    { texto: "Hidratación, suavidad y nutrición", necesidades: ["hidratacion"] },
    { texto: "Reparación: está sensibilizado o procesado", necesidades: ["reparacion"] },
    { texto: "Crecimiento y fortalecimiento", necesidades: ["crecimiento"] },
    { texto: "Una rutina completa de cuidado", necesidades: ["integral"] },
    { texto: "Otra necesidad", necesidades: [] },
  ] as { texto: string; necesidades: ClaveNecesidad[] }[],
};

// ─────────────────────────────── Sucursales ───────────────────────────────
// Datos de la clienta (25 nov 2026). Un día sin renglón de horario = "Cerrado";
// una sucursal sin ningún horario no muestra la tabla.

const SUCURSALES = [
  {
    // La dueña no publica la dirección: sin dirección ni coordenadas (no sale en el mapa).
    nombre: "Estética Bugambilia",
    tipo: TipoSucursal.Propia,
    // Frase aprobada por la clienta (25 nov 2026), tal cual; reemplaza la tabla de horario.
    notaHorario: "Todos los días, con cita. Acomodamos tu horario según tu disponibilidad y la nuestra.",
    direccion: null,
    latitud: null,
    longitud: null,
    telefono: "4493419419",
    whatsapp: "4493419419",
    instagram: null,
    fotoUrl: "/img/sucursales/bugambilia.webp", // foto de la clienta (25 nov 2026)
    // TODO: dato real de la clienta (solo atiende con cita; falta definir qué mostrar como horario).
    horarios: [] as { diaSemana: number; horaApertura: string; horaCierre: string }[],
  },
  {
    nombre: "Kokoro",
    tipo: TipoSucursal.Tercero,
    direccion: "Montes Himalaya 902, Local 1, Plaza Florencia, Jardines de la Concepción II, 20120 Aguascalientes, Ags.",
    latitud: 21.9228935, // Plaza Florencia (OpenStreetMap)
    longitud: -102.2985236,
    telefono: "4495489257",
    whatsapp: "4495489257",
    instagram: "https://www.instagram.com/kokoro.showroom",
    fotoUrl: "/img/sucursales/kokoro.webp", // foto del mockup
    horarios: [
      ...[1, 2, 3, 4, 5].map((dia) => ({ diaSemana: dia, horaApertura: "10:00", horaCierre: "19:00" })),
      { diaSemana: 6, horaApertura: "10:00", horaCierre: "17:00" },
    ],
  },
];

// ─────────────────────────────── Funciones del seed ───────────────────────────────

async function sembrarNecesidades() {
  const ids = {} as Record<ClaveNecesidad, number>;
  for (const [clave, datos] of Object.entries(NECESIDADES) as [ClaveNecesidad, (typeof NECESIDADES)[ClaveNecesidad]][]) {
    const n = await prisma.necesidad.upsert({ where: { nombre: datos.nombre }, update: {}, create: datos });
    ids[clave] = n.id;
  }
  return ids;
}

async function sembrarCatalogo(necesidadIds: Record<ClaveNecesidad, number>) {
  const categoria = await prisma.categoria.upsert({
    where: { nombre: "Capilares" },
    update: {},
    create: { nombre: "Capilares" },
  });

  for (const l of LINEAS) {
    const linea = await prisma.linea.upsert({
      where: { nombre: l.nombre },
      update: {},
      create: { categoriaId: categoria.id, nombre: l.nombre, nombreRitual: l.ritual, descripcion: l.descripcion, precioRitual: l.precioRitual },
    });

    for (const p of l.productos) {
      const producto = await prisma.producto.upsert({
        where: { lineaId_nombre: { lineaId: linea.id, nombre: p.nombre } },
        update: {},
        create: {
          lineaId: linea.id,
          nombre: p.nombre,
          tipoProducto: p.tipo,
          ingredientesProtagonistas: p.ingredientes ?? l.ingredientes,
          beneficioPrincipal: p.beneficio,
          contenidoNeto: p.contenido ?? CONTENIDO_NETO,
          imagenUrl: `/img/productos/${p.imagen}.webp`, // fotos del mockup; las nuevas van a Cloudinary
          stock: 0, // la dueña captura el inventario real desde el panel
        },
      });

      await prisma.productoNecesidad.createMany({
        data: l.necesidades.map((n) => ({ productoId: producto.id, necesidadId: necesidadIds[n] })),
        skipDuplicates: true,
      });
    }
  }
}

async function sembrarArbol(necesidadIds: Record<ClaveNecesidad, number>) {
  // Si el árbol ya existe (hay pregunta inicial), no se toca: puede haberse editado en el panel.
  if (await prisma.pregunta.findFirst({ where: { esInicial: true } })) return;

  await prisma.$transaction(async (tx) => {
    const p1 = await tx.pregunta.create({ data: { texto: P1.texto, esInicial: true } });
    const p2 = await tx.pregunta.create({ data: { texto: P2.texto, esInicial: false } });

    const pasos = [
      { preguntaId: p1.id, siguienteId: p2.id, opciones: P1.opciones },
      { preguntaId: p2.id, siguienteId: null, opciones: P2.opciones }, // null = fin del árbol
    ];
    // Secuencial para que el orden de id respete el orden de las opciones.
    for (const { preguntaId, siguienteId, opciones } of pasos) {
      for (const o of opciones) {
        await tx.opcion.create({
          data: {
            preguntaId,
            texto: o.texto,
            preguntaSiguienteId: siguienteId,
            necesidades: { create: o.necesidades.map((n) => ({ necesidadId: necesidadIds[n] })) },
          },
        });
      }
    }
  });
}

async function sembrarSucursales() {
  for (const { horarios, ...s } of SUCURSALES) {
    const existe = await prisma.sucursal.findUnique({ where: { nombre: s.nombre } });
    if (existe) continue;
    await prisma.sucursal.create({ data: { ...s, horarios: { create: horarios } } });
  }
}

async function sembrarAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.warn("⚠ Sin ADMIN_EMAIL en .env: no se creó la cuenta admin.");
    return;
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    console.log("· La cuenta admin ya existe; no se modifica (la contraseña se cambia con la recuperación).");
    return;
  }
  if (!password || password.length < 8) {
    console.warn("⚠ ADMIN_PASSWORD falta o tiene menos de 8 caracteres: no se creó la cuenta admin.");
    return;
  }

  const userId = randomUUID();
  await prisma.user.create({
    data: {
      id: userId,
      name: "Bugambilia Hair Boutique",
      email,
      emailVerified: true,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: "credential", // así guarda Better Auth el login con correo y contraseña
          password: await hashPassword(password),
        },
      },
    },
  });
  console.log("✓ Cuenta admin creada.");
}

async function main() {
  const necesidadIds = await sembrarNecesidades();
  await sembrarCatalogo(necesidadIds);
  await sembrarArbol(necesidadIds);
  await sembrarSucursales();
  await sembrarAdmin();

  const [lineas, productos, relaciones, preguntas, opciones, sucursales, horarios] = await Promise.all([
    prisma.linea.count(),
    prisma.producto.count(),
    prisma.productoNecesidad.count(),
    prisma.pregunta.count(),
    prisma.opcion.count(),
    prisma.sucursal.count(),
    prisma.horario.count(),
  ]);
  console.log(
    `✓ Seed listo: ${lineas} líneas, ${productos} productos, ${relaciones} producto–necesidad, ` +
      `${preguntas} preguntas, ${opciones} opciones, ${sucursales} sucursales, ${horarios} horarios.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
