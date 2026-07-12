"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";
import { loginWithEmail, saveSession } from "./auth-service";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@dyxerplat.local");
  const [password, setPassword] = useState("Cambiar123!");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await loginWithEmail(email, password);
      saveSession(session);
      toast.success("Inicio de sesion correcto.");
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "No se pudo iniciar sesion. Intenta nuevamente.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Correo electronico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="admin@dyxerplat.local"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="Tu contrasena"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
        Ingresar
      </button>
    </form>
  );
}
