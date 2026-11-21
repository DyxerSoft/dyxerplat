'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Check, Layers, Target, Users, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getRelatedProducts } from '@/lib/products/catalog';
import DyxerCrmLogo from '@/app/(public)/logo/dyxercrm.png';
import DyxerSalesLogo from '@/app/(public)/logo/dyxersales.png';
import DyxerFinanceLogo from '@/app/(public)/logo/dyxerfinance.png';
import DyxerFlowLogo from '@/app/(public)/logo/dyxerflow.png';
import DyxerAnalyticsLogo from '@/app/(public)/logo/exec-ff51abba-e191-4fa9-8697-748406b03c85.png';
import PigimLogo from '@/app/(public)/logo/pigim.png';
import BespaLogo from '@/app/(public)/logo/bespa.png';

const productVisuals = {
  dyxercrm: { logo: DyxerCrmLogo, primary: '#3730a3', secondary: '#818cf8', hero: '#171447' },
  dyxersales: { logo: DyxerSalesLogo, primary: '#713f12', secondary: '#d6a779', hero: '#3e261c' },
  dyxerfinance: { logo: DyxerFinanceLogo, primary: '#166534', secondary: '#a3c98c', hero: '#102e26' },
  dyxerflow: { logo: DyxerFlowLogo, primary: '#0e7490', secondary: '#67e8f9', hero: '#083747' },
  dyxeranalytics: { logo: DyxerAnalyticsLogo, primary: '#6d28d9', secondary: '#c4b5fd', hero: '#2e155c' },
  pigim: { logo: PigimLogo, primary: '#14532d', secondary: '#86efac', hero: '#123223' },
  bespa: { logo: BespaLogo, primary: '#9a6a0a', secondary: '#facc15', hero: '#493510' }
};

/** @param {{ product: any, configuredPlans?: Array<{ id?: string, name: string, price: number, currency: string, benefits: string[], additionalInfo: string | null, cardColor?: string, pdfMediaId?: string | null }> }} props */
export default function ProductPage({ product, configuredPlans = [] }) {
  const visual = productVisuals[product.slug] || { ...productVisuals.dyxercrm, logo: null };
  const managedLogo = product.logoUrl ? { src: product.logoUrl } : null;
  const relatedProducts = getRelatedProducts(product);
  const requestInformation = () => {
    try { sessionStorage.setItem('dyxersoft_contact_servicio', product.slug); } catch {}
    window.location.href = '/#contacto';
  };

  return (
    <main className="overflow-hidden bg-white text-slate-950" style={{ '--primary': '244 57% 40%', backgroundColor: '#fff' }}>
      <section className="relative overflow-hidden text-white" style={{ background: `radial-gradient(ellipse at 80% 15%, ${visual.primary} 0%, transparent 38%), linear-gradient(125deg, ${visual.hero}, ${visual.primary})` }}>
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: visual.secondary }} />
        <div className="section-container relative z-10 pb-16 pt-6 md:pb-24 md:pt-8">
          <header className="flex flex-wrap items-center justify-between gap-5">
            <Link href="/products" className="flex items-center gap-3 text-xl font-black text-white">
              {(managedLogo || visual.logo) && <img src={(managedLogo || visual.logo).src} alt="" className="h-9 w-auto max-w-[130px] object-contain" />}{product.name}
            </Link>
            <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-white/85">
              <a href="#inicio" className="hover:text-white">Inicio</a><a href="#capacidades" className="hover:text-white">Características</a>
              {configuredPlans.length > 0 && <a href="#planes" className="hover:text-white">Planes</a>}
              <a href="#contacto" className="hover:text-white">Contacto</a>
            </nav>
            <Button variant="outline" onClick={requestInformation} className="border-white/70 bg-transparent font-bold text-white hover:bg-white hover:text-slate-900">Solicitar demo</Button>
          </header>

          <div id="inicio" className="grid items-center gap-12 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">{product.platform}</span>
                <span className="text-xs font-semibold text-white/70">{product.status}</span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: visual.secondary }}>{product.tagline}</p>
              <span className="mt-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">{product.status}</span>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.06] md:text-6xl">{product.name}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{product.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={requestInformation} className="bg-white font-bold text-slate-950 hover:bg-white/90">Solicitar una demo <ArrowRight className="ml-2 h-5 w-5" /></Button>
                {configuredPlans.length > 0 && <Button size="lg" variant="outline" asChild className="border-white/70 bg-transparent text-white hover:bg-white hover:text-slate-900"><a href="#planes">Ver planes</a></Button>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.08 }} className="rounded-2xl border border-white/60 bg-white p-3 text-slate-900 shadow-2xl md:p-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-3 pb-3">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400"/><span className="h-2.5 w-2.5 rounded-full bg-amber-400"/><span className="h-2.5 w-2.5 rounded-full bg-emerald-400"/><strong className="ml-2 text-sm">{product.name}</strong></div>
                <span className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Vista general⌄</span>
              </div>
              <div className="grid gap-3 p-3 sm:grid-cols-[0.72fr_1.28fr] md:p-4">
                <div className="rounded-xl p-4 text-white" style={{ backgroundColor: visual.hero }}>
                  <p className="text-xs font-bold text-white/60">{product.name}</p>
                  <div className="mt-5 space-y-2">{(product.workflow.length ? product.workflow : product.capabilities).slice(0, 5).map((item, index) => <div key={item} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs" style={{ backgroundColor: index === 0 ? `${visual.primary}` : 'rgba(255,255,255,.08)' }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: visual.secondary }}/>{item}</div>)}</div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">{product.capabilities.slice(0, 2).map((item, index) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{item}</p><p className="mt-2 text-xl font-black" style={{ color: visual.primary }}>{index === 0 ? 'Activo' : 'En marcha'}</p></div>)}</div>
                  <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><strong className="text-sm">{product.platformDescription}</strong><Activity className="h-4 w-4" style={{ color: visual.primary }}/></div><div className="mt-5 flex h-24 items-end gap-2">{[42, 65, 50, 82, 58, 94, 72, 100, 78].map((height, index) => <span key={index} className="flex-1 rounded-t-md" style={{ height: `${height}%`, backgroundColor: visual.primary, opacity: 0.35 + index * 0.07 }}/>)}</div></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-5">
        <div className="section-container grid gap-3 md:grid-cols-3">
          {[product.useCases[0] || product.platformDescription, product.capabilities[0] || product.shortDescription, product.workflow[0] || 'Acompañamiento de nuestro equipo'].map((item, index) => <div key={`${index}-${item}`} className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: visual.primary }}>0{index + 1}</span><span className="text-sm font-semibold text-slate-800">{item}</span></div>)}
        </div>
      </section>

      <section id="capacidades" className="scroll-mt-20 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center"><p className="w-full text-center text-sm font-bold uppercase tracking-[0.18em]" style={{ color: visual.primary }}>Qué puedes hacer</p><h2 className="mt-3 text-center text-3xl font-black md:text-5xl">Todo tu proceso, bajo control.</h2><p className="mt-4 text-center text-lg leading-7 text-slate-600">{product.shortDescription}</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{product.capabilities.slice(0, 8).map((capability, index) => {
            const Icon = [Users, Activity, Workflow, Layers][index % 4];
            return <article key={capability} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><Icon className="mb-5 h-7 w-7" style={{ color: visual.primary }}/><h3 className="font-bold">{capability}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{product.useCases[index % Math.max(product.useCases.length, 1)] || product.shortDescription}</p></article>;
          })}</div>
        </div>
      </section>

      {product.workflow.length > 0 && <section className="py-14" style={{ backgroundColor: `${visual.primary}0D` }}>
        <div className="section-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: visual.primary }}>Cómo funciona</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Avanza paso a paso.</h2></div><div className="grid gap-3 sm:grid-cols-2">{product.workflow.slice(0, 6).map((step, index) => <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="font-mono font-black" style={{ color: visual.primary }}>0{index + 1}</span><span className="text-sm font-semibold">{step}</span></div>)}</div></div>
      </section>}

      {configuredPlans.length > 0 && <section id="planes" className="scroll-mt-20 py-16 md:py-20">
        <div className="section-container"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: visual.primary }}>Precios referenciales</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Planes para cada etapa.</h2></div>
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">{configuredPlans.map((plan) => {
            const color = plan.cardColor || visual.primary;
            return <article key={plan.id || plan.name} className="relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: `${color}55` }}>
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }}/><p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color }}>{plan.name}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{plan.currency} {Number(plan.price).toLocaleString('es-BO')}<span className="text-sm font-medium text-slate-500"> / mes</span></p>
              <ul className="my-6 flex-1 space-y-3">{plan.benefits.map((benefit) => <li key={benefit} className="flex gap-2 text-sm leading-5 text-slate-700"><Check className="h-4 w-4 shrink-0" style={{ color }}/>{benefit}</li>)}</ul>
              {plan.additionalInfo && <p className="mb-5 text-sm leading-6 text-slate-600">{plan.additionalInfo}</p>}
              {plan.pdfMediaId && <a href={`/api/v1/media/${plan.pdfMediaId}?download=1`} className="mb-3 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50" style={{ borderColor: color, color }} download>Descargar PDF</a>}
              <Button onClick={requestInformation} className="w-full font-bold text-white hover:opacity-90" style={{ backgroundColor: color }}>Elegir plan</Button>
            </article>;
          })}</div>
        </div>
      </section>}

      {relatedProducts.length > 0 && <section className="border-t border-slate-200 bg-slate-50 py-14"><div className="section-container"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: visual.primary }}>Sigue explorando</p><h2 className="mt-2 text-3xl font-black">Productos relacionados</h2></div><Link href="/products" className="text-sm font-bold" style={{ color: visual.primary }}>Ver catálogo completo →</Link></div><div className="grid gap-4 md:grid-cols-2">{relatedProducts.map((related) => <Link key={related.slug} href={`/products/${related.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><h3 className="text-xl font-black">{related.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{related.shortDescription}</p></Link>)}</div></div></section>}

      <section id="contacto" className="py-14 text-white" style={{ background: `linear-gradient(120deg, ${visual.hero}, ${visual.primary})` }}><div className="section-container flex flex-wrap items-center justify-between gap-6"><div className="flex items-center gap-4"><Target className="h-9 w-9" style={{ color: visual.secondary }}/><h2 className="text-3xl font-black md:text-4xl">Conoce {product.name} en acción.</h2></div><Button size="lg" onClick={requestInformation} className="bg-white font-bold text-slate-950 hover:bg-white/90">Solicitar demo <ArrowRight className="ml-2 h-5 w-5"/></Button></div></section>
    </main>
  );
}
