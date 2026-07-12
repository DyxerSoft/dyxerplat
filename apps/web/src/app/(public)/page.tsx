import Link from "next/link";
import { ArrowRight, Building2, Newspaper, ShieldCheck } from "lucide-react";

const highlights = [
  {
    icon: Building2,
    title: "CRM operativo",
    description: "Companias, contactos, usuarios, roles y permisos en una plataforma ordenada."
  },
  {
    icon: Newspaper,
    title: "Blog publico",
    description: "Publicaciones administrables desde la plataforma para mostrar novedades y casos."
  },
  {
    icon: ShieldCheck,
    title: "Control interno",
    description: "Acciones protegidas por permisos, eliminacion logica y auditoria basica por registro."
  }
];

export default function PublicHomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative min-h-screen bg-background">
        <div className="absolute inset-x-0 top-0 h-1 bg-secondary/70" />
        <div className="section-container grid min-h-screen grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
              DyxerSoft Platform
            </div>
            <div className="space-y-6">
              <h1 className="max-w-5xl text-4xl font-black leading-tight md:text-6xl">
                Dyxerplat: landing, blog y CRM interno para operar con control.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Base inicial de la plataforma. Desde aqui se migrara la landing actual, se publicara contenido y se gestionaran companias, contactos, usuarios y permisos.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Ingresar a la plataforma
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                Ver blog
              </Link>
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Panel inicial</p>
                <h2 className="mt-1 text-2xl font-black">Dyxerplat CRM</h2>
              </div>
              <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                Local
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {highlights.map(({ icon: Icon, title, description }) => (
                <article key={title} className="enterprise-card rounded-lg p-5">
                  <Icon className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
