import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--secondary)/0.14),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.35)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-border/80 bg-card/60 px-3 py-2 text-sm font-semibold text-muted-foreground backdrop-blur transition hover:border-secondary/40 hover:bg-card hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <section className="login-panel w-full max-w-md rounded-2xl border border-border/80 bg-card/85 p-7 shadow-[0_24px_80px_-32px_hsl(var(--primary)/0.55)] backdrop-blur-md sm:p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-black text-primary-foreground shadow-lg shadow-primary/25">
                Dx
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">Dyxerplat</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Bienvenido de nuevo
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                Accede a la plataforma interna para gestionar companias, contenido y usuarios.
              </p>
            </div>

            <LoginForm />
          </section>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Plataforma CRM de <span className="font-semibold text-foreground/80">Dyxersoft</span>
          </p>
        </div>
      </div>
    </main>
  );
}
