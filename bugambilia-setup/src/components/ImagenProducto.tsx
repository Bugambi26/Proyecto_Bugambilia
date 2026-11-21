import Image from "next/image";
import logo from "../../public/logo-bugambilia.png";

type Props = {
  imagenUrl: string | null;
  nombre: string;
  colorFondo: string;
  sizes: string;
  prioridad?: boolean;
};

// Imagen del producto (Cloudinary) o, si no tiene, el logo sobre el color de su línea.
export function ImagenProducto({ imagenUrl, nombre, colorFondo, sizes, prioridad }: Props) {
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-sm ring-1 ring-cafe/10 ring-inset"
      style={{ backgroundColor: colorFondo }}
    >
      {imagenUrl ? (
        <Image src={imagenUrl} alt={nombre} fill sizes={sizes} priority={prioridad} className="object-cover" />
      ) : (
        <Image
          src={logo}
          alt=""
          aria-hidden
          sizes={sizes}
          className="absolute inset-0 m-auto w-3/5 opacity-25"
        />
      )}
    </div>
  );
}
