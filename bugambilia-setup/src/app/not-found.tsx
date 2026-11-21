import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-xs tracking-[0.3em] text-cafe uppercase">Página no encontrada</p>
      <h1 className="mt-4 font-serif text-4xl text-cafe-oscuro">No encontramos lo que buscas</h1>
      <p className="mt-4 leading-relaxed text-cafe">Es posible que el enlace haya cambiado o que el producto ya no esté disponible.</p>
      <Link
        href="/productos"
        className="mt-8 inline-block rounded-full bg-bugambilia px-8 py-3 text-sm tracking-[0.14em] text-crema uppercase transition-opacity hover:opacity-90"
      >
        Ver los rituales
      </Link>
    </div>
  );
}
