"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { listPublishedPosts } from "../services/post-service";
import type { Post } from "../types/post.types";
import { PostCover } from "./PostCover";

function publishedDate(post: Post) {
  const value = post.publishedAt || post.createdAt;
  return new Date(value).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

export function PublicBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listPublishedPosts().then(setPosts).catch(() => setPosts([])).finally(() => setIsLoading(false));
  }, []);

  const featured = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="section-container py-10 md:py-14">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Ideas, historias y guías</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div><h1 className="text-4xl font-black tracking-tight md:text-5xl">Blog Dyxersoft</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">Experiencias, ideas y herramientas para mejorar la forma en que trabajan y crecen las empresas.</p></div>
            {!isLoading && <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">{posts.length} {posts.length === 1 ? "artículo" : "artículos"}</span>}
          </div>
        </div>
      </section>

      <div className="section-container space-y-12 py-10 md:py-14">
        {isLoading ? (
          <div className="grid animate-pulse gap-5 lg:grid-cols-[250px_1fr]"><div className="h-72 rounded-2xl bg-slate-200"/><div className="h-72 rounded-2xl bg-slate-200"/></div>
        ) : featured ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]" aria-labelledby="featured-heading">
              <aside className="flex flex-col justify-between rounded-2xl bg-[#211a5c] p-6 text-white">
                <div><span className="inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-sm font-black">01 · Destacado</span><h2 id="featured-heading" className="mt-5 text-2xl font-black leading-tight">Una idea que vale la pena explorar.</h2></div>
                <p className="mt-8 text-sm leading-6 text-white/75">Lecturas prácticas, experiencias reales y nuevas perspectivas del equipo Dyxersoft.</p>
              </aside>

              <Link href={`/blog/${encodeURIComponent(featured.slug)}`} aria-label={`Leer artículo destacado: ${featured.title}`} className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.05fr_0.95fr]">
                <PostCover src={featured.coverImageUrl} title={featured.title} className="h-full min-h-64 aspect-auto md:min-h-[340px]" />
                <div className="flex flex-col justify-center p-6 md:p-9">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary"><span className="rounded-full bg-primary/10 px-3 py-1.5">{featured.category?.name ?? "Artículo destacado"}</span><span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-slate-500"><CalendarDays className="h-3.5 w-3.5"/>{publishedDate(featured)}</span></div>
                  <h2 className="mt-5 text-2xl font-black leading-tight md:text-3xl">{featured.title}</h2>
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600 md:text-base">{featured.excerpt || "Una lectura para entender nuevas ideas y llevarlas a la práctica."}</p>
                  <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Leer artículo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></span>
                </div>
              </Link>
            </section>

            {recentPosts.length > 0 && <section aria-labelledby="recent-heading">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Nuevas publicaciones</p><h2 id="recent-heading" className="mt-2 text-2xl font-black md:text-3xl">Últimos artículos</h2></div><span className="text-sm font-semibold text-slate-500">Ideas recientes del equipo Dyxersoft</span></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recentPosts.map((post) => <Link key={post.id} href={`/blog/${encodeURIComponent(post.slug)}`} aria-label={`Leer artículo: ${post.title}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <PostCover src={post.coverImageUrl} title={post.title}/>
                <div className="p-5"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-bold uppercase tracking-wider text-primary">{post.category?.name ?? "Dyxersoft"}</span><time className="shrink-0 text-xs text-slate-500">{publishedDate(post)}</time></div><h3 className="mt-3 line-clamp-2 text-lg font-black leading-snug">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.excerpt || "Lee el artículo completo."}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Leer más <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></span></div>
              </Link>)}</div>
            </section>}
          </>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Newspaper className="h-7 w-7"/></span><h2 className="mt-5 text-2xl font-black">Estamos preparando nuevas historias</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Pronto encontrarás aquí artículos, experiencias y guías del equipo Dyxersoft.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Volver al inicio <ArrowRight className="h-4 w-4"/></Link></section>
        )}
      </div>
    </main>
  );
}
