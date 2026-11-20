// Seed de Bugambilia Hair Boutique.
// Fuentes: docs/catalogo-productos-y-servicios-bugambilia.md y docs/fase-4-motor-chatbot.md.
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
// El orden de este arreglo es el "orden del catálogo" (desempate del chatbot).

type ProductoSeed = {
  nombre: string;
  tipo: TipoProducto;
  ingredientes?: string; // si falta, se usan los de la línea
  beneficio: string;
};

type LineaSeed = {
  nombre: string;
  ritual: string;
  descripcion: string;
  ingredientes: string;
  necesidades: ClaveNecesidad[];
  productos: ProductoSeed[];
};

const LINEAS: LineaSeed[] = [
  {
    nombre: "Rubios Perfectos",
    ritual: "Blonde Ritual",
    descripcion:
      "Línea especializada en el mantenimiento y cuidado de cabellos rubios, para conservar una apariencia luminosa, brillante y tonalmente equilibrada.",
    ingredientes: "Aceite de pepita de uva",
    necesidades: ["rubio"],
    productos: [
      {
        nombre: "Shampoo Matizante",
        tipo: TipoProducto.Shampoo,
        beneficio: "Limpia el cabello rubio y ayuda a mantener un tono equilibrado.",
      },
      {
        nombre: "Mascarilla Matizante",
        tipo: TipoProducto.Mascarilla,
        beneficio: "Tratamiento para cabello rubio que ayuda a conservar un tono equilibrado y luminoso.",
      },
      {
        nombre: "Crema para Peinar Antioxidante",
        tipo: TipoProducto.CremaParaPeinar,
        beneficio: "Finaliza el peinado del cabello rubio con un acabado luminoso y brillante.",
      },
    ],
  },
  {
    nombre: "Cobres Brillantes",
    ritual: "Copper Ritual",
    descripcion:
      "Cuidado y mantenimiento de tonos cobrizos, para conservar intensidad, brillo y una apariencia saludable.",
    ingredientes: "Cacao",
    necesidades: ["cobrizo"],
    productos: [
      {
        nombre: "Shampoo Cobre",
        tipo: TipoProducto.Shampoo,
        beneficio: "Limpia el cabello cobrizo y ayuda a conservar la intensidad de su tono.",
      },
      {
        nombre: "Bálsamo Hidratante",
        tipo: TipoProducto.Balsamo,
        beneficio: "Tratamiento hidratante para mantener el brillo y la apariencia saludable del cabello cobrizo.",
      },
      {
        nombre: "Crema para Peinar",
        tipo: TipoProducto.CremaParaPeinar,
        beneficio: "Finaliza el peinado del cabello cobrizo con un acabado brillante y de aspecto saludable.",
      },
    ],
  },
  {
    nombre: "Hidratación",
    ritual: "Hydra Ritual",
    descripcion:
      "Ritual de hidratación para cabello que necesita recuperar suavidad, luminosidad y una sensación de mayor nutrición.",
    ingredientes: "Aloe vera + sangre de grado",
    necesidades: ["hidratacion"],
    productos: [
      {
        nombre: "Shampoo Hidratante",
        tipo: TipoProducto.Shampoo,
        beneficio: "Limpia el cabello mientras ayuda a recuperar su suavidad.",
      },
      {
        nombre: "Bálsamo Hidratante",
        tipo: TipoProducto.Balsamo,
        beneficio: "Tratamiento que aporta nutrición y suavidad al cabello.",
      },
      {
        nombre: "Crema para Peinar",
        tipo: TipoProducto.CremaParaPeinar,
        beneficio: "Finaliza el peinado con un cabello suave y luminoso.",
      },
    ],
  },
  {
    nombre: "Reestructurante",
    ritual: "Repair Ritual",
    descripcion: "Ritual especializado para cabello sensibilizado, procesado o que necesita un cuidado intensivo.",
    ingredientes: "", // Repair define el ingrediente por producto
    necesidades: ["reparacion"],
    productos: [
      {
        nombre: "Shampoo con Ácido Hialurónico",
        tipo: TipoProducto.Shampoo,
        ingredientes: "Ácido hialurónico",
        beneficio: "Limpieza pensada para cabello sensibilizado o procesado.",
      },
      {
        nombre: "Bálsamo con Células Madre",
        tipo: TipoProducto.Balsamo,
        ingredientes: "Células madre",
        beneficio: "Tratamiento de cuidado intensivo para cabello sensibilizado o procesado.",
      },
      {
        nombre: "Crema para Peinar con Colágeno + Tres Aceites",
        tipo: TipoProducto.CremaParaPeinar,
        ingredientes: "Colágeno + mezcla de tres aceites",
        beneficio: "Finaliza el peinado del cabello procesado como parte de su ritual de cuidado intensivo.",
      },
    ],
  },
  {
    nombre: "Crecimiento",
    ritual: "Growth Ritual",
    descripcion:
      "Línea enfocada en el cuidado del cuero cabelludo y en rutinas orientadas al crecimiento y fortalecimiento del cabello.",
    ingredientes: "Minoxidil + bergamota + otros activos",
    necesidades: ["crecimiento"],
    productos: [
      {
        nombre: "Shampoo",
        tipo: TipoProducto.Shampoo,
        beneficio:
          "Limpia el cuero cabelludo como primer paso de una rutina orientada al crecimiento y fortalecimiento del cabello.",
      },
      {
        nombre: "Loción",
        tipo: TipoProducto.Locion,
        beneficio: "Tratamiento para el cuero cabelludo, orientado al crecimiento y fortalecimiento del cabello.",
      },
      {
        nombre: "Aceite",
        tipo: TipoProducto.Aceite,
        beneficio:
          "Tratamiento para el cuero cabelludo que complementa la rutina de crecimiento y fortalecimiento del cabello.",
      },
    ],
  },
  {
    nombre: "Cotton Candy",
    ritual: "The Complete Hair Ritual",
    descripcion:
      "La línea más amplia de Bugambilia. Ritual integral que combina antioxidantes, hidratación, colágeno y elastina para una experiencia completa de cuidado, desde la limpieza hasta el tratamiento y la finalización del cabello.",
    ingredientes: "Antioxidantes + hidratación + colágeno + elastina",
    necesidades: ["integral", "hidratacion"],
    productos: [
      {
        nombre: "Shampoo",
        tipo: TipoProducto.Shampoo,
        beneficio: "Primer paso del ritual integral: limpieza del cabello.",
      },
      {
        nombre: "Mascarilla",
        tipo: TipoProducto.Mascarilla,
        beneficio: "Tratamiento del ritual integral con antioxidantes, hidratación, colágeno y elastina.",
      },
      {
        nombre: "Bálsamo",
        tipo: TipoProducto.Balsamo,
        beneficio: "Tratamiento del ritual integral para un cabello cuidado y nutrido.",
      },
      {
        nombre: "Crema para Peinar",
        tipo: TipoProducto.CremaParaPeinar,
        beneficio: "Finalización del ritual integral para un acabado cuidado.",
      },
      {
        nombre: "Aceite",
        tipo: TipoProducto.Aceite,
        beneficio: "Último paso del ritual integral: finalización del cabello.",
      },
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
// TODO: dato real de la clienta (dirección, coordenadas, teléfono, WhatsApp y horario).
// Valores de ejemplo para poder desarrollar el mapa y los horarios.

const HORARIO_EJEMPLO = [1, 2, 3, 4, 5, 6].map((dia) => ({
  diaSemana: dia, // lunes a sábado; domingo sin renglón = "Cerrado"
  horaApertura: "10:00", // TODO: dato real de la clienta
  horaCierre: "20:00", // TODO: dato real de la clienta
}));

const SUCURSALES = [
  {
    nombre: "Estética Bugambilia",
    tipo: TipoSucursal.Propia,
    direccion: "Dirección pendiente, Aguascalientes, Ags.", // TODO: dato real de la clienta
    latitud: 21.8818, // TODO: dato real de la clienta (centro de Aguascalientes)
    longitud: -102.2916, // TODO: dato real de la clienta
    telefono: null, // TODO: dato real de la clienta
    whatsapp: null, // TODO: dato real de la clienta
  },
  {
    nombre: "Kokoro",
    tipo: TipoSucursal.Tercero,
    direccion: "Dirección pendiente, Aguascalientes, Ags.", // TODO: dato real de la clienta
    latitud: 21.8853, // TODO: dato real de la clienta
    longitud: -102.2869, // TODO: dato real de la clienta
    telefono: null, // TODO: dato real de la clienta
    whatsapp: null, // TODO: dato real de la clienta
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
      create: { categoriaId: categoria.id, nombre: l.nombre, nombreRitual: l.ritual, descripcion: l.descripcion },
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
  for (const s of SUCURSALES) {
    const existe = await prisma.sucursal.findUnique({ where: { nombre: s.nombre } });
    if (existe) continue;
    await prisma.sucursal.create({ data: { ...s, horarios: { create: HORARIO_EJEMPLO } } });
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
