// Enlaces de contacto de Bugambilia Hair Boutique (dados por la clienta).

export const CONTACTO = {
  instagram: "https://www.instagram.com/buga.mbilia2020",
  // Abre un mensaje directo en Instagram (cita de diagnóstico).
  instagramMensaje: "https://ig.me/m/buga.mbilia2020",
  whatsapp: "https://w.app/bugambilia",
  // Número de WhatsApp de la clienta (+52 1 449 341 9419), en el formato de wa.me (52 + 10 dígitos).
  whatsappNumero: "524493419419",
} as const;

// Enlace que abre WhatsApp con el mensaje ya escrito ("Arma tu ritual" del chatbot).
// El enlace corto w.app no permite llevar texto; wa.me sí.
export function enlaceWhatsApp(texto: string) {
  return `https://wa.me/${CONTACTO.whatsappNumero}?text=${encodeURIComponent(texto)}`;
}

export const FIRMA = "Tu cabello. Tu ritual. Tu Bugambilia.";
