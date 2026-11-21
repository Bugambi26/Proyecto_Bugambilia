// Enlaces de contacto de Bugambilia Hair Boutique (dados por la clienta).

export const CONTACTO = {
  instagram: "https://www.instagram.com/buga.mbilia2020",
  // Abre un mensaje directo en Instagram (cita de diagnóstico).
  instagramMensaje: "https://ig.me/m/buga.mbilia2020",
  whatsapp: "https://w.app/bugambilia",
} as const;

// TEMPORAL hasta la S14: los botones del asistente ("Encuentra tu ritual", "Hablar con el
// asistente", la burbuja) llevan al mensaje directo de Instagram. Cuando exista el widget
// del chatbot, estos botones lo abrirán en su lugar.
export const ENLACE_ASISTENTE = CONTACTO.instagramMensaje;

export const FIRMA = "Tu cabello. Tu ritual. Tu Bugambilia.";
