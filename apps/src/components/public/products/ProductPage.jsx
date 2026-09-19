'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Layers, Target, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRelatedProducts } from '@/lib/products/catalog';
import { statusClass } from '@/components/public/products/ProductCards.jsx';
import DyxerFlowWorkflow from '@/components/public/products/DyxerFlowWorkflow.jsx';

function ProductPage({ product }) {
  const relatedProducts = getRelatedProducts(product);
  const requestInformation = (label = product.name) => {
    try {
      sessionStorage.setItem('dyxersoft_contact_servicio', product.name);
    } catch {
      // Navigation remains available when storage is unavailable.
    }
    window.location.href = '/#contacto';
  };

  const renderPrimaryAction = () => product.appUrl ? (
    <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
      <a href={product.appUrl} target="_blank" rel="noopener noreferrer">Ver plataforma <ArrowRight className="ml-2 h-5 w-5" /></a>
    </Button>
  ) : (
    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => requestInformation()}>
      Solicitar información <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );

  return (
    <main className="overflow-hidden">
      <section className="blue-hero relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-x-0 top-0 h-1 bg-secondary/70" />
        <div className="section-container relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/products" className="text-sm font-semibold text-secondary transition hover:text-primary">← Todos los productos</Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-secondary/25 bg-secondary/10 text-secondary">{product.platform}</Badge>
              <Badge variant="outline" className={statusClass(product.status)}>{product.status}</Badge>
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-secondary">{product.tagline}</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.02] text-foreground md:text-6xl">{product.name}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">{product.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {renderPrimaryAction()}
              <Button size="lg" variant="outline" onClick={() => requestInformation()} className="border-border bg-card text-foreground hover:bg-muted">
                {product.slug === 'pigim' ? 'Solicitar demo' : 'Hablar con Dyxersoft'}
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="surface-panel glow-border rounded-xl p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Cómo aporta</p>
            <div className="mt-5 space-y-3">
              {product.workflow.slice(0, 5).map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-border bg-background/55 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">{index + 1}</span>
                  <span className="text-sm font-semibold text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="section-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">El contexto</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">Menos fricción para avanzar con control.</h2>
          </div>
          <p className="text-lg leading-8 text-muted-foreground">{product.problem}</p>
        </div>
      </section>

      <section className="blue-section py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Qué hace</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">Capacidades enfocadas en la operación real.</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.capabilities.map((capability) => (
              <div key={capability} className="enterprise-card top-accent flex items-center gap-3 rounded-xl p-5">
                <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="font-semibold text-foreground">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {product.slug === 'dyxerflow' ? <DyxerFlowWorkflow /> : (
        <section className="bg-card py-24">
          <div className="section-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Cómo funciona</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">Un flujo claro, desde el inicio hasta el resultado.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.workflow.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-background/55 p-4">
                  <span className="font-mono text-sm font-black text-secondary">0{index + 1}</span>
                  <span className="font-semibold text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-24">
        <div className="section-container">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Casos de uso</p>
            <h2 className="mt-3 text-3xl font-black text-foreground md:text-5xl">Dónde puede aportar valor.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {product.useCases.map((useCase) => (
              <article key={useCase} className="enterprise-card rounded-xl p-6">
                <Target className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground">{useCase}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blue-section py-24">
        <div className="section-container">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Productos relacionados</p>
              <h2 className="mt-3 text-3xl font-black text-foreground">Continúa explorando el ecosistema.</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-secondary hover:text-primary">Ver catálogo completo →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {relatedProducts.map((related) => (
              <Link key={related.slug} href={`/products/${related.slug}`} className="enterprise-card group rounded-xl p-6 transition hover:-translate-y-0.5">
                <Layers className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{related.platform}</p>
                <h3 className="mt-2 text-xl font-black text-foreground">{related.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{related.shortDescription}</p>
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">Conocer producto <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-cta border-y border-secondary/15 py-20 text-foreground">
        <div className="section-container mx-auto max-w-4xl text-center">
          <Workflow className="mx-auto mb-5 h-10 w-10 text-secondary" aria-hidden="true" />
          <h2 className="text-3xl font-black leading-tight md:text-5xl">Conversemos sobre {product.name} y tu operación.</h2>
          <p className="mx-auto mt-5 text-lg leading-8 text-muted-foreground">Identifiquemos el proceso, los datos o la operación que quieres mejorar.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {renderPrimaryAction()}
            <Button size="lg" variant="outline" onClick={() => requestInformation()} className="border-secondary/35 bg-transparent text-foreground hover:bg-secondary/10 hover:text-secondary">Hablar con Dyxersoft</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductPage;
