import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FormularioConEnlace, FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

// Igual a admin/login.html del mockup.
export default function Login() {
  return (
    <main className="auth">
      <div className="auth__box">
        <Image
          className="logo auth__logo"
          src="/img/logo.webp"
          alt="Bugambilia Hair Boutique"
          width={170}
          height={80}
          style={{ width: "auto" }}
          priority
        />
        <Suspense fallback={<FormularioLogin />}>
          <FormularioConEnlace />
        </Suspense>
        <Link href="/" style={{ textAlign: "center", fontSize: 14, padding: 10 }}>
          ← Volver al sitio
        </Link>
      </div>
    </main>
  );
}
