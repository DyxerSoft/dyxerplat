'use client';

import React from 'react';
import { Facebook, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';

const assetSrc = (asset) => (typeof asset === 'string' ? asset : asset.src);
const linkedInUrl = 'https://www.linkedin.com/company/dyxersoft';
const facebookUrl = 'https://www.facebook.com/share/1KwhxcATJr/';

function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={assetSrc(logoDx)}
                alt=""
                className="h-12 w-12 rounded-lg border border-secondary/20 object-cover shadow-[0_0_22px_rgba(14,165,233,0.14)]"
              />
              <div>
                <h3 className="text-2xl font-bold">Dyxersoft</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">PIGIM</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Soluciones SaaS, datos e IA para empresas que necesitan operar con control, velocidad y trazabilidad.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <a
                href="mailto:dyxersoft@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                <span>dyxersoft@gmail.com</span>
              </a>
              <a
                href="https://wa.me/59162069477"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                <span>+591 62069477</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Santa Cruz de la Sierra, Bolivia</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Siguenos</h4>
            <div className="flex gap-4">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Producto</h4>
            <div className="space-y-2">
              <a href="#pigim" className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                PIGIM
              </a>
              <a href="#servicios" className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                Servicios
              </a>
              <a href="#contacto" className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                Solicitar demo
              </a>
              <a href="/blog" className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                Blog
              </a>
              <a href="/login" className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                Login
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dyxersoft. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
