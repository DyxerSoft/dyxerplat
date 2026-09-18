"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, FileText, FolderOpen, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField } from "@/components/ui/SelectField";
import { createPost, deletePost, listPosts, listTaxonomies, updatePost } from "../services/post-service";
import type { BlogTaxonomy, Post, PostFormValues, PostStatus } from "../types/post.types";

const emptyForm: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  status: "DRAFT",
  coverImage: null,
  categoryId: "",
  tagIds: []
};

function getErrorMessage(error: unknown) {
  return getUserFacingErrorMessage(error);
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
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormValues>(emptyForm);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<BlogTaxonomy[]>([]);
  const [tags, setTags] = useState<BlogTaxonomy[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      const result = await listPosts({ q: debouncedQ, status, page, pageSize: 10 });
      setPosts(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, [page, debouncedQ, status]);
  useEffect(() => { const timeout = window.setTimeout(() => { setPage(1); setDebouncedQ(q); }, 300); return () => window.clearTimeout(timeout); }, [q]);
  useEffect(() => { Promise.all([listTaxonomies("categories"), listTaxonomies("tags")]).then(([categoryItems, tagItems]) => { setCategories(categoryItems); setTags(tagItems); }).catch(() => undefined); }, []);

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      status: post.status,
      coverImage: null,
      categoryId: post.category?.id ?? "",
      tagIds: post.tags.map((tag) => tag.id)
    });
    setImagePreview(post.coverImageUrl);
    setIsModalOpen(true);
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataBase64 = await fileToBase64(file);
    setImagePreview(dataBase64);
    setForm({
      ...form,
      coverImage: {
        fileName: file.name,
        mimeType: file.type,
        dataBase64
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
    setPostToDelete(post);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deletePost(postToDelete.id);
      toast.success("Publicacion eliminada correctamente.");
      setPostToDelete(null);
      await loadPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Blog</p>
            <div className="mt-2 flex items-center gap-3"><h1 className="text-3xl font-black">Publicaciones</h1><span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{total} registradas</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Crea y publica contenido para el blog público.</p>
          </div>
          {canCreate ? (
            <button type="button" onClick={openCreate} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear publicación
            </button>
          ) : null}
        </div>

        <div className="mt-6 max-w-full overflow-x-auto pb-1"><div className="inline-flex w-max items-center gap-3">
          <div className="relative shrink-0" style={{ width: 500, minWidth: 500 }}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background pr-4 text-base outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15" placeholder="Buscar publicaciones..." />
          </div>
          <SelectField ariaLabel="Filtrar por estado" value={status} onValueChange={(value) => { setStatus(value as PostStatus | ""); setPage(1); }} options={[{ value: "", label: "Todos los estados" }, { value: "DRAFT", label: "Borradores" }, { value: "PUBLISHED", label: "Publicadas" }, { value: "ARCHIVED", label: "Archivadas" }]} className="h-11 w-[190px] bg-muted/60 shadow-none" />
          <Link href="/posts/categories" className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"><FolderOpen className="mr-2 h-4 w-4 text-secondary" />Categorías</Link>
          <Link href="/posts/tags" className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"><Tag className="mr-2 h-4 w-4 text-secondary" />Tags</Link>
        </div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Publicación</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Acciones</th>
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
                <tr key={post.id} className="border-t border-border text-center hover:bg-muted/35">
                  <td className="px-4 py-3 text-center">
                    <p className="font-bold">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">{statusLabel(post.status)}</td>
                  <td className="px-4 py-3">{post.author.firstName} {post.author.lastName}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
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
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <section className="max-h-[88dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
            <header className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-3">
              <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText className="h-5 w-5" /></span><div><h2 className="text-lg font-black">{editingPost ? "Editar publicación" : "Crear publicación"}</h2><p className="text-xs text-muted-foreground">Contenido que podrá mostrarse en el blog público.</p></div></div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground"><X className="h-5 w-5" /></button>
            </header>
            <form onSubmit={handleSave} className="space-y-4 p-5">
              <TextField label="Título" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
              <TextField label="Resumen" value={form.excerpt} onChange={(value) => setForm({ ...form, excerpt: value })} />
              <label className="space-y-1 block">
                <span className="text-sm font-bold">Contenido *</span>
                <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-bold">Estado</span>
                  <SelectField ariaLabel="Estado de la publicación" value={form.status} onValueChange={(value) => setForm({ ...form, status: value as PostStatus })} options={[{ value: "DRAFT", label: "Borrador" }, { value: "PUBLISHED", label: "Publicado" }, { value: "ARCHIVED", label: "Archivado" }]} className="h-11" />
                </div>
                <label className="space-y-1">
                  <span className="text-sm font-bold">Imagen de portada</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1 file:font-bold file:text-foreground" />
                  <p className="text-xs text-muted-foreground">JPG, PNG o WEBP. Máximo 2 MB. Selecciona otra imagen únicamente si deseas reemplazar la actual.</p>
                </label>
              </div>
              {imagePreview ? <div className="flex w-fit max-w-full items-center gap-3 rounded-xl border border-border bg-background p-2"><img src={imagePreview} alt="Vista previa de la portada" className="h-16 w-24 shrink-0 rounded-lg object-cover" /><div className="pr-2 text-xs text-muted-foreground"><span className="block whitespace-nowrap">{form.coverImage ? "Nueva portada seleccionada" : "Portada guardada"}</span>{form.coverImage ? <button type="button" onClick={() => { setForm({ ...form, coverImage: null }); setImagePreview(editingPost?.coverImageUrl ?? null); }} className="mt-1 font-bold text-destructive">Descartar cambio</button> : null}</div></div> : null}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2"><span className="text-sm font-bold">Categoría</span><SelectField ariaLabel="Categoría de la publicación" value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })} options={[{ value: "", label: "Sin categoría" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]} className="h-11" /></div>
                <div><span className="text-sm font-bold">Tags</span><div className="mt-2 flex min-h-11 flex-wrap gap-2 rounded-xl border border-input bg-background p-2">{tags.length ? tags.map((tag) => { const selected = form.tagIds.includes(tag.id); return <button key={tag.id} type="button" onClick={() => setForm({ ...form, tagIds: selected ? form.tagIds.filter((id) => id !== tag.id) : [...form.tagIds, tag.id] })} className={`rounded-full border px-3 py-1 text-xs font-bold transition ${selected ? "border-secondary bg-secondary/15 text-secondary" : "border-border text-muted-foreground hover:bg-muted"}`}>{tag.name}</button>; }) : <span className="px-1 py-1 text-xs text-muted-foreground">No hay tags creados.</span>}</div></div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border border-border px-5 text-sm font-bold hover:bg-muted">Cancelar</button>
                <button type="submit" className="h-11 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90">{editingPost ? "Guardar cambios" : "Crear publicación"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Eliminar publicación"
        description={`¿Deseas eliminar “${postToDelete?.title ?? ""}”? Dejará de mostrarse en la administración y en el blog público.`}
        confirmLabel="Eliminar publicación"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPostToDelete(null)}
      />
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
