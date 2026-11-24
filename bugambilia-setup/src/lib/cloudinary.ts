import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// Imágenes que sube el panel (productos y, después, sucursales). En la base solo
// se guarda la URL; el public_id para borrarla se saca de esa misma URL.

// Se configura en la primera subida y no al importar: si faltan las variables en
// Netlify, falla solo la subida y no todo el panel.
function cliente() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Faltan las variables de Cloudinary en el entorno.");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

// Sube la imagen a la carpeta indicada y devuelve su URL https.
export async function subirImagen(archivo: File, carpeta: string): Promise<string> {
  const datos = Buffer.from(await archivo.arrayBuffer());
  const respuesta = await new Promise<UploadApiResponse>((resolver, rechazar) => {
    cliente()
      .uploader.upload_stream({ folder: carpeta, resource_type: "image" }, (error, resultado) =>
        error || !resultado ? rechazar(error ?? new Error("Cloudinary no devolvió resultado")) : resolver(resultado),
      )
      .end(datos);
  });
  return respuesta.secure_url;
}

// ¿La URL es de una imagen subida a Cloudinary? Las del seed (/img/…) no lo son.
export function esDeCloudinary(url: string | null): url is string {
  return !!url && url.startsWith("https://res.cloudinary.com/");
}

// Borra una imagen de Cloudinary a partir de su URL. Si falla solo se registra:
// una imagen huérfana no debe impedir guardar el producto.
export async function borrarImagen(url: string | null) {
  if (!esDeCloudinary(url)) return;
  // …/image/upload/v1712345678/bugambilia/productos/abc.webp → bugambilia/productos/abc
  const publicId = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i)?.[1];
  if (!publicId) return;
  try {
    await cliente().uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("No se pudo borrar la imagen de Cloudinary:", publicId, error);
  }
}
