"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedPost, listPublishedPosts } from "../services/post-service";
import type { Post } from "../types/post.types";
import { PostCover } from "./PostCover";

function formatDate(post: Post) {
  return new Date(post.publishedAt || post.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}

function readingMinutes(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}

export function PublicPostDetail({ slug }: Readonly<{ slug: string }>) {
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getPublishedPost(slug).then((value) => { if (active) setPost(value); }).catch(() => { if (active) setPost(null); }).finally(() => { if (active) setIsLoading(false); });
    listPublishedPosts().then((items) => { if (active) setRelatedPosts(items.filter((item) => item.slug !== slug).slice(0, 3)); }).catch(() => { if (active) setRelatedPosts([]); });
    return () => { active = false; };
  }, [slug]);

  const paragraphs = post?.content.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="section-container py-7 md:py-10">
        <nav aria-label="Ruta de navegación" className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500"><Link href="/" className="hover:text-primary">Inicio</Link><span>›</span><Link href="/blog" className="hover:text-primary">Blog</Link>{post && <><span>›</span><span className="max-w-[220px] truncate text-slate-800">{post.category?.name || "Artículo"}</span></>}</nav>

        {isLoading ? <div className="grid animate-pulse gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><div className="h-[680px] rounded-2xl bg-slate-200"/><div className="h-[680px] rounded-2xl bg-slate-200"/></div> : post ? (
          <div className="grid items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="rounded-2xl bg-[#211a5c] p-6 text-white lg:sticky lg:top-28"><span className="inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-sm font-black">03 · Artículo</span><h2 className="mt-5 text-2xl font-black leading-tight">Una mirada a fondo.</h2><p className="mt-3 text-sm leading-6 text-white/75">Análisis, aprendizajes y perspectivas para llevar nuevas ideas a tu organización.</p><Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white"><ArrowLeft className="h-4 w-4"/> Todos los artículos</Link></aside>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500"><span className="rounded-full bg-primary/10 px-3 py-1.5 uppercase tracking-wider text-primary">{post.category?.name || "Dyxersoft Blog"}</span><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/>{formatDate(post)}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4"/>{readingMinutes(post.content)} min de lectura</span></div>
                <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[1.12] tracking-tight md:text-5xl">{post.title}</h1>
                {post.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{post.excerpt}</p>}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-5 w-5"/></span><div><p className="text-xs text-slate-500">Escrito por</p><p className="text-sm font-bold">{post.author.firstName} {post.author.lastName}</p></div></div>{post.tags.length > 0 && <div className="flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">{tag.name}</span>)}</div>}</div>
              </header>

              <PostCover src={post.coverImageUrl} title={post.title} className="aspect-[2/1] max-h-[520px]" />

              <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_250px]">
                <div className="min-w-0">
                  {post.excerpt && <blockquote className="mb-8 border-l-4 border-primary bg-primary/5 px-5 py-4 text-lg font-semibold leading-7 text-slate-800">{post.excerpt}</blockquote>}
                  <div className="space-y-6 text-[16px] leading-8 text-slate-700 md:text-[17px]">{paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>) : <p className="whitespace-pre-line">{post.content}</p>}</div>
                  {post.tags.length > 0 && <div className="mt-10 border-t border-slate-200 pt-6"><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Temas</p><div className="flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{tag.name}</span>)}</div></div>}
                  <div className="mt-10 rounded-2xl bg-[#211a5c] p-6 text-white md:p-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">¿Quieres conversar?</p><h2 className="mt-2 text-2xl font-black">Llevemos estas ideas a tu operación.</h2><Link href="/#contacto" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#211a5c] transition hover:bg-violet-100">Habla con nuestro equipo <ArrowRight className="h-4 w-4"/></Link></div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-black">Sobre este artículo</h2><p className="mt-2 text-sm leading-6 text-slate-600">Una lectura de {readingMinutes(post.content)} minutos para conocer nuevas ideas y aplicarlas en tu negocio.</p><div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays className="h-4 w-4 text-primary"/>{formatDate(post)}</div></div>
                  {relatedPosts.length > 0 && <div><h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Artículos relacionados</h2><div className="space-y-3">{relatedPosts.map((related) => <Link key={related.id} href={`/blog/${encodeURIComponent(related.slug)}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-primary/40 hover:shadow-md"><PostCover src={related.coverImageUrl} title={related.title}/><span className="block p-3 text-sm font-bold leading-5 group-hover:text-primary">{related.title}</span></Link>)}</div></div>}
                </aside>
              </div>
            </article>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h1 className="text-2xl font-black">Artículo no encontrado</h1><p className="mt-3 text-slate-600">Puede que el artículo ya no esté publicado.</p><Link href="/blog" className="mt-5 inline-flex items-center gap-2 font-bold text-primary"><ArrowLeft className="h-4 w-4"/>Volver al blog</Link></section>
        )}
      </div>
    </main>
  );
}
