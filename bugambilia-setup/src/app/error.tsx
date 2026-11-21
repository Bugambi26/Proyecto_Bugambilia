"use client"; // Los límites de error deben ser componentes de cliente

import { useEffect } from "react";

export default function ErrorDePagina({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs tracking-[0.3em] text-cafe uppercase">Algo salió mal</p>
      <h1 className="mt-4 font-serif text-4xl text-cafe-oscuro">No pudimos cargar esta página</h1>
      <p className="mt-4 leading-relaxed text-cafe">Intenta de nuevo en unos momentos.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 rounded-full bg-bugambilia px-8 py-3 text-sm tracking-[0.14em] text-crema uppercase transition-opacity hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}
