"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedPost } from "../services/post-service";
import type { Post } from "../types/post.types";

export function PublicPostDetail({ slug }: Readonly<{ slug: string }>) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublishedPost(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <main className="min-h-screen bg-background">
      <div className="section-container py-8">
        <Link href="/blog" className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al blog
        </Link>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Cargando publicacion...</p>
        ) : post ? (
          <article className="mx-auto mt-10 max-w-4xl">
            {post.coverImageUrl ? <img src={post.coverImageUrl} alt="" className="mb-8 aspect-[16/9] w-full rounded-xl object-cover" /> : null}
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">DyxerSoft Blog</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p> : null}
            <div className="mt-8 whitespace-pre-wrap rounded-xl border border-border bg-card p-6 leading-8 text-foreground">{post.content}</div>
          </article>
        ) : (
          <section className="mt-10 rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-black">Publicacion no encontrada</h1>
            <p className="mt-3 text-muted-foreground">La publicacion no existe o aun no fue publicada.</p>
          </section>
        )}
      </div>
    </main>
  );
}
