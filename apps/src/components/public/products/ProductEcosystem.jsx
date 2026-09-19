'use client';

import React from 'react';
import { productPlatforms } from '@/lib/products/catalog';
import ProductCards from '@/components/public/products/ProductCards.jsx';

function ProductEcosystem() {
  return (
    <section id="productos" className="scroll-mt-24 bg-card py-24">
      <div className="section-container">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Product ecosystem</p>
          <h2 className="text-3xl font-black leading-tight text-foreground md:text-5xl">Un ecosistema para operar, integrar y entender tu negocio.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Productos especializados para ventas, relaciones, finanzas, integración de datos, analítica y operaciones empresariales.</p>
        </div>
        <div className="space-y-16">
          {productPlatforms.map((platform) => (
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
