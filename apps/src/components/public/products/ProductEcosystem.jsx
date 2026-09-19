'use client';

import React from 'react';
import { ArrowRight, BarChart, Briefcase, Database, Gauge, ShoppingCart, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const platformProducts = [
  {
    name: 'Business Platform',
    description: 'Relaciones comerciales, ventas y gestión financiera para una operación conectada.',
    products: [
      {
        name: 'DyxerCRM',
        tagline: 'Customer, Sales & Relationship Intelligence',
        description: 'Centraliza organizaciones, contactos, oportunidades y relaciones comerciales para gestionar ventas e inteligencia de negocio.',
        status: 'En desarrollo',
        icon: Briefcase,
        contactValue: 'DyxerCRM',
      },
      {
        name: 'DyxerSales',
        tagline: 'Digital Sales & Commerce',
        description: 'Plataforma para gestionar ventas digitales y procesos comerciales desde una experiencia moderna y escalable.',
        status: 'Disponible',
        icon: ShoppingCart,
        url: 'https://dyxersales.dyxersoft.com',
      },
      {
        name: 'DyxerFinance',
        tagline: 'Financial Management Platform',
        description: 'Gestión financiera, contabilidad, cuentas por cobrar y pagar, inventario y trazabilidad empresarial.',
        status: 'En desarrollo',
        icon: Database,
        contactValue: 'DyxerFinance',
      },
    ],
  },
  {
    name: 'Data Platform',
    description: 'Integración, calidad y análisis para convertir datos empresariales en decisiones.',
    products: [
      {
        name: 'DyxerFlow',
        tagline: 'Data Integration & Automation',
        description: 'Conecta archivos, APIs y bases de datos, valida su calidad y automatiza pipelines para preparar información confiable.',
        status: 'Beta',
        icon: Workflow,
        url: 'https://dyxerflow.onrender.com',
      },
      {
        name: 'DyxerAnalytics',
        tagline: 'Business Intelligence & Analytics',
        description: 'Convierte datasets empresariales en KPIs, visualizaciones, dashboards e insights para apoyar decisiones.',
        status: 'Próximamente',
        icon: BarChart,
        contactValue: 'DyxerAnalytics',
      },
    ],
  },
  {
    name: 'Operations',
    description: 'Herramientas para ordenar incidencias, inventario y procesos operativos críticos.',
    products: [
      {
        name: 'PIGIM',
        tagline: 'Incident & Operations Management',
        description: 'Centraliza incidencias, responsables, prioridades, SLA, evidencias y métricas operativas.',
        status: 'Disponible',
        icon: Gauge,
        url: 'https://pigim.dyxersoft.com',
      },
      {
        name: 'Bespa',
        tagline: 'Inventory & Business Operations',
        description: 'Gestión de inventario, productos, movimientos y operaciones comerciales desde una plataforma centralizada.',
        status: 'Beta',
        icon: ShoppingCart,
        url: 'https://bespa.onrender.com',
      },
    ],
  },
];

function statusClass(status) {
  if (status === 'Disponible') return 'border-primary/25 bg-primary/10 text-primary';
  if (status === 'Beta') return 'border-secondary/25 bg-secondary/10 text-secondary';
  return 'border-border bg-muted text-muted-foreground';
}

function ProductEcosystem() {
  const requestInformation = (product) => {
    try {
      sessionStorage.setItem('dyxersoft_contact_servicio', product.contactValue);
    } catch {
      // Ignore storage errors and preserve the navigation path.
    }

    document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="productos" className="scroll-mt-24 bg-card py-24">
      <div className="section-container">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Product ecosystem</p>
          <h2 className="text-3xl font-black leading-tight text-foreground md:text-5xl">
            Un ecosistema para operar, integrar y entender tu negocio.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Productos especializados para ventas, relaciones, finanzas, integración de datos, analítica y operaciones empresariales.
          </p>
        </div>

        <div className="space-y-16">
          {platformProducts.map((platform) => (
            <div key={platform.name}>
              <div className="mb-6 flex flex-col gap-2 border-l-2 border-secondary pl-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-foreground md:text-3xl">{platform.name}</h3>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{platform.description}</p>
                </div>
                <span className="text-sm font-semibold text-secondary">{platform.products.length} productos</span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {platform.products.map((product, index) => {
                  const Icon = product.icon;
                  const isExternal = Boolean(product.url);

                  return (
                    <motion.article
                      key={product.name}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.18 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="enterprise-card top-accent flex min-h-[320px] flex-col rounded-xl p-6"
                    >
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <Badge variant="outline" className={statusClass(product.status)}>
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{platform.name}</p>
                      <h4 className="mt-2 text-2xl font-black text-foreground">{product.name}</h4>
                      <p className="mt-2 text-sm font-semibold text-foreground">{product.tagline}</p>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>

                      <div className="mt-auto pt-6">
                        {isExternal ? (
                          <Button variant="outline" asChild className="border-border bg-card text-foreground hover:bg-muted">
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                              Ver plataforma
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="border-border bg-card text-foreground hover:bg-muted"
                            onClick={() => requestInformation(product)}
                          >
                            Conocer más
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { platformProducts };
export default ProductEcosystem;
