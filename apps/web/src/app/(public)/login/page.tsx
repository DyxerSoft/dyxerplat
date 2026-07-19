import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, ShieldCheck, Workflow } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";
import logoDx from "@/assets/dyxersoft-logo-dx-v2.png";

const platformBenefits = [
  { icon: Workflow, text: "Operación centralizada y fácil de seguir" },
  { icon: ShieldCheck, text: "Acceso protegido por roles y permisos" },
  { icon: BarChart3, text: "Indicadores disponibles para decidir mejor" },
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="dark-cta relative hidden overflow-hidden border-r border-secondary/15 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="pointer-events-none absolute inset-0 cyber-grid opacity-20" aria-hidden="true" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <Image src={logoDx} alt="Isotipo de Dyxersoft" className="h-11 w-11 rounded-xl object-cover" priority />
              <span>
                <span className="block text-xl font-black tracking-tight">Dyxersoft</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">Software empresarial</span>
              </span>
            </Link>
          </div>

          <div className="relative max-w-xl py-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Plataforma interna
            </div>
            <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.035em] xl:text-5xl">
              Tu operación, organizada en un solo lugar
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100/75">
              Ingresa para gestionar incidencias, clientes, publicaciones, usuarios y permisos desde Dyxerplat.
            </p>

            <div className="mt-10 space-y-5">
              {platformBenefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4 text-sm font-semibold text-blue-50/85">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="relative flex items-center gap-2 text-xs font-semibold text-blue-100/60">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" /> Acceso exclusivo para usuarios autorizados
          </p>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 blue-hero opacity-70" aria-hidden="true" />
          <div className="relative w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:justify-start">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> Volver al inicio
              </Link>
              <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Dyxersoft">
                <Image src={logoDx} alt="" className="h-9 w-9 rounded-lg object-cover" />
                <span className="font-black text-foreground">Dyxersoft</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Bienvenido de nuevo</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Inicia sesión</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Utiliza las credenciales asignadas a tu cuenta para continuar.
              </p>
              <LoginForm />
            </div>

            <p className="mx-auto mt-6 text-center text-xs leading-5 text-muted-foreground">
              Si no tienes acceso o no recuerdas tus credenciales, comunícate con el administrador de tu organización.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
