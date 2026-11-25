import { describe, expect, it } from "vitest";
import type { TipoProducto } from "@/generated/prisma/enums";
import { MAX_RITUALES, seleccionarRituales, type ProductoCandidato } from "./seleccion";

// Copia del catálogo del seed (7 líneas, 22 productos), con los ids en el orden del catálogo.
const N = { rubio: 1, cobrizo: 2, hidratacion: 3, reparacion: 4, crecimiento: 5, integral: 6 } as const;
const L = { blonde: 1, copper: 2, hydra: 3, repair: 4, growth: 5, cotton: 6, kit: 7 } as const;

const LINEAS: [linea: number, necesidad: number, tipos: TipoProducto[]][] = [
  [L.blonde, N.rubio, ["Shampoo", "Mascarilla", "CremaParaPeinar"]],
  [L.copper, N.cobrizo, ["Shampoo", "Balsamo", "CremaParaPeinar"]],
  [L.hydra, N.hidratacion, ["Shampoo", "Balsamo", "CremaParaPeinar"]],
  [L.repair, N.reparacion, ["Shampoo", "Balsamo", "CremaParaPeinar"]],
  [L.growth, N.crecimiento, ["Shampoo", "Balsamo", "Locion", "Aceite"]], // 4 productos desde el 25 nov 2026
  [L.cotton, N.hidratacion, ["Shampoo", "Balsamo", "CremaParaPeinar"]],
  [L.kit, N.integral, ["Shampoo", "Balsamo", "CremaParaPeinar"]],
];

function catalogo(cambios: (p: ProductoCandidato) => Partial<ProductoCandidato> = () => ({})): ProductoCandidato[] {
  let id = 0;
  return LINEAS.flatMap(([lineaId, necesidad, tipos]) =>
    tipos.map((tipoProducto) => {
      const p: ProductoCandidato = { id: ++id, tipoProducto, activo: true, stock: 5, lineaId, necesidades: [necesidad] };
      return { ...p, ...cambios(p) };
    }),
  );
}

// Respuestas del árbol: P1 (tono) y P2 (necesidad); "Otro tono" y "Otra necesidad" no activan nada.
const P1 = { rubio: [N.rubio], cobrizo: [N.cobrizo], otro: [] };
const P2 = {
  hidratacion: [N.hidratacion],
  reparacion: [N.reparacion],
  crecimiento: [N.crecimiento],
  completa: [N.integral],
  otra: [],
};

const lineas = (r: ReturnType<typeof seleccionarRituales>) => r.map((x) => x.lineaId);
const cuantos = (r: ReturnType<typeof seleccionarRituales>) => r.map((x) => x.productos.length);

describe("casos esperados de la Fase 4 (catálogo de 22 productos)", () => {
  const todos = catalogo();

  it("Rubio + Reparación → Blonde + Repair", () => {
    const r = seleccionarRituales([...P1.rubio, ...P2.reparacion], todos);
    expect(lineas(r)).toEqual([L.blonde, L.repair]);
    expect(cuantos(r)).toEqual([3, 3]);
  });

  it("Rubio + Hidratación → Blonde + Hydra (Cotton Candy queda fuera por el límite)", () => {
    const r = seleccionarRituales([...P1.rubio, ...P2.hidratacion], todos);
    expect(lineas(r)).toEqual([L.blonde, L.hydra]);
  });

  it("Otro tono + Hidratación → Hydra + Cotton Candy (empate: gana el orden del catálogo)", () => {
    const r = seleccionarRituales([...P1.otro, ...P2.hidratacion], todos);
    expect(lineas(r)).toEqual([L.hydra, L.cotton]);
    expect(cuantos(r)).toEqual([3, 3]);
  });

  it("Otro tono + Rutina completa → Kit Antioxidante", () => {
    const r = seleccionarRituales([...P1.otro, ...P2.completa], todos);
    expect(lineas(r)).toEqual([L.kit]);
  });

  it("Cobrizo + Otra necesidad → Copper", () => {
    const r = seleccionarRituales([...P1.cobrizo, ...P2.otra], todos);
    expect(lineas(r)).toEqual([L.copper]);
    expect(cuantos(r)).toEqual([3]);
  });

  it("Otro tono + Otra necesidad → ninguno (cita de diagnóstico)", () => {
    expect(seleccionarRituales([...P1.otro, ...P2.otra], todos)).toEqual([]);
  });

  it("Cobrizo + Crecimiento → Copper + Growth (el color va primero)", () => {
    const r = seleccionarRituales([...P1.cobrizo, ...P2.crecimiento], todos);
    expect(lineas(r)).toEqual([L.copper, L.growth]);
  });
});

describe("filtro de disponibilidad (regla 1)", () => {
  it("un producto agotado no entra; el resto de su ritual sí", () => {
    const r = seleccionarRituales(P2.crecimiento, catalogo((p) => (p.tipoProducto === "Locion" ? { stock: 0 } : {})));
    expect(cuantos(r)).toEqual([3]);
    expect(r[0].productos.some((p) => p.tipoProducto === "Locion")).toBe(false);
  });

  it("un producto inactivo no entra aunque tenga stock", () => {
    const r = seleccionarRituales(P1.rubio, catalogo((p) => (p.id === 1 ? { activo: false } : {})));
    expect(r[0].productos.map((p) => p.id)).toEqual([2, 3]);
  });

  it("si todo lo que cubre la necesidad está agotado → ninguno (cita de diagnóstico)", () => {
    const r = seleccionarRituales(P2.completa, catalogo((p) => (p.lineaId === L.kit ? { stock: 0 } : {})));
    expect(r).toEqual([]);
  });

  it("con todo el stock en 0 → ninguno", () => {
    expect(seleccionarRituales([N.rubio, N.hidratacion], catalogo(() => ({ stock: 0 })))).toEqual([]);
  });

  it("sin necesidades activas → ninguno", () => {
    expect(seleccionarRituales([], catalogo())).toEqual([]);
  });
});

describe("orden y límite de rituales (reglas 4 y 5)", () => {
  it("si el ritual del color está agotado, pasa al siguiente", () => {
    const r = seleccionarRituales(
      [...P1.rubio, ...P2.hidratacion],
      catalogo((p) => (p.lineaId === L.blonde ? { stock: 0 } : {})),
    );
    expect(lineas(r)).toEqual([L.hydra, L.cotton]);
  });

  it(`nunca devuelve más de ${MAX_RITUALES} rituales`, () => {
    const r = seleccionarRituales([N.rubio, N.cobrizo, N.hidratacion, N.reparacion, N.crecimiento, N.integral], catalogo());
    expect(r).toHaveLength(MAX_RITUALES);
    expect(lineas(r)).toEqual([L.blonde, L.copper]);
  });

  it("entre rituales de la misma necesidad gana el más específico (menos etiquetas)", () => {
    // Hydra con una etiqueta extra: Cotton Candy pasa a ser más específico.
    const r = seleccionarRituales(
      P2.hidratacion,
      catalogo((p) => (p.lineaId === L.hydra ? { necesidades: [N.hidratacion, N.reparacion] } : {})),
    );
    expect(lineas(r)).toEqual([L.cotton, L.hydra]);
  });

  it("un ritual que cubre la necesidad de P1 va primero aunque también cubra la de P2", () => {
    const r = seleccionarRituales(
      [N.reparacion, N.hidratacion],
      catalogo((p) => (p.lineaId === L.hydra ? { necesidades: [N.hidratacion, N.reparacion] } : {})),
    );
    expect(lineas(r)[0]).toBe(L.repair);
  });

  it("las necesidades repetidas no cambian el resultado", () => {
    const todos = catalogo();
    expect(seleccionarRituales([N.rubio, N.rubio, N.reparacion], todos)).toEqual(
      seleccionarRituales([N.rubio, N.reparacion], todos),
    );
  });
});

describe("orden de rutina dentro del ritual (regla 6)", () => {
  it("limpieza → tratamiento → finalización, aunque el catálogo venga desordenado", () => {
    const r = seleccionarRituales(P1.rubio, [...catalogo()].reverse());
    expect(r[0].productos.map((p) => p.tipoProducto)).toEqual(["Shampoo", "Mascarilla", "CremaParaPeinar"]);
  });

  it("dos tratamientos empatan por orden del catálogo (Growth: Bálsamo antes que Loción; el aceite al final)", () => {
    const r = seleccionarRituales(P2.crecimiento, [...catalogo()].reverse());
    expect(r[0].productos.map((p) => p.tipoProducto)).toEqual(["Shampoo", "Balsamo", "Locion", "Aceite"]);
  });

  it("es determinista: misma entrada, mismo resultado", () => {
    const todos = catalogo();
    const a = seleccionarRituales([N.rubio, N.hidratacion], todos);
    const b = seleccionarRituales([N.rubio, N.hidratacion], todos);
    expect(a).toEqual(b);
  });
});
