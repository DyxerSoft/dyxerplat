"use client";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { listPublishedPosts } from "../services/post-service";
import type { Post } from "../types/post.types";

export function LandingBlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => { listPublishedPosts({ pageSize: 3 }).then((result) => setPosts(result.items)).catch(() => setPosts([])); }, []);
  if (!posts.length) return null;
  return <section id="blog" className="scroll-mt-20 bg-background py-14 lg:py-16"><div className="section-container"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="section-eyebrow">Blog</p><h2 className="section-title">Ideas para transformar la operación</h2><p className="section-copy">Contenido práctico sobre tecnología, datos, automatización y gestión empresarial.</p></div><Link href="/blog" className="inline-flex items-center text-sm font-black text-secondary hover:underline">Ver todas las publicaciones<ArrowRight className="ml-2 h-4 w-4" /></Link></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">{post.coverImageUrl ? <img src={post.coverImageUrl} alt={`Portada de ${post.title}`} className="h-24 w-full object-cover" /> : <div className="flex h-24 items-center justify-center bg-muted"><Newspaper className="h-7 w-7 text-secondary" /></div>}<div className="p-3">{post.category ? <span className="text-[9px] font-black uppercase tracking-[0.12em] text-secondary">{post.category.name}</span> : null}<h3 className="mt-1.5 line-clamp-2 text-sm font-black text-foreground group-hover:text-secondary">{post.title}</h3><p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">{post.excerpt || "Leer publicación completa."}</p></div></Link>)}</div></div></section>;
}
