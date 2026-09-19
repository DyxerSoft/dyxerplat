'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart, Briefcase, Database, Gauge, ShoppingCart, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const icons = {
  dyxercrm: Briefcase,
  dyxersales: ShoppingCart,
  dyxerfinance: Database,
  dyxerflow: Workflow,
  dyxeranalytics: BarChart,
  pigim: Gauge,
  bespa: ShoppingCart
};

export function statusClass(status) {
  if (status === 'Disponible') return 'border-primary/25 bg-primary/10 text-primary';
  if (status === 'Beta') return 'border-secondary/25 bg-secondary/10 text-secondary';
  return 'border-border bg-muted text-muted-foreground';
}

export default function ProductCards({ products, compact = false }) {
  return (
    <div className={compact ? 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'}>
      {products.map((product, index) => {
        const Icon = icons[product.slug] ?? Briefcase;
        return (
          <motion.article
            key={product.slug}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="enterprise-card top-accent flex min-h-[310px] flex-col rounded-xl p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <Badge variant="outline" className={statusClass(product.status)}>{product.status}</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{product.platform}</p>
            <h3 className="mt-2 text-2xl font-black text-foreground">{product.name}</h3>
            <p className="mt-2 text-sm font-semibold text-foreground">{product.tagline}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>
            <div className="mt-auto pt-6">
              <Button variant="outline" asChild className="border-border bg-card text-foreground hover:bg-muted">
                <Link href={`/products/${product.slug}`}>
                  Conocer producto
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
