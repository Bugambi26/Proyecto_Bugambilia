import { Suspense } from "react";
import { requerirSesion } from "@/lib/auth-sesion";
import { MenuLateral } from "./MenuLateral";

// Estructura de todas las páginas del panel (igual en todo el mockup).
// El contenido solo se muestra después de validar la sesión en el servidor.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <MenuLateral />
      <main className="admin-main">
        <Suspense fallback={null}>
          <ConSesion>{children}</ConSesion>
        </Suspense>
      </main>
    </div>
  );
}

async function ConSesion({ children }: { children: React.ReactNode }) {
  await requerirSesion();
  return children;
}
