"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";
import { loginWithEmail, saveSession } from "./auth-service";

const inputClass = "h-12 w-full rounded-xl border border-input bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-secondary focus:ring-4 focus:ring-secondary/10";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await loginWithEmail(email.trim(), password);
      saveSession(session);
      toast.success("Inicio de sesión correcto.");
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof ApiClientError
        ? error.message
        : "No se pudo iniciar sesión. Intenta nuevamente.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-bold text-foreground">Correo electrónico</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            autoFocus
            className={inputClass}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="nombre@empresa.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-bold text-foreground">Contraseña</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-12`}
            style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
            placeholder="Ingresa tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
        {isSubmitting ? "Ingresando..." : "Ingresar a Dyxerplat"}
      </button>
    </form>
  );
}
