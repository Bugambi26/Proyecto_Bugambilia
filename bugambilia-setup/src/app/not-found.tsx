import Link from "next/link";

// Igual al estado "Producto no disponible" del mockup.
export default function NoEncontrado() {
  return (
    <div className="container section">
      <div className="empty stack gap-16" style={{ alignItems: "center" }}>
        <h1 className="title-sm">Producto no disponible</h1>
        <p>Este producto no existe o ya no está en el catálogo.</p>
        <Link href="/productos" className="btn btn--primary">
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
