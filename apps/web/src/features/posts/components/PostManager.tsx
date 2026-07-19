"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, FileText, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { createPost, deletePost, listPosts, updatePost } from "../services/post-service";
import type { Post, PostFormValues, PostStatus } from "../types/post.types";

const emptyForm: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  status: "DRAFT",
  coverImage: null
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiClientError ? error.message : "No se pudo completar la accion.";
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormValues>(emptyForm);

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.POSTS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.POSTS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.POSTS_DELETE);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const result = await listPosts({ q, status, page, pageSize: 10 });
      setPosts(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, [page]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadPosts();
  };

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      status: post.status,
      coverImage: null
    });
    setIsModalOpen(true);
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setForm({
      ...form,
      coverImage: {
        fileName: file.name,
        mimeType: file.type,
        dataBase64: await fileToBase64(file)
      }
    });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingPost) {
        await updatePost(editingPost.id, form);
        toast.success("Publicacion actualizada correctamente.");
      } else {
        await createPost(form);
        toast.success("Publicacion creada correctamente.");
      }
      setIsModalOpen(false);
      await loadPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Eliminar la publicacion "${post.title}"? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deletePost(post.id);
      toast.success("Publicacion eliminada correctamente.");
      await loadPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Blog</p>
            <h1 className="mt-2 text-3xl font-black">Publicaciones</h1>
            <p className="mt-2 text-sm text-muted-foreground">Crea y publica contenido para el blog publico.</p>
          </div>
          {canCreate ? (
            <button type="button" onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear publicacion
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(event) => setQ(event.target.value)} className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm" placeholder="Buscar publicaciones..." />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as PostStatus | "")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
          <button type="submit" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">Filtrar</button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Publicacion</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Cargando publicaciones...</td></tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-secondary" />
                  <p className="font-bold">No hay publicaciones</p>
                  <p className="mt-1 text-muted-foreground">Crea la primera publicacion del blog.</p>
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-bold">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">{statusLabel(post.status)}</td>
                  <td className="px-4 py-3">{post.author.firstName} {post.author.lastName}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canUpdate ? <button type="button" onClick={() => openEdit(post)} className="rounded-md border border-border p-2 hover:bg-muted"><Edit className="h-4 w-4" /></button> : null}
                      {canDelete ? <button type="button" onClick={() => handleDelete(post)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button> : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button>
            <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xl font-black">{editingPost ? "Editar publicacion" : "Crear publicacion"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-3 py-1 text-sm font-bold hover:bg-muted">Cerrar</button>
            </header>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <TextField label="Titulo *" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
              <TextField label="Resumen" value={form.excerpt} onChange={(value) => setForm({ ...form, excerpt: value })} />
              <label className="space-y-1 block">
                <span className="text-sm font-bold">Contenido *</span>
                <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-bold">Estado</span>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PostStatus })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Archivado</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-bold">Imagen de portada</span>
                  <input type="file" accept="image/*" onChange={handleImage} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">{editingPost ? "Guardar cambios" : "Crear publicacion"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function statusLabel(status: PostStatus) {
  const labels: Record<PostStatus, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ARCHIVED: "Archivado"
  };
  return labels[status];
}

function TextField({
  label,
  value,
  onChange,
  required = false
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}>) {
  return (
    <label className="space-y-1 block">
      <span className="text-sm font-bold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}
