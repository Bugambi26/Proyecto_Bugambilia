import { ENLACE_ASISTENTE } from "@/lib/contacto";

// Burbuja flotante del asistente. TEMPORAL hasta la S14: lleva al mensaje directo de
// Instagram; después abrirá el widget del chatbot.
export function BurbujaChat() {
  return (
    <a
      href={ENLACE_ASISTENTE}
      className="chat-bubble"
      aria-label="Abrir asistente de recomendación"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      </svg>
    </a>
  );
}
