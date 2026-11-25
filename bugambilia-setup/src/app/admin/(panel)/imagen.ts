// Utilidades de imagen del panel (solo navegador): las usan productos y sucursales.

// Reduce la imagen a "max" px por el lado mayor y la convierte a WebP (o JPEG si
// el navegador no sabe hacer WebP), igual que el mockup. Así pesa poco al subirla.
export function reducirImagen(archivo: File, max: number, nombre = "imagen"): Promise<File> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new window.Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.width * k);
      lienzo.height = Math.round(img.height * k);
      lienzo.getContext("2d")!.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      lienzo.toBlob(
        (webp) => {
          if (webp?.type === "image/webp") return resolver(new File([webp], `${nombre}.webp`, { type: "image/webp" }));
          lienzo.toBlob(
            (jpg) => (jpg ? resolver(new File([jpg], `${nombre}.jpg`, { type: "image/jpeg" })) : rechazar(new Error())),
            "image/jpeg",
            0.8,
          );
        },
        "image/webp",
        0.8,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}
