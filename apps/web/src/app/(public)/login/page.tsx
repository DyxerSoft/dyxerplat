import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-8">
        <Link
          href="/"
          className="mb-5 inline-flex w-fit items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Acceso</p>
        <h1 className="mt-3 text-3xl font-black">Ingresar a Dyxerplat</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Usa tus credenciales para acceder a la plataforma interna.
        </p>
        <LoginForm />
        </section>
      </div>
    </main>
  );
}
