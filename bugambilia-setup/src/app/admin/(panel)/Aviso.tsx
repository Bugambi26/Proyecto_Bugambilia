"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CLAVE_PENDIENTE = "bugambilia:toast";

// Aviso flotante del mockup ("Producto reactivado"): se ve 2.2 s y se quita solo.
export function useAviso() {
  const [mensaje, setMensaje] = useState("");
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrar = useCallback((texto: string) => {
    clearTimeout(temporizador.current);
    setMensaje(texto);
    temporizador.current = setTimeout(() => setMensaje(""), 2200);
  }, []);

  // Aviso dejado por la página anterior (p. ej. "Cambios guardados" al volver
  // del formulario), igual que toastSiguiente() del mockup.
  useEffect(() => {
    let pendiente: string | null = null;
    try {
      pendiente = sessionStorage.getItem(CLAVE_PENDIENTE);
      sessionStorage.removeItem(CLAVE_PENDIENTE);
    } catch {
      // Sin almacenamiento: no hay aviso pendiente.
    }
    if (pendiente) {
      const t = setTimeout(() => mostrar(pendiente), 50);
      return () => clearTimeout(t);
    }
  }, [mostrar]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const aviso = mensaje ? (
    <div className="toast" role="status">
      {mensaje}
    </div>
  ) : null;

  return { aviso, mostrar };
}

// Deja un aviso para mostrarlo en la siguiente página del panel.
export function avisarEnSiguientePagina(texto: string) {
  try {
    sessionStorage.setItem(CLAVE_PENDIENTE, texto);
  } catch {
    // Sin almacenamiento: se pierde el aviso, no pasa nada.
  }
}
