"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

// Paso 0 del mockup: iniciar sesión.
// TODO (siguiente paso): vistas "recuperar" y "nueva" con Resend.
export function FormularioLogin() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError(false);

    const { error } = await authClient.signIn.email({
      email: String(datos.get("correo")).trim().toLowerCase(),
      password: String(datos.get("pass")),
    });

    if (error) {
      setError(true);
      setEnviando(false);
      return;
    }
    router.replace("/admin/inventario");
  }

  return (
    <form className="auth__form" onSubmit={entrar} noValidate>
      <span className="lbl">Panel de administración · 1 cuenta</span>
      <h1 className="auth__title">Iniciar sesión</h1>
      <div className="field">
        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          name="correo"
          type="email"
          className="input"
          placeholder="dueña@correo.com"
          autoComplete="username"
          required
          aria-invalid={error}
        />
      </div>
      <div className="field">
        <label htmlFor="pass">Contraseña</label>
        <input
          id="pass"
          name="pass"
          type="password"
          className="input"
          autoComplete="current-password"
          required
          aria-invalid={error}
        />
      </div>
      <p className="alert" role="alert" hidden={!error}>
        Correo o contraseña incorrectos.
      </p>
      <button type="submit" className="btn btn--primary" disabled={enviando}>
        Entrar
      </button>
      <button type="button" className="btn-link">
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}
