'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  FileClock,
  MessageSquareText,
  Route,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/public/ContactForm.jsx';
import pigimDashboard from '@/assets/screenshots/pigim-dashboard-desktop.jpg';

const problems = [
  {
    icon: MessageSquareText,
    title: 'Solicitudes dispersas',
    description: 'WhatsApp, correo y llamadas dificultan saber qué está pendiente y quién debe responder.',
  },
  {
    icon: Clock3,
    title: 'Prioridades poco claras',
    description: 'Los casos críticos se mezclan con tareas menores y el equipo reacciona demasiado tarde.',
  },
  {
    icon: FileClock,
    title: 'Seguimiento manual',
    description: 'Consolidar avances, tiempos y responsables consume horas que deberían dedicarse a resolver.',
  },
];

const productSteps = [
  {
    number: '01',
    icon: MessageSquareText,
    title: 'Centraliza',
    description: 'Registra cada solicitud en un solo lugar con contexto, evidencia y datos del cliente.',
  },
  {
    number: '02',
    icon: Route,
    title: 'Gestiona',
    description: 'Asigna responsables, define prioridades y controla el avance con flujos claros.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Mejora',
    description: 'Convierte la operación diaria en indicadores útiles para tomar mejores decisiones.',
  },
];

const benefits = [
  { icon: BellRing, title: 'SLA bajo control', description: 'Alertas oportunas y visibilidad sobre casos próximos a vencer.' },
  { icon: ShieldCheck, title: 'Trazabilidad completa', description: 'Historial de responsables, cambios, comentarios y evidencias.' },
  { icon: Workflow, title: 'Flujos ordenados', description: 'Estados y reglas adaptables a la forma real de trabajar de tu equipo.' },
  { icon: BarChart3, title: 'Decisiones con datos', description: 'Indicadores operativos claros sin consolidar reportes manualmente.' },
];

const services = [
  {
    icon: Code2,
    title: 'Software a medida',
    description: 'Aplicaciones empresariales alineadas con tus procesos, usuarios e integraciones.',
  },
  {
    icon: Database,
    title: 'Datos y automatización',
    description: 'Dashboards, integraciones y flujos que eliminan tareas repetitivas y datos aislados.',
  },
  {
    icon: Sparkles,
    title: 'IA aplicada',
    description: 'Clasificación, asistencia y análisis inteligente integrados donde generan valor real.',
  },
];

const capabilities = ['Gestión de incidencias', 'Control de SLA', 'Roles y permisos', 'Reportes operativos'];

function DyxersoftLanding() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5, ease: 'easeOut' },
  };

  return (
    <main className="overflow-hidden">
      <section id="inicio" className="blue-hero relative scroll-mt-20 border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 cyber-grid opacity-50" aria-hidden="true" />
        <div className="section-container relative grid min-h-[calc(100vh-4.5rem)] items-center gap-14 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Plataforma de gestión de incidencias
            </div>
            <h1 className="text-4xl font-black leading-[1.04] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
              Convierte cada incidencia en una operación clara y controlada
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
              PIGIM centraliza solicitudes, responsables, SLA y métricas para que tu equipo resuelva más rápido y la gerencia tenga visibilidad real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-6 shadow-lg shadow-primary/15">
                <a href="#contacto">
                  Solicitar una demo <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 border-border bg-card/75 px-6">
                <a href="#producto">Ver cómo funciona</a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
              {capabilities.map((capability) => (
                <span key={capability} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-secondary" /> {capability}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -inset-8 -z-10 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[0_28px_80px_rgba(15,23,42,0.18)] md:p-3">
              <div className="mb-2 flex items-center gap-2 px-2 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-muted-foreground">Recorrido interactivo PIGIM</span>
              </div>
              <Image
                src={pigimDashboard}
                alt="Pantalla de acceso al recorrido interactivo de PIGIM"
                className="h-auto w-full rounded-xl border border-border object-cover"
                priority
                sizes="(min-width: 1024px) 54vw, 100vw"
              />
            </div>
            <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-muted-foreground">Operación visible</span>
                <span className="block text-sm font-black text-foreground">De principio a fin</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="soluciones" className="scroll-mt-20 bg-background py-20 lg:py-24">
        <div className="section-container">
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">El problema operativo</p>
            <h2 className="section-title">Cuando la información está dispersa, hasta lo urgente pierde visibilidad</h2>
            <p className="section-copy mx-auto">
              PIGIM reemplaza el seguimiento improvisado por un flujo compartido, medible y fácil de entender.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {problems.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.07 }}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="producto" className="blue-section scroll-mt-20 border-y border-border/70 py-20 lg:py-24">
        <div className="section-container">
          <motion.div {...reveal} className="max-w-3xl">
            <p className="section-eyebrow">Cómo funciona PIGIM</p>
            <h2 className="section-title">Un recorrido simple para una operación compleja</h2>
            <p className="section-copy">
              Desde el registro hasta el reporte, cada etapa mantiene el contexto y la responsabilidad visibles.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {productSteps.map(({ number, icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="relative rounded-2xl border border-border bg-card p-7 shadow-sm"
              >
                <span className="absolute right-6 top-5 text-4xl font-black text-muted">{number}</span>
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-foreground">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-24">
        <div className="section-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <motion.div {...reveal}>
            <p className="section-eyebrow">Resultados operativos</p>
            <h2 className="section-title">Más control sin agregar más trabajo al equipo</h2>
            <p className="section-copy">
              La plataforma organiza la información que ya genera tu operación y la convierte en seguimiento útil.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <a href="#contacto">Evaluar PIGIM para mi empresa <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.06 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <Icon className="h-6 w-6 text-secondary" />
                <h3 className="mt-5 text-lg font-black text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="scroll-mt-20 bg-card py-20 lg:py-24">
        <div className="section-container">
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">Dyxersoft</p>
            <h2 className="section-title">Tecnología que se adapta a la operación, no al revés</h2>
            <p className="section-copy mx-auto">
              Además de PIGIM, diseñamos soluciones para conectar procesos, sistemas y datos de empresas que necesitan crecer con orden.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.07 }}
                className="group rounded-2xl border border-border bg-background p-7 transition-colors hover:border-secondary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-black text-foreground">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div {...reveal} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-muted-foreground">
            {['Aplicaciones web', 'APIs e integraciones', 'Dashboards BI', 'Sistemas internos'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-secondary" />{item}</span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="dark-cta border-y border-secondary/15 py-16 text-primary-foreground lg:py-20">
        <motion.div {...reveal} className="section-container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Una conversación, sin compromiso</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
              Veamos si PIGIM encaja con la operación de tu empresa
            </h2>
            <p className="mt-4 text-lg text-blue-100/80">Cuéntanos cómo gestionas hoy tus incidencias y te mostraremos un flujo aplicable a tu equipo.</p>
          </div>
          <Button size="lg" asChild className="h-12 shrink-0 bg-white px-6 text-primary hover:bg-blue-50">
            <a href="#contacto">Agendar una demostración <ArrowRight className="ml-2 h-5 w-5" /></a>
          </Button>
        </motion.div>
      </section>

      <section id="contacto" className="scroll-mt-20 bg-background py-20 lg:py-24">
        <div className="section-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.div {...reveal}>
            <p className="section-eyebrow">Contacto</p>
            <h2 className="section-title">Hablemos de tu operación</h2>
            <p className="section-copy">
              Cuéntanos dónde se pierde visibilidad hoy. Te responderemos con preguntas concretas y una propuesta de siguiente paso.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Revisión inicial de tu proceso actual',
                'Demostración enfocada en tu caso de uso',
                'Recomendación clara, incluso si PIGIM no aplica',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm font-semibold text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal} className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default DyxersoftLanding;
