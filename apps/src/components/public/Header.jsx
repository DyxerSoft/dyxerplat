'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRight, ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import logoDx from '@/assets/dyxersoft-logo-dx-v2.png';
import { productPlatforms } from '@/lib/products/catalog';

const assetSrc = (asset) => (typeof asset === 'string' ? asset : asset.src);

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/#servicios' },
    { name: 'Soluciones', href: '/#capacidades' },
    { name: 'Blog', href: '/blog' },
    { name: 'Nosotros', href: '/#nosotros' },
    { name: 'Contacto', href: '/#contacto' },
    { name: 'Login', href: '/login' }
  ];

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'border-b border-border bg-background/90 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl' : 'border-b border-border/60 bg-background/70 backdrop-blur-md'}`}>
      <div className="section-container">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Volver al inicio de Dyxersoft">
            <img src={assetSrc(logoDx)} alt="" className="h-11 w-11 rounded-lg border border-secondary/20 object-cover shadow-[0_0_22px_rgba(14,165,233,0.16)]" />
            <span className="flex flex-col leading-none"><span className="text-lg font-bold tracking-wide text-foreground">Dyxersoft</span><span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">Software, datos e IA</span></span>
          </Link>

          <nav className="hidden items-center gap-3 xl:flex" aria-label="Navegación principal">
            <div className="relative" onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)}>
              <button type="button" onClick={() => setIsProductsOpen((value) => !value)} aria-expanded={isProductsOpen} className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                Productos <ChevronDown className="h-4 w-4" />
              </button>
              {isProductsOpen && <div className="absolute left-0 top-full mt-3 w-[620px] rounded-xl border border-border bg-card p-5 shadow-2xl">
                <Link href="/products" onClick={() => setIsProductsOpen(false)} className="mb-5 block rounded-lg bg-muted p-3 text-sm font-bold text-foreground hover:text-primary">Todos los productos <span className="ml-2 text-secondary">→</span></Link>
                <div className="grid grid-cols-3 gap-5">
                  {productPlatforms.map((platform) => <div key={platform.name}><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">{platform.name}</p>{platform.products.map((product) => <Link key={product.slug} href={`/products/${product.slug}`} onClick={() => setIsProductsOpen(false)} className="block py-1 text-sm text-muted-foreground transition hover:text-primary">{product.name}</Link>)}</div>)}
                </div>
              </div>}
            </div>
            {navLinks.map((link) => <Link key={link.name} href={link.href} className="rounded-md px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">{link.name}</Link>)}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <Button type="button" variant="outline" size="icon" onClick={toggleTheme} className="border-border bg-card text-foreground hover:bg-muted" aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
            <Button asChild className="bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"><Link href="/#contacto">Hablemos <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden"><Button variant="ghost" size="icon" aria-label="Abrir menú"><Menu className="h-6 w-6" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto border-border bg-background sm:w-[400px]">
              <nav className="mt-8 flex flex-col space-y-4" aria-label="Navegación móvil">
                <Link href="/products" onClick={() => setIsOpen(false)} className="py-2 text-lg font-bold text-foreground transition-colors hover:text-primary">Productos</Link>
                <div className="ml-3 space-y-2 border-l border-border pl-4">{productPlatforms.flatMap((platform) => platform.products).map((product) => <Link key={product.slug} href={`/products/${product.slug}`} onClick={() => setIsOpen(false)} className="block py-1 text-sm text-muted-foreground hover:text-primary">{product.name}</Link>)}</div>
                {navLinks.map((link) => <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="py-2 text-lg font-medium text-foreground transition-colors hover:text-primary">{link.name}</Link>)}
                <Button type="button" variant="outline" onClick={toggleTheme} className="mt-2 justify-start border-border bg-card text-foreground hover:bg-muted">{isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}{isDark ? 'Tema claro' : 'Tema oscuro'}</Button>
                <Button asChild className="mt-4 bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"><Link href="/#contacto" onClick={() => setIsOpen(false)}>Hablar con Dyxersoft</Link></Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
