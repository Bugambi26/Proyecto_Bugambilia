"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Vista = "login" | "recuperar" | "nueva";

// El enlace del correo regresa a /admin/login con ?token=… (válido) o
// ?error=INVALID_TOKEN (vencido o falso). Va dentro de <Suspense>: mientras
// llegan los parámetros se ve FormularioLogin sin ellos (vista de login).
export function FormularioConEnlace() {
  const params = useSearchParams();
  return <FormularioLogin token={params.get("token") ?? ""} enlaceInvalido={params.has("error")} />;
}

// Las tres vistas de admin/login.html: iniciar sesión, pedir el enlace de
// recuperación y crear la nueva contraseña.
export function FormularioLogin({
  token: tokenInicial = "",
  enlaceInvalido: invalidoInicial = false,
}: {
  token?: string;
  enlaceInvalido?: boolean;
}) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>(tokenInicial ? "nueva" : invalidoInicial ? "recuperar" : "login");
  const [token] = useState(tokenInicial);
  const [enlaceInvalido, setEnlaceInvalido] = useState(invalidoInicial);
  const caja = useRef<HTMLDivElement>(null);
  const primerRender = useRef(true);

  // Quita el token de la barra de direcciones (y del historial).
  useEffect(() => {
    if (tokenInicial || invalidoInicial) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [tokenInicial, invalidoInicial]);

  // Como en el mockup: al cambiar de vista, el foco va al primer campo.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    caja.current?.querySelector<HTMLInputElement>("form:not([hidden]) input")?.focus();
  }, [vista]);

  function ir(destino: Vista) {
    setEnlaceInvalido(false);
    setVista(destino);
  }

  return (
    <div ref={caja} style={{ display: "contents" }}>
      <IniciarSesion
        hidden={vista !== "login"}
        alEntrar={() => router.replace("/admin/inventario")}
        alOlvidar={() => ir("recuperar")}
      />
      <PedirEnlace hidden={vista !== "recuperar"} enlaceInvalido={enlaceInvalido} alVolver={() => ir("login")} />
      <NuevaContrasena hidden={vista !== "nueva"} token={token} alGuardar={() => ir("login")} />
    </div>
  );
}

// Paso 0: iniciar sesión.
function IniciarSesion({
  hidden,
  alEntrar,
  alOlvidar,
}: {
  hidden: boolean;
  alEntrar: () => void;
  alOlvidar: () => void;
}) {
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
    alEntrar();
  }

  return (
    <form className="auth__form" onSubmit={entrar} hidden={hidden} noValidate>
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
      <button type="button" className="btn-link" onClick={alOlvidar}>
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}

// Paso 1: pedir el enlace de recuperación.
function PedirEnlace({
  hidden,
  enlaceInvalido,
  alVolver,
}: {
  hidden: boolean;
  enlaceInvalido: boolean;
  alVolver: () => void;
}) {
  const [estado, setEstado] = useState<"" | "invalido" | "enviando" | "enviado" | "fallo">("");

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const input = evento.currentTarget.correo2 as HTMLInputElement;
    if (!input.checkValidity()) {
      setEstado("invalido");
      input.focus();
      return;
    }
    setEstado("enviando");
    // Misma respuesta exista o no el correo: no revela cuál es el del admin.
    const { error } = await authClient.requestPasswordReset({
      email: input.value.trim().toLowerCase(),
      redirectTo: "/admin/login",
    });
    setEstado(error ? "fallo" : "enviado");
  }

  return (
    <form className="auth__form" onSubmit={enviar} hidden={hidden} noValidate>
      <span className="lbl">Recuperar contraseña · paso 1 de 2</span>
      <h1 className="auth__title">Recupera tu acceso</h1>
      <p style={{ fontSize: 15, color: "var(--ink-2)" }}>
        Te enviaremos un enlace al correo registrado para crear una nueva contraseña. El enlace vence en 1 hora.
      </p>
      {enlaceInvalido && (
        <p className="alert" role="alert">
          El enlace venció o ya se usó. Pide uno nuevo.
        </p>
      )}
      <div className="field">
        <label htmlFor="correo2">Correo</label>
        <input
          id="correo2"
          name="correo2"
          type="email"
          className="input"
          autoComplete="email"
          required
          aria-invalid={estado === "invalido"}
        />
      </div>
      <p className="alert" role="status" hidden={estado !== "enviado" && estado !== "fallo"}>
        {estado === "fallo"
          ? "No pudimos enviar el correo. Intenta de nuevo en unos minutos."
          : "Si el correo está registrado, recibirás el enlace en unos minutos."}
      </p>
      <button type="submit" className="btn btn--primary" disabled={estado === "enviando"}>
        Enviar enlace
      </button>
      <button type="button" className="btn-link" onClick={alVolver}>
        Volver a iniciar sesión
      </button>
    </form>
  );
}

// Paso 2: nueva contraseña (se llega desde el enlace del correo).
function NuevaContrasena({
  hidden,
  token,
  alGuardar,
}: {
  hidden: boolean;
  token: string;
  alGuardar: () => void;
}) {
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const a = (form.n1 as HTMLInputElement).value;
    const b = (form.n2 as HTMLInputElement).value;
    const msg =
      a.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : a !== b ? "Las contraseñas no coinciden." : "";
    setError(msg);
    if (msg) return;

    setEnviando(true);
    const { error } = await authClient.resetPassword({ newPassword: a, token });
    setEnviando(false);
    if (error) {
      setError("El enlace venció o ya se usó. Vuelve a pedir uno desde «¿Olvidaste tu contraseña?».");
      return;
    }
    form.reset();
    alGuardar();
  }

  return (
    <form className="auth__form" onSubmit={guardar} hidden={hidden} noValidate>
      <span className="lbl">Recuperar contraseña · paso 2 de 2</span>
      <h1 className="auth__title">Nueva contraseña</h1>
      <div className="field">
        <label htmlFor="n1">Nueva contraseña</label>
        <input id="n1" name="n1" type="password" className="input" autoComplete="new-password" minLength={8} required />
        <span className="hint">Mínimo 8 caracteres.</span>
      </div>
      <div className="field">
        <label htmlFor="n2">Confirmar contraseña</label>
        <input id="n2" name="n2" type="password" className="input" autoComplete="new-password" required />
      </div>
      <p className="alert" role="alert" hidden={!error}>
        {error}
      </p>
      <button type="submit" className="btn btn--primary" disabled={enviando}>
        Guardar y volver a iniciar sesión
      </button>
    </form>
  );
}
