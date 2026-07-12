"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, FileText, Plus, Search, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@dyxerplat/shared";
import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import {
  createPost,
  createPostCategory,
  createPostTag,
  deletePost,
  deletePostCategory,
  deletePostTag,
  listPostCategories,
  listPosts,
  listPostTags,
  updatePost,
  updatePostCategory,
  updatePostTag
} from "../services/post-service";
import type { Post, PostCategory, PostFormValues, PostStatus, PostTag } from "../types/post.types";

const emptyForm: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  status: "DRAFT",
  categoryId: "",
  tagIds: [],
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
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormValues>(emptyForm);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);
  const [editingTag, setEditingTag] = useState<PostTag | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.POSTS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.POSTS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.POSTS_DELETE);
  const canManageTaxonomies = canCreate || canUpdate || canDelete;

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

  const loadTaxonomies = async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([listPostCategories(), listPostTags()]);
      setCategories(categoriesResult);
      setTags(tagsResult);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void loadPosts();
  }, [page]);

  useEffect(() => {
    void loadTaxonomies();
  }, []);

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
      categoryId: post.category?.id ?? "",
      tagIds: post.tags.map((tag) => tag.id),
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

  const toggleTag = (tagId: string) => {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId]
    }));
  };

  const openTaxonomies = () => {
    setEditingCategory(null);
    setEditingTag(null);
    setCategoryName("");
    setTagName("");
    setIsTaxonomyModalOpen(true);
  };

  const handleSaveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCategory) {
        await updatePostCategory(editingCategory.id, { name: categoryName });
        toast.success("Categoria actualizada correctamente.");
      } else {
        await createPostCategory({ name: categoryName });
        toast.success("Categoria creada correctamente.");
      }
      setEditingCategory(null);
      setCategoryName("");
      await loadTaxonomies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingTag) {
        await updatePostTag(editingTag.id, { name: tagName });
        toast.success("Etiqueta actualizada correctamente.");
      } else {
        await createPostTag({ name: tagName });
        toast.success("Etiqueta creada correctamente.");
      }
      setEditingTag(null);
      setTagName("");
      await loadTaxonomies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteCategory = async (category: PostCategory) => {
    if (!window.confirm(`Eliminar la categoria ${category.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deletePostCategory(category.id);
      toast.success("Categoria eliminada correctamente.");
      await loadTaxonomies();
      await loadPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteTag = async (tag: PostTag) => {
    if (!window.confirm(`Eliminar la etiqueta ${tag.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deletePostTag(tag.id);
      toast.success("Etiqueta eliminada correctamente.");
      await loadTaxonomies();
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
          <div className="flex flex-wrap gap-2">
            {canManageTaxonomies ? (
              <button type="button" onClick={openTaxonomies} className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">
                <Tags className="mr-2 h-4 w-4" />
                Categorias y tags
              </button>
            ) : null}
            {canCreate ? (
              <button type="button" onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Crear publicacion
              </button>
            ) : null}
          </div>
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
                    <p className="text-xs text-muted-foreground">/{post.slug} {post.category ? `- ${post.category.name}` : ""}</p>
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
                <label className="space-y-1">
                  <span className="text-sm font-bold">Categoria</span>
                  <select value={form.categoryId ?? ""} onChange={(event) => setForm({ ...form, categoryId: event.target.value || null })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Sin categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-bold">Tags</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay tags creados.</p>
                    ) : tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <input type="checkbox" checked={form.tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">{editingPost ? "Guardar cambios" : "Crear publicacion"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isTaxonomyModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xl font-black">Categorias y tags</h2>
              <button type="button" onClick={() => setIsTaxonomyModalOpen(false)} className="rounded-md border border-border px-3 py-1 text-sm font-bold hover:bg-muted">Cerrar</button>
            </header>
            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
              <TaxonomyPanel
                title="Categorias"
                items={categories}
                value={categoryName}
                setValue={setCategoryName}
                editingName={editingCategory?.name ?? null}
                onSubmit={handleSaveCategory}
                onEdit={(category) => {
                  setEditingCategory(category);
                  setCategoryName(category.name);
                }}
                onDelete={handleDeleteCategory}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
              <TaxonomyPanel
                title="Tags"
                items={tags}
                value={tagName}
                setValue={setTagName}
                editingName={editingTag?.name ?? null}
                onSubmit={handleSaveTag}
                onEdit={(tag) => {
                  setEditingTag(tag);
                  setTagName(tag.name);
                }}
                onDelete={handleDeleteTag}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            </div>
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

function TaxonomyPanel<TItem extends { id: string; name: string; slug: string; postsCount: number }>({
  title,
  items,
  value,
  setValue,
  editingName,
  onSubmit,
  onEdit,
  onDelete,
  canCreate,
  canUpdate,
  canDelete
}: Readonly<{
  title: string;
  items: TItem[];
  value: string;
  setValue: (value: string) => void;
  editingName: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (item: TItem) => void;
  onDelete: (item: TItem) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}>) {
  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-lg font-black">{title}</h3>
        <p className="text-sm text-muted-foreground">{items.length} registros activos</p>
      </div>

      {(canCreate || editingName) ? (
        <form onSubmit={onSubmit} className="flex gap-2">
          <input value={value} onChange={(event) => setValue(event.target.value)} required placeholder="Nombre" className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            {editingName ? "Guardar" : "Crear"}
          </button>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Posts</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">No hay registros.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">/{item.slug}</p>
                  </td>
                  <td className="px-3 py-2">{item.postsCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {canUpdate ? (
                        <button type="button" onClick={() => onEdit(item)} className="rounded-md border border-border p-2 hover:bg-muted" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button type="button" onClick={() => onDelete(item)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
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
