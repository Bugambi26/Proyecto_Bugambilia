// Formato de las respuestas de /api/chatbot. Sin acceso a la base: lo usan la API y el widget.

// GET /api/chatbot — el árbol de preguntas.
export type OpcionArbol = {
  id: number;
  texto: string;
  siguienteId: number | null; // null = fin del árbol
  necesidades: number[]; // ids de las necesidades que activa
};
export type PreguntaArbol = { id: number; texto: string; opciones: OpcionArbol[] };

export type RespuestaArbol =
  | { estado: "listo"; inicialId: number; preguntas: PreguntaArbol[] }
  // Árbol roto (sin pregunta inicial, con ciclos, etc.): el widget muestra la cita de diagnóstico.
  | { estado: "roto" };

// POST /api/chatbot — la recomendación.
export type PeticionRecomendacion = { necesidades: number[] }; // en el orden en que se activaron

export type ProductoRecomendado = {
  id: number;
  nombre: string;
  paso: string; // "Limpieza" | "Tratamiento" | "Finalización"
  beneficio: string;
  imagenUrl: string | null;
  href: string;
};

export type RitualRecomendado = {
  lineaId: number;
  linea: string; // "Rubios Perfectos" (para el color de la línea)
  ritual: string; // "Blonde Ritual"
  precioRitual: string | null; // precio del ritual completo, ya formateado; null = no se muestra
  mensaje: string;
  productos: ProductoRecomendado[];
};

export type RespuestaRecomendacion =
  | {
      tipo: "recomendacion";
      introduccion: string;
      rituales: RitualRecomendado[];
      cierre: string; // firma de la marca, siempre la arma el código
      origen: "ia" | "plantilla"; // de dónde salieron introducción y mensajes
    }
  // Ningún producto disponible cubre las necesidades: no se llama a la IA.
  | { tipo: "diagnostico" };
