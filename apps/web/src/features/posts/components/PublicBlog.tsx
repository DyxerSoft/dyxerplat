"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Newspaper, Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { listPublishedPosts } from "../services/post-service";
import type { BlogTaxonomy, Post } from "../types/post.types";

export function PublicBlog() {
  const [latest, setLatest] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<BlogTaxonomy[]>([]);
  const [tags, setTags] = useState<BlogTaxonomy[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { listPublishedPosts({ page: 1, pageSize: 10 }).then((result) => setLatest(result.items)).catch(() => setLatest([])); }, []);
  useEffect(() => { const timeout = window.setTimeout(() => { setPage(1); setDebouncedQ(q); }, 300); return () => window.clearTimeout(timeout); }, [q]);
  useEffect(() => {
    setIsLoading(true);
    listPublishedPosts({ q: debouncedQ, category, tag, page, pageSize: 9 }).then((result) => { setPosts(result.items); setCategories(result.filters.categories); setTags(result.filters.tags); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages); }).catch(() => setPosts([])).finally(() => setIsLoading(false));
  }, [debouncedQ, category, tag, page]);
  const hasFilters = Boolean(debouncedQ || category || tag);
  const clearFilters = () => { setQ(""); setDebouncedQ(""); setCategory(""); setTag(""); setPage(1); };

  return <main className="min-h-screen bg-background">
    <header className="border-b border-border bg-card"><div className="section-container flex min-h-20 items-center justify-between"><Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-secondary"><ArrowLeft className="mr-2 h-4 w-4" />Volver al inicio</Link><Link href="/" className="text-lg font-black">DYXER<span className="text-secondary">SOFT</span></Link></div></header>
    <section className="border-b border-secondary/15 bg-slate-950 text-white"><div className="section-container py-12 text-center lg:py-14"><span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300"><Sparkles className="h-4 w-4" />Conocimiento DyxerSoft</span><h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Ideas para transformar tu operación</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100/70">Software, datos, automatización e inteligencia artificial explicados de forma práctica.</p></div></section>

    {latest.length ? <LatestCarousel posts={latest} /> : null}

    <section className="section-container py-14 lg:py-16"><div className="mb-7"><p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">Explora el contenido</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-black">Todos nuestros artículos</h2><p className="mt-1 text-sm text-muted-foreground">{total} {total === 1 ? "publicación disponible" : "publicaciones disponibles"}</p></div>{hasFilters ? <button onClick={clearFilters} className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"><X className="mr-2 h-4 w-4" />Limpiar filtros</button> : null}</div></div>

      <div className="mb-8 overflow-x-auto rounded-2xl border border-border bg-card p-3 shadow-sm"><div className="flex w-max min-w-full items-center gap-3"><div className="relative shrink-0" style={{ width: 480, minWidth: 480 }}><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem" }} className="h-11 w-full rounded-xl border border-secondary/25 bg-background pr-4 text-sm font-semibold outline-none placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10" placeholder="Buscar artículos por título o contenido..." /></div><SelectField ariaLabel="Filtrar por categoría" value={category} onValueChange={(value) => { setCategory(value); setPage(1); }} options={[{ value: "", label: "Todas las categorías" }, ...categories.map((item) => ({ value: item.slug, label: `${item.name} (${item._count?.posts ?? 0})` }))]} className="h-11 w-[220px] shrink-0 bg-background shadow-none" /><SelectField ariaLabel="Filtrar por tag" value={tag} onValueChange={(value) => { setTag(value); setPage(1); }} options={[{ value: "", label: "Todos los tags" }, ...tags.map((item) => ({ value: item.slug, label: `#${item.name} (${item._count?.posts ?? 0})` }))]} className="h-11 w-[200px] shrink-0 bg-background shadow-none" /></div></div>

      {isLoading ? <CardsSkeleton /> : posts.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <ArticleCard key={post.id} post={post} />)}</div> : <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center"><div><Newspaper className="mx-auto h-11 w-11 text-secondary" /><h3 className="mt-4 text-xl font-black">No encontramos artículos</h3><p className="mt-2 text-muted-foreground">Cambia la búsqueda, categoría o tag seleccionado.</p><button onClick={clearFilters} className="mt-5 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground">Ver todas las publicaciones</button></div></div>}
      {totalPages > 1 ? <div className="mt-9 flex items-center justify-between border-t border-border pt-5"><span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold disabled:opacity-40">Anterior</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-40">Siguiente</button></div></div> : null}
    </section>
  </main>;
}

function LatestCarousel({ posts }: Readonly<{ posts: Post[] }>) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * 680, behavior: "smooth" });
  return <section className="border-b border-border bg-card py-12"><div className="section-container"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">Recién publicados</p><h2 className="mt-2 text-2xl font-black">Últimos artículos</h2></div><div className="flex gap-2"><button onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-muted" aria-label="Artículos anteriores"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-muted" aria-label="Artículos siguientes"><ChevronRight className="h-5 w-5" /></button></div></div><div ref={track} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="group grid w-[420px] min-w-[420px] snap-start grid-cols-[145px_1fr] overflow-hidden rounded-2xl border border-border bg-background transition hover:border-secondary/40 hover:shadow-lg">{post.coverImageUrl ? <img src={post.coverImageUrl} alt={`Portada de ${post.title}`} className="h-full min-h-36 w-full object-cover" /> : <div className="flex min-h-36 items-center justify-center bg-muted"><Newspaper className="h-8 w-8 text-secondary" /></div>}<div className="flex min-w-0 flex-col p-4"><span className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-secondary">{post.category?.name ?? "Artículo"}</span><h3 className="mt-2 line-clamp-2 text-base font-black leading-snug group-hover:text-secondary">{post.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt || "Leer publicación completa."}</p><span className="mt-auto inline-flex items-center pt-3 text-xs font-black text-secondary">Leer artículo<ArrowRight className="ml-1 h-3.5 w-3.5" /></span></div></Link>)}</div></div></section>;
}

function ArticleCard({ post }: Readonly<{ post: Post }>) { return <Link href={`/blog/${post.slug}`} className="group flex min-h-36 overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">{post.coverImageUrl ? <img src={post.coverImageUrl} alt={`Portada de ${post.title}`} className="w-1/2 object-cover" /> : <div className="flex w-1/2 items-center justify-center bg-muted"><Newspaper className="h-7 w-7 text-secondary" /></div>}<div className="flex w-1/2 min-w-0 flex-col p-3"><span className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-secondary">{post.category?.name ?? "Artículo"}</span><h3 className="mt-1.5 line-clamp-2 text-sm font-black leading-snug group-hover:text-secondary">{post.title}</h3><p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{post.excerpt || "Leer publicación completa."}</p><div className="mt-auto flex items-center justify-between border-t border-border pt-2 text-[9px] text-muted-foreground"><span className="inline-flex items-center"><CalendarDays className="mr-1 h-3 w-3" />{new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short" }).format(new Date(post.publishedAt ?? post.createdAt))}</span><ArrowRight className="h-3 w-3 text-secondary" /></div></div></Link>; }
function CardsSkeleton() { return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex min-h-36 animate-pulse overflow-hidden rounded-xl border border-border bg-card"><div className="w-1/2 bg-muted" /><div className="w-1/2 space-y-3 p-3"><div className="h-3 rounded bg-muted" /><div className="h-5 rounded bg-muted" /><div className="h-3 rounded bg-muted" /></div></div>)}</div>; }
