import Image from "next/image";

type Props = {
  imagenUrl: string | null;
  alt?: string;
  className?: string;
  sizes: string;
  prioridad?: boolean;
};

// Foto del producto (fondo beige, sin recortar la botella) o, si no tiene, el logo.
export function ImagenProducto({ imagenUrl, alt = "", className = "", sizes, prioridad }: Props) {
  return (
    <Image
      className={`ph ph--product${imagenUrl ? "" : " ph--logo"} ${className}`.trim()}
      src={imagenUrl ?? "/img/logo.webp"}
      alt={alt}
      width={700}
      height={700}
      sizes={sizes}
      priority={prioridad}
    />
  );
}
