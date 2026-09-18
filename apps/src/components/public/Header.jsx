'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRight, Menu, Moon, Sun } from 'lucide-react';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';

const assetSrc = (asset) => (typeof asset === 'string' ? asset : asset.src);
const PIGIM_APP_URL = 'https://pigim-frontend.onrender.com';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'PIGIM', href: '#pigim' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Proyectos', href: '#proyectos' },
    { name: 'Beneficios', href: '#beneficios' },
    { name: 'Blog', href: '/blog' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
    { name: 'Login', href: '/login' },
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border bg-background/90 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl'
          : 'border-b border-border/60 bg-background/70 backdrop-blur-md'
      }`}
    >
      <div className="section-container">
        <div className="flex h-16 items-center justify-between md:h-20">
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              handleNavClick('#');
            }}
            className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Volver al inicio de Dyxersoft"
          >
            <img
              src={assetSrc(logoDx)}
              alt=""
              className="h-11 w-11 rounded-lg border border-secondary/20 object-cover shadow-[0_0_22px_rgba(14,165,233,0.16)]"
            />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-wide text-foreground">Dyxersoft</span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">PIGIM</span>
            </span>
          </a>

          <nav className="hidden items-center space-x-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick(link.href);
                }}
                className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-border bg-card text-foreground hover:bg-muted"
              aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              title={isDark ? 'Tema claro' : 'Tema oscuro'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer">
                Solicitar demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-border bg-background sm:w-[400px]">
              <nav className="mt-8 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="py-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleTheme}
                  className="mt-2 justify-start border-border bg-card text-foreground hover:bg-muted"
                >
                  {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {isDark ? 'Tema claro' : 'Tema oscuro'}
                </Button>
                <Button
                  asChild
                  className="mt-4 bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
                >
                  <a href={PIGIM_APP_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
                    Solicitar demo
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
