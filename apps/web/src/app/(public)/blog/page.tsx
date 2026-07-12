import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

export default function BlogPage() {
  const posts: Array<{
    title: string;
    excerpt: string;
    slug: string;
  }> = [];

  return (
    <main className="min-h-screen bg-background">
      <div className="section-container">
        <header className="flex min-h-20 items-center justify-between border-b border-border py-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </header>

        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Blog</p>
          <h1 className="mt-3 text-4xl font-black">Publicaciones DyxerSoft</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Novedades, casos y contenido sobre software, datos, automatizacion e inteligencia artificial.
          </p>

          {posts.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="enterprise-card rounded-xl p-6">
                  <h2 className="text-xl font-black">{post.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-card/70 p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Newspaper className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-2xl font-black">Aun no hay publicaciones</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Estamos preparando el blog. Cuando existan publicaciones, apareceran aqui con su listado publico.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  Volver a Dyxersoft
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
