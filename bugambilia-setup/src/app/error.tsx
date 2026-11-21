"use client"; // Los límites de error deben ser componentes de cliente

import { useEffect } from "react";

export default function ErrorDePagina({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container section">
      <div className="empty stack gap-16" style={{ alignItems: "center" }}>
        <h1 className="title-sm">No pudimos cargar esta página</h1>
        <p>Intenta de nuevo en unos momentos.</p>
        <button type="button" className="btn btn--primary" onClick={() => retry()}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
