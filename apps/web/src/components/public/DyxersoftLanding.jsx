'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BarChart,
  Brain,
  Briefcase,
  Building,
  Clock,
  Code,
  Database,
  Gauge,
  Headphones,
  Layout,
  Link,
  Lock,
  MessageSquare,
  Radio,
  Rocket,
  Shield,
  ShoppingCart,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ContactForm from '@/components/public/ContactForm.jsx';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';
import pigimTourScreenshot from '@/assets/screenshots/pigim-dashboard-desktop.jpg';
import aiDataImage from '@/assets/showcase/ai-data.jpg';
import analyticsBiImage from '@/assets/showcase/analytics-bi.jpg';
import automationWorkflowsImage from '@/assets/showcase/automation-workflows.jpg';
import cloudInfrastructureImage from '@/assets/showcase/cloud-infrastructure.jpg';
import softwareDevelopmentImage from '@/assets/showcase/software-development.jpg';

const assetSrc = (asset) => (typeof asset === 'string' ? asset : asset.src);
const PIGIM_APP_URL = 'https://pigim-frontend.onrender.com';
const SITE_URL = 'https://dyxersoft.github.io/';
const SITE_TITLE = 'Dyxersoft | Software a medida, SaaS, datos e IA en Bolivia';
const SITE_DESCRIPTION =
  'Dyxersoft desarrolla software a medida, plataformas SaaS, dashboards, automatizacion e inteligencia artificial para empresas que necesitan operar con control y datos confiables.';
const OG_IMAGE_URL = `${SITE_URL}og-dyxersoft.jpg`;

function HomePage() {
  const [projectCarouselApi, setProjectCarouselApi] = useState(null);
  const [isProjectCarouselPaused, setIsProjectCarouselPaused] = useState(false);

  useEffect(() => {
    if (!projectCarouselApi || isProjectCarouselPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      projectCarouselApi.scrollNext();
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [projectCarouselApi, isProjectCarouselPaused]);

  const scrollTo = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const painPoints = [
    {
      icon: MessageSquare,
      title: 'Canales dispersos',
      description: 'WhatsApp, correo, llamadas y planillas compiten por atencion sin una fuente unica de verdad.',
    },
    {
      icon: Clock,
      title: 'Respuesta lenta',
      description: 'Los casos criticos se mezclan con solicitudes menores y el equipo pierde tiempo clasificando.',
    },
    {
      icon: AlertCircle,
      title: 'Trazabilidad debil',
      description: 'No queda claro quien atendio cada caso, que cambio, cuando vencia el SLA o como se resolvio.',
    },
    {
      icon: BarChart,
      title: 'Reportes manuales',
      description: 'La gerencia decide con datos incompletos porque consolidar metricas consume horas operativas.',
    },
  ];

  const modules = [
    { icon: MessageSquare, title: 'Mesa multicanal', desc: 'Entrada web, correo, API y WhatsApp.' },
    { icon: Target, title: 'Priorizacion', desc: 'Urgencia, impacto, SLA y reglas por cliente.' },
    { icon: Workflow, title: 'Flujos de atencion', desc: 'Estados, responsables, escalamiento y evidencias.' },
    { icon: Gauge, title: 'SLA en vivo', desc: 'Alertas antes del vencimiento y semaforos claros.' },
    { icon: BarChart, title: 'Dashboard ejecutivo', desc: 'Metricas operativas listas para decidir.' },
    { icon: Shield, title: 'Historial auditable', desc: 'Bitacora completa de acciones y cambios.' },
    { icon: Brain, title: 'IA preparada', desc: 'Clasificacion, sugerencias y analisis predictivo.' },
    { icon: Link, title: 'Integraciones', desc: 'Conecta CRM, ERP, BI y sistemas internos.' },
  ];

  const services = [
    { icon: Code, title: 'Desarrollo SaaS', description: 'Plataformas web escalables, multi-tenant y listas para crecer.' },
    { icon: Layout, title: 'Dashboards ejecutivos', description: 'Experiencias de datos claras para gerencia y operacion.' },
    { icon: Database, title: 'Ingenieria de datos', description: 'Pipelines, ETL, modelos analiticos y gobierno de datos.' },
    { icon: Workflow, title: 'Automatizacion', description: 'Procesos repetitivos convertidos en flujos medibles.' },
    { icon: Brain, title: 'Inteligencia artificial', description: 'Modelos aplicados a clasificacion, prediccion y soporte.' },
    { icon: Lock, title: 'Modernizacion segura', description: 'Evolucion de sistemas legacy sin perder operacion.' },
  ];

  const processSteps = [
    {
      icon: Target,
      title: 'Diagnostico operativo',
      description: 'Entendemos procesos, usuarios, datos, dolores actuales y objetivos de negocio antes de escribir codigo.',
    },
    {
      icon: Layout,
      title: 'Diseno de solucion',
      description: 'Definimos arquitectura, experiencia de usuario, flujos, permisos, integraciones y metricas clave.',
    },
    {
      icon: Code,
      title: 'Desarrollo iterativo',
      description: 'Construimos por entregas cortas para validar rapido, reducir riesgo y ajustar con evidencia.',
    },
    {
      icon: Shield,
      title: 'Despliegue y soporte',
      description: 'Preparamos puesta en produccion, monitoreo, mejoras continuas y soporte para sostener la operacion.',
    },
  ];

  const techCapabilities = [
    'Aplicaciones web',
    'SaaS multiusuario',
    'APIs e integraciones',
    'Dashboards BI',
    'Automatizacion',
    'Inteligencia artificial',
    'Bases de datos',
    'Cloud y despliegue',
    'Seguridad y roles',
    'Sistemas internos',
    'Reportes ejecutivos',
    'Modernizacion legacy',
  ];

  const projects = [
    {
      icon: Gauge,
      image: pigimTourScreenshot,
      type: 'Producto SaaS',
      title: 'PIGIM - Tour de producto',
      description: 'Acceso al demo con flujos separados para administrador y cliente.',
      impact: 'Demo navegable para mostrar el alcance del producto',
      stack: ['SaaS', 'Demo publica', 'Roles', 'Producto'],
    },
    {
      icon: Code,
      image: softwareDevelopmentImage,
      type: 'Software a medida',
      title: 'Aplicaciones empresariales',
      description: 'Soluciones web para digitalizar operaciones, conectar areas y ordenar procesos internos.',
      impact: 'Herramientas alineadas al flujo real del negocio',
      stack: ['Web apps', 'UX', 'APIs', 'Procesos'],
    },
    {
      icon: BarChart,
      image: analyticsBiImage,
      type: 'Datos y BI',
      title: 'Dashboards ejecutivos',
      description: 'Paneles de control para monitorear indicadores, tendencias y decisiones operativas.',
      impact: 'Informacion clara para gerencia y equipos',
      stack: ['BI', 'KPIs', 'Reportes', 'Metricas'],
    },
    {
      icon: Workflow,
      image: automationWorkflowsImage,
      type: 'Automatizacion',
      title: 'Flujos de trabajo inteligentes',
      description: 'Automatizacion de tareas, aprobaciones, notificaciones y seguimiento de casos.',
      impact: 'Menos trabajo manual y mas control del proceso',
      stack: ['Workflows', 'Alertas', 'Roles', 'Auditoria'],
    },
    {
      icon: Brain,
      image: aiDataImage,
      type: 'IA aplicada',
      title: 'Analisis y asistencia inteligente',
      description: 'Modelos y asistentes para clasificar, priorizar, resumir y detectar patrones operativos.',
      impact: 'Equipos con mejor criterio y respuesta mas rapida',
      stack: ['IA', 'Datos', 'Clasificacion', 'Soporte'],
    },
    {
      icon: Lock,
      image: cloudInfrastructureImage,
      type: 'Cloud y seguridad',
      title: 'Infraestructura para escalar',
      description: 'Arquitecturas cloud, despliegues, permisos e integraciones para sistemas empresariales.',
      impact: 'Bases tecnicas estables para crecer',
      stack: ['Cloud', 'Seguridad', 'APIs', 'Integraciones'],
    },
  ];

  const benefits = [
    { value: '-42%', label: 'tiempo de respuesta', detail: 'al centralizar y priorizar incidencias' },
    { value: '94%', label: 'cumplimiento SLA', detail: 'con alertas y escalamiento oportuno' },
    { value: '1 vista', label: 'operacion completa', detail: 'tickets, agentes, estados y metricas' },
    { value: '24/7', label: 'trazabilidad', detail: 'historial auditable de cada caso' },
  ];

  const industries = [
    { icon: Radio, title: 'Telecomunicaciones' },
    { icon: Building, title: 'Servicios financieros' },
    { icon: Users, title: 'Cooperativas' },
    { icon: ShoppingCart, title: 'Retail' },
    { icon: Briefcase, title: 'Empresas de servicios' },
    { icon: Headphones, title: 'Soporte y operaciones' },
  ];

  const tickets = [
    { code: 'INC-2481', title: 'Caida de enlace principal', level: 'Critico', time: '00:18', status: 'Escalado' },
    { code: 'INC-2479', title: 'Solicitud de acceso BI', level: 'Medio', time: '01:42', status: 'Asignado' },
    { code: 'INC-2474', title: 'Error en facturacion', level: 'Alto', time: '02:11', status: 'En curso' },
  ];

  const flow = ['Registro', 'Clasificacion', 'Asignacion', 'Resolucion', 'Metricas'];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dyxersoft',
    url: SITE_URL,
    logo: `${SITE_URL}dyxersoft-logo.png`,
    email: 'dyxersoft@gmail.com',
    telephone: '+59162069477',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santa Cruz de la Sierra',
      addressCountry: 'BO',
    },
    sameAs: [
      'https://www.linkedin.com/company/dyxersoft',
      'https://www.facebook.com/share/1KwhxcATJr/',
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dyxersoft',
    url: SITE_URL,
    inLanguage: 'es-BO',
    description: SITE_DESCRIPTION,
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Dyxersoft',
    url: SITE_URL,
    image: OG_IMAGE_URL,
    areaServed: 'Bolivia',
    serviceType: [
      'Desarrollo de software a medida',
      'Desarrollo SaaS',
      'Gestion de incidencias',
      'Dashboards ejecutivos',
      'Automatizacion de procesos',
      'Inteligencia artificial aplicada',
    ],
    description: SITE_DESCRIPTION,
  };

  return (
    <main className="overflow-hidden">
        <section className="blue-hero relative min-h-[calc(100vh-5rem)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-secondary/70" />
          <div className="section-container relative z-10 grid min-h-[calc(100vh-5rem)] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1fr_0.92fr] lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                Gestion de incidencias empresariales
              </div>

              <div className="space-y-6">
                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] text-foreground md:text-6xl lg:text-7xl">
                  Control operativo para empresas que atienden incidencias criticas
                </h1>
                <p className="text-lg leading-8 text-muted-foreground md:text-xl">
                  Dyxersoft desarrolla PIGIM, una plataforma para centralizar solicitudes, priorizar casos,
                  controlar SLA y convertir la operacion diaria en informacion confiable para la toma de decisiones.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
                >
                  <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer">
                    Solicitar demo de PIGIM
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-border bg-card text-foreground hover:bg-muted"
                >
                  <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer">
                    Ver plataforma
                  </a>
                </Button>
              </div>

              <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {benefits.map((item) => (
                  <div key={item.label} className="enterprise-card top-accent rounded-lg p-4">
                    <p className="text-2xl font-black text-secondary">{item.value}</p>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="surface-panel rounded-xl p-4 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={assetSrc(logoDx)} alt="" className="h-12 w-12 rounded-lg border border-border object-cover shadow-sm" />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Panel operativo</p>
                      <h2 className="text-2xl font-black text-foreground">PIGIM Live Ops</h2>
                    </div>
                  </div>
                  <div className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                    En linea
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ['47', 'abiertas'],
                    ['12', 'criticas'],
                    ['94.2%', 'SLA'],
                    ['2.4h', 'promedio'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg border border-border bg-background/45 p-4">
                      <p className="text-2xl font-black text-foreground">{value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-border bg-background/45 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Incidencias en prioridad</p>
                    <span className="text-xs text-muted-foreground">actualizado hace 12s</span>
                  </div>
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.code} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-border bg-card/75 p-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-secondary">{ticket.code}</span>
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                              {ticket.level}
                            </span>
                          </div>
                          <p className="mt-1 font-semibold text-foreground">{ticket.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-primary">{ticket.time}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{ticket.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2">
                  {flow.map((step, index) => (
                    <div key={step} className="relative rounded-lg border border-border bg-background/45 p-3 text-center">
                      <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="text-[11px] font-semibold text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="section-container">
            <div className="mb-12 max-w-4xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">El problema real</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                No falta esfuerzo. Falta una operacion conectada, medible y visible.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {painPoints.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="enterprise-card rounded-xl p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pigim" className="blue-section scroll-mt-24 py-24">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">PIGIM</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Una plataforma para gobernar incidencias desde el registro hasta la decision.
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  PIGIM unifica tickets, responsables, prioridades, SLA, evidencia y reportes. La operacion deja de
                  depender de memoria, chats sueltos o hojas manuales.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer">
                    Ver PIGIM
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {modules.map(({ icon: Icon, title, desc }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.25 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className="enterprise-card rounded-xl p-5"
                  >
                    <Icon className="mb-4 h-6 w-6 text-primary" />
                    <h3 className="font-bold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="scroll-mt-24 bg-background py-24">
          <div className="section-container">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Impacto</p>
              <h2 className="mx-auto max-w-4xl text-3xl font-black leading-tight md:text-5xl">
                Menos ruido operativo. Mas velocidad, control y aprendizaje.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Card className="enterprise-card h-full">
                    <CardContent className="p-6">
                      <p className="text-4xl font-black text-primary">{benefit.value}</p>
                      <h3 className="mt-3 text-xl font-bold text-foreground">{benefit.label}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.detail}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="servicios" className="scroll-mt-24 bg-card py-24">
          <div className="section-container">
            <div className="mb-12 max-w-4xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Dyxersoft</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Construimos software con la misma prioridad: que la operacion sea mas inteligente.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="enterprise-card rounded-xl p-6"
                >
                  <Icon className="mb-5 h-7 w-7 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-24">
          <div className="section-container">
            <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Proceso</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Un metodo claro para convertir ideas en software que se usa.
                </h2>
              </div>
              <p className="text-lg leading-8 text-muted-foreground">
                Trabajamos con foco en impacto: entender la operacion, disenar una solucion viable,
                construir por etapas y acompanar el despliegue para que el producto genere valor real.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="enterprise-card top-accent rounded-xl p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-sm font-black text-secondary">0{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="blue-section py-24">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Tecnologia</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Capacidades para construir productos digitales completos.
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  Podemos iniciar con un MVP, modernizar un sistema existente o desarrollar una plataforma completa
                  con datos, automatizacion, permisos, integraciones e inteligencia artificial.
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {techCapabilities.map((capability, index) => (
                  <motion.div
                    key={capability}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.32, delay: index * 0.025 }}
                    className="rounded-lg border border-border bg-card/80 px-4 py-4 text-sm font-bold text-foreground shadow-sm"
                  >
                    {capability}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="proyectos" className="blue-section scroll-mt-24 py-24">
          <div className="section-container">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Proyectos</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  Productos y experiencias digitales desarrolladas con enfoque operativo.
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Una vitrina de soluciones SaaS, portales, interfaces moviles y experiencias web pensadas para
                  resolver procesos de negocio con claridad, trazabilidad y buen diseno.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => scrollTo('#contacto')}
                className="w-fit border-border bg-card text-foreground hover:bg-muted"
              >
                Cotizar un proyecto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <Carousel
              setApi={setProjectCarouselApi}
              opts={{ align: 'center', loop: true }}
              className="mx-auto max-w-[calc(100vw-2rem)]"
              onMouseEnter={() => setIsProjectCarouselPaused(true)}
              onMouseLeave={() => setIsProjectCarouselPaused(false)}
            >
              <CarouselContent className="-ml-5">
                {projects.map(({ icon: Icon, image, type, title, description, impact, stack }, index) => (
                  <CarouselItem key={title} className="pl-5 md:basis-[82%] xl:basis-[68%]">
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.25 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="enterprise-card glow-border grid h-full overflow-hidden rounded-xl lg:grid-cols-[1.35fr_0.65fr]"
                    >
                      <div className="relative overflow-hidden border-b border-border bg-background p-3 lg:border-b-0 lg:border-r lg:p-5">
                        <div className="rounded-xl border border-border bg-card p-2 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                          <div className="mb-2 flex items-center gap-1.5 px-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
                          </div>
                          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-background">
                            <img
                              src={assetSrc(image)}
                              alt={`Vista del proyecto ${title}`}
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>

                      <div className="flex min-h-[420px] flex-col p-6 lg:p-8">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="border-secondary/25 bg-secondary/10 text-secondary">
                            {type}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-black text-foreground">{title}</h3>
                        <p className="mt-4 leading-7 text-muted-foreground">{description}</p>

                        <div className="mt-6 rounded-lg border border-border bg-background/50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Impacto</p>
                          <p className="mt-2 font-semibold text-foreground">{impact}</p>
                        </div>

                        <div className="mt-auto flex flex-wrap gap-2 pt-6">
                          {stack.map((item) => (
                            <span key={item} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 border-border bg-card text-foreground hover:bg-muted md:-left-6" />
              <CarouselNext className="-right-3 border-border bg-card text-foreground hover:bg-muted md:-right-6" />
            </Carousel>

            <div className="mt-10 overflow-hidden">
              <div className="project-marquee flex w-max gap-4">
                {[...projects, ...projects].map(({ image, title, type }, index) => (
                  <div key={`${title}-preview-${index}`} className="group relative h-40 w-64 overflow-hidden rounded-xl border border-border bg-card md:h-48 md:w-80">
                    <img
                      src={assetSrc(image)}
                      alt={`Vista previa de ${title}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute inset-x-3 bottom-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{type}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-foreground">{title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Industrias</p>
                <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                  Para equipos que no pueden perder control cuando sube el volumen.
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {industries.map(({ icon: Icon, title }) => (
                  <div key={title} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="dark-cta border-y border-secondary/15 py-20 text-foreground">
          <div className="section-container">
            <div className="mx-auto max-w-4xl text-center">
              <Rocket className="mx-auto mb-5 h-10 w-10 text-secondary" />
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Si tus incidencias viven en chats y planillas, estas perdiendo informacion operativa.
              </h2>
              <p className="mx-auto mt-5 text-lg leading-8 text-muted-foreground">
                Centraliza, automatiza y convierte cada caso atendido en datos utiles para mejorar la operacion.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer">
                    Solicitar demo ahora
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo('#nosotros')}
                  className="border-secondary/35 bg-transparent text-foreground hover:bg-secondary/10 hover:text-secondary"
                >
                  Conocer Dyxersoft
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="nosotros" className="scroll-mt-24 bg-card py-24">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Sobre nosotros</p>
                <h2 className="text-3xl font-black leading-tight md:text-5xl">Tecnologia hecha desde Bolivia para operaciones que quieren escalar.</h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  Somos un equipo multidisciplinario con base en Santa Cruz de la Sierra. Disenamos productos SaaS,
                  soluciones a medida, analitica e IA con enfoque practico: resolver problemas reales y sostenerlos en produccion.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Software', 'Datos', 'IA', 'Automatizacion', 'Soporte continuo'].map((tag) => (
                    <span key={tag} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['50+', 'proyectos entregados'],
                  ['30+', 'clientes activos'],
                  ['5+', 'anos de experiencia'],
                  ['100%', 'compromiso con calidad'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                    <p className="text-4xl font-black text-primary">{value}</p>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="scroll-mt-24 bg-muted/55 py-24">
          <div className="section-container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Contacto</p>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">Hablemos de tu operacion</h2>
              <p className="mx-auto mt-5 text-lg leading-8 text-muted-foreground">
                Cuentanos que canales usas, cuantos casos atiendes y donde se pierde visibilidad. Te mostramos como PIGIM puede ordenar ese flujo.
              </p>
            </div>
            <div className="mx-auto max-w-3xl">
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
  );
}

export default HomePage;

