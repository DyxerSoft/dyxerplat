'use client';

import React from 'react';
import { Facebook, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';

const assetSrc = (asset) => (typeof asset === 'string' ? asset : asset.src);
const linkedInUrl = 'https://www.linkedin.com/company/dyxersoft';
const facebookUrl = 'https://www.facebook.com/share/1KwhxcATJr/';

const products = [
  { label: 'DyxerCRM', contactValue: 'DyxerCRM' },
  { label: 'DyxerSales', href: 'https://dyxersales.dyxersoft.com' },
  { label: 'DyxerFinance', contactValue: 'DyxerFinance' },
  { label: 'DyxerFlow', href: 'https://dyxerflow.onrender.com' },
  { label: 'DyxerAnalytics', contactValue: 'DyxerAnalytics' },
  { label: 'PIGIM', href: 'https://pigim.dyxersoft.com' },
  { label: 'Bespa', href: 'https://bespa.onrender.com' },
];

function Footer() {
  const contactProduct = (product) => {
    try {
      sessionStorage.setItem('dyxersoft_contact_servicio', product.contactValue);
    } catch {
      // Ignore storage errors.
    }
    document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.8fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={assetSrc(logoDx)} alt="" className="h-12 w-12 rounded-lg border border-secondary/20 object-cover shadow-[0_0_22px_rgba(14,165,233,0.14)]" />
              <div>
                <h3 className="text-2xl font-bold">Dyxersoft</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Software empresarial, datos e IA</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Plataformas empresariales, soluciones de datos y automatización para operar con más control y tomar mejores decisiones.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Productos</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {products.map((product) => product.href ? (
                <a key={product.label} href={product.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {product.label}
                </a>
              ) : (
                <button key={product.label} type="button" onClick={() => contactProduct(product)} className="w-fit text-left text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {product.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Empresa</h4>
            <div className="space-y-2">
              <a href="#servicios" className="block text-sm text-muted-foreground transition-colors hover:text-primary">Servicios</a>
              <a href="/blog" className="block text-sm text-muted-foreground transition-colors hover:text-primary">Blog</a>
              <a href="#nosotros" className="block text-sm text-muted-foreground transition-colors hover:text-primary">Nosotros</a>
              <a href="#contacto" className="block text-sm text-muted-foreground transition-colors hover:text-primary">Contacto</a>
              <a href="/login" className="block text-sm text-muted-foreground transition-colors hover:text-primary">Login</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <a href="mailto:dyxersoft@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Mail className="h-4 w-4" /><span>dyxersoft@gmail.com</span>
              </a>
              <a href="https://wa.me/59162069477" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Phone className="h-4 w-4" /><span>+591 62069477</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /><span>Santa Cruz de la Sierra, Bolivia</span>
              </div>
            </div>
            <div className="flex gap-4">
              <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dyxersoft. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
