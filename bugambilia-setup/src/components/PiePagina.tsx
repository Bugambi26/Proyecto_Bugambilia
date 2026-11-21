import Image from "next/image";
import logo from "../../public/logo-bugambilia.png";
import { CONTACTO, FIRMA } from "@/lib/contacto";

export function PiePagina() {
  return (
    <footer className="mt-20 bg-cafe-oscuro text-crema">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6">
        {/* El logo es café oscuro: se vuelve claro sobre el fondo del pie. */}
        <Image src={logo} alt="Bugambilia Hair Boutique" className="h-14 w-auto opacity-90 brightness-0 invert" />
        <p className="font-serif text-xl italic">{FIRMA}</p>
        <ul className="flex gap-6 text-sm tracking-[0.12em] uppercase">
          <li>
            <a href={CONTACTO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-oro">
              Instagram
            </a>
          </li>
          <li>
            <a href={CONTACTO.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-oro">
              WhatsApp
            </a>
          </li>
        </ul>
        <p className="text-xs text-arena/80">Bugambilia Hair Boutique · Aguascalientes</p>
      </div>
    </footer>
  );
}
