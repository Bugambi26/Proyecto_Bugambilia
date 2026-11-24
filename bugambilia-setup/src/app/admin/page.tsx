import { redirect } from "next/navigation";

// /admin (el enlace del pie de página) abre el inventario.
export default function Admin() {
  redirect("/admin/inventario");
}
