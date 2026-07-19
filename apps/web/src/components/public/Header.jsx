'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ArrowRight, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';

const navLinks = [
  { name: 'Producto', href: '#producto' },
  { name: 'Soluciones', href: '#soluciones' },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contacto', href: '#contacto' },
];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (event, href) => {
    setIsOpen(false);
    if (href.startsWith('/')) return;
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigation = (mobile = false) => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          onClick={(event) => handleNavClick(event, link.href)}
          className={mobile
            ? 'rounded-lg px-3 py-3 text-lg font-semibold text-foreground hover:bg-muted'
            : 'rounded-md px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary'}
        >
          {link.name}
        </a>
      ))}
    </>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
      isScrolled ? 'border-border bg-background/95 shadow-sm backdrop-blur-xl' : 'border-transparent bg-background/80 backdrop-blur-md'
    }`}>
      <div className="section-container flex h-16 items-center justify-between md:h-[4.5rem]">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Ir al inicio de Dyxersoft">
          <Image src={logoDx} alt="Isotipo de Dyxersoft" className="h-10 w-10 rounded-lg object-cover" priority />
          <span className="leading-none">
            <span className="block text-lg font-black tracking-tight text-foreground">Dyxersoft</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Software empresarial</span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Navegacion principal">
          {navigation()}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" asChild>
            <a href="/login">Iniciar sesión</a>
          </Button>
          <Button asChild>
            <a href="#contacto">
              Solicitar demo <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[310px] border-border bg-background">
            <nav className="mt-8 flex flex-col gap-1" aria-label="Navegacion movil">
              {navigation(true)}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="mt-3 justify-start"
              >
                {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {isDark ? 'Tema claro' : 'Tema oscuro'}
              </Button>
              <Button variant="outline" asChild className="mt-2">
                <a href="/login" onClick={() => setIsOpen(false)}>Iniciar sesión</a>
              </Button>
              <Button asChild className="mt-4">
                <a href="#contacto" onClick={() => setIsOpen(false)}>Solicitar demo</a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default Header;
