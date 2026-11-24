import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Lee la sesión del admin en el servidor; si no hay, manda al login.
// Úsala en el layout del panel y al inicio de cada Server Action del panel:
// el proxy solo revisa que exista la cookie, no que la sesión sea válida.
export async function requerirSesion() {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) {
    redirect("/admin/login");
  }
  return sesion;
}
