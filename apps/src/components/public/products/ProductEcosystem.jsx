'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { productPlatforms } from '@/lib/products/catalog';
import ProductCards from '@/components/public/products/ProductCards.jsx';

function ProductEcosystem() {
  const [managedProducts, setManagedProducts] = useState([]);
  useEffect(() => {
    fetch('/api/v1/products/public').then((response) => response.json()).then((payload) => {
      if (payload?.success && Array.isArray(payload.data)) setManagedProducts(payload.data);
    }).catch(() => {});
  }, []);
  const groups = productPlatforms.map((platform) => ({
    ...platform,
    products: platform.products.map((product) => {
      const managed = managedProducts.find((item) => item.slug === product.slug);
      return managed ? { ...product, name: managed.name, status: managed.status, shortDescription: managed.shortDescription, description: managed.description, logoUrl: managed.logoUrl } : product;
    })
  }));
  const additional = managedProducts.filter((item) => !productPlatforms.some((platform) => platform.products.some((product) => product.slug === item.slug))).map((item) => ({
    slug: item.slug, name: item.name, platform: 'Business Platform', status: 'Disponible', tagline: item.shortDescription, logoUrl: item.logoUrl,
    shortDescription: item.shortDescription, description: item.description
  }));
  if (additional.length) groups.push({ name: 'Nuevas soluciones', description: 'Productos configurados desde la plataforma.', products: additional });
  return (
    <section id="productos" className="scroll-mt-24 bg-card py-24">
      <div className="section-container">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Product ecosystem</p>
          <h2 className="text-3xl font-black leading-tight text-foreground md:text-5xl">Un ecosistema para operar, integrar y entender tu negocio.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Productos especializados para ventas, relaciones, finanzas, integración de datos, analítica y operaciones empresariales.</p>
          <Link href="/products" className="mt-7 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">
            Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-16">
          {groups.map((platform) => (
            <div key={platform.name}>
              <div className="mb-6 flex flex-col gap-2 border-l-2 border-secondary pl-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-foreground md:text-3xl">{platform.name}</h3>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{platform.description}</p>
                </div>
                <span className="text-sm font-semibold text-secondary">{platform.products.length} productos</span>
              </div>
              <ProductCards products={platform.products} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductEcosystem;
