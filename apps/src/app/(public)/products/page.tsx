import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { productPlatforms } from "@/lib/products/catalog";
import ProductCards from "@/components/public/products/ProductCards.jsx";

export const metadata: Metadata = {
  title: "Productos | Software empresarial y datos",
  description: "Explora el ecosistema de productos de Dyxersoft para relaciones, ventas, finanzas, datos y operaciones.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Productos | Dyxersoft",
    description: "Productos especializados para ventas, relaciones, finanzas, datos y operaciones empresariales.",
    url: "/products"
  }
};

export default function ProductsPage() {
  return (
    <main className="overflow-hidden">
      <section className="blue-hero relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-x-0 top-0 h-1 bg-secondary/70" />
        <div className="section-container relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Product catalog</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] text-foreground md:text-6xl">Software empresarial construido como un ecosistema.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">Productos especializados para ventas, relaciones, finanzas, datos y operaciones, diseñados para funcionar de manera independiente o como parte de un ecosistema tecnológico conectado.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#catalogo" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Explorar productos <ArrowRight className="h-5 w-5" /></a>
              <Link href="/#contacto" className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">Hablar con Dyxersoft</Link>
            </div>
          </div>
          <div className="surface-panel glow-border rounded-xl p-6">
            <Layers className="h-8 w-8 text-secondary" aria-hidden="true" />
            <div className="mt-6 space-y-3">
              {productPlatforms.map((platform) => <div key={platform.name} className="rounded-lg border border-border bg-background/55 p-4"><p className="font-bold text-foreground">{platform.name}</p><p className="mt-1 text-sm text-muted-foreground">{platform.products.map((product) => product.name).join(' · ')}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-24 bg-background py-24">
        <div className="section-container space-y-20">
          {productPlatforms.map((platform) => (
            <section key={platform.name}>
              <div className="mb-8 max-w-3xl border-l-2 border-secondary pl-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary">{platform.name}</p>
                <h2 className="mt-2 text-3xl font-black text-foreground">{platform.description}</h2>
              </div>
              <ProductCards products={platform.products} />
            </section>
          ))}
        </div>
      </section>

      <section className="bg-card py-24">
        <div className="section-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Cómo se complementan</p><h2 className="mt-3 text-3xl font-black leading-tight text-foreground md:text-5xl">Elige un punto de partida y evoluciona a tu ritmo.</h2></div>
          <p className="text-lg leading-8 text-muted-foreground">Cada producto puede responder a una necesidad concreta. El catálogo facilita descubrir rutas complementarias sin prometer integraciones que todavía no existen.</p>
        </div>
      </section>
    </main>
  );
}
