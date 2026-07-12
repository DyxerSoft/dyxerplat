import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Acceso</p>
        <h1 className="mt-3 text-3xl font-black">Ingresar a Dyxerplat</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Usa tus credenciales para acceder a la plataforma interna.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
