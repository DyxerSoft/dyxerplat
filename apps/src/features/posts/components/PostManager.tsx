"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, FileText, Loader2, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@dyxerplat/shared";
import {
  ActionIconButton,
  DataTable,
  EmptyState,
  EmptyPanel,
  FilterBar,
  LoadingRow,
  Modal,
  PageHeader,
  PaginationBar,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SelectField,
  StatusPill,
  TableHead,
  TextField
} from "@/components/platform/crm-ui";
import { getErrorMessage, getSessionPermissions } from "@/lib/crm";
import { invalidateListCache, readListCache, writeListCache } from "@/lib/list-cache";
import {
  createPost,
  createPostCategory,
  createPostTag,
  deletePost,
  deletePostCategory,
  deletePostTag,
  getPost,
  listPostCategories,
  listPosts,
  listPostTags,
  updatePost,
  updatePostCategory,
  updatePostTag
} from "../services/post-service";
import type { PaginatedPosts, Post, PostCategory, PostFormValues, PostStatus, PostTag } from "../types/post.types";

const emptyForm: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  status: "DRAFT",
  categoryId: "",
  tagIds: [],
  coverImage: null
};

type Filters = {
  q: string;
  status: PostStatus | "";
};

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
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState<PostStatus | "">("");
  const [filters, setFilters] = useState<Filters>({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const permissions = useMemo(() => getSessionPermissions(), []);
  const canCreate = permissions.includes(PERMISSIONS.POSTS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.POSTS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.POSTS_DELETE);
  const canManageTaxonomies = canCreate || canUpdate || canDelete;

  const loadPosts = useCallback(async (options?: { silent?: boolean; bustCache?: boolean }) => {
    const cacheKey = `posts:q=${filters.q}:status=${filters.status}:page=${page}`;

    if (options?.bustCache) {
      invalidateListCache("posts:");
    }

    const cached = readListCache<PaginatedPosts>(cacheKey);

    if (cached) {
      setPosts(cached.items);
      setTotalPages(cached.pagination.totalPages);
      setTotal(cached.pagination.total);
      setIsLoading(false);
    } else if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const result = await listPosts({
        q: filters.q,
        status: filters.status,
        page,
        pageSize: 10
      });

      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
        return;
      }

      writeListCache(cacheKey, result);
      setPosts(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  const loadTaxonomies = useCallback(async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([listPostCategories(), listPostTags()]);
      setCategories(categoriesResult);
      setTags(tagsResult);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    void loadTaxonomies();
  }, [loadTaxonomies]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters({ q: draftQ.trim(), status: draftStatus });
  };

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = async (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content || "",
      status: post.status,
      categoryId: post.category?.id ?? "",
      tagIds: post.tags.map((tag) => tag.id),
      coverImage: null
    });
    setIsModalOpen(true);

    try {
      const fullPost = await getPost(post.id);
      setEditingPost(fullPost);
      setForm({
        title: fullPost.title,
        excerpt: fullPost.excerpt ?? "",
        content: fullPost.content,
        status: fullPost.status,
        categoryId: fullPost.category?.id ?? "",
        tagIds: fullPost.tags.map((tag) => tag.id),
        coverImage: null
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB.");
      event.target.value = "";
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
    setIsSaving(true);
    try {
      if (editingPost) {
        await updatePost(editingPost.id, form);
        toast.success("Publicacion actualizada correctamente.");
      } else {
        await createPost(form);
        toast.success("Publicacion creada correctamente.");
      }
      setIsModalOpen(false);
      await loadPosts({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
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
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
      await loadPosts({ bustCache: true, silent: true });
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
      await loadPosts({ bustCache: true, silent: true });
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
      await loadPosts({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Blog"
        title="Publicaciones"
        description="Crea y publica contenido para el blog publico."
        actions={
          <>
            {canManageTaxonomies ? (
              <SecondaryButton onClick={openTaxonomies}>
                <Tags className="mr-2 h-4 w-4" />
                Categorias y tags
              </SecondaryButton>
            ) : null}
            {canCreate ? (
              <PrimaryButton onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear publicacion
              </PrimaryButton>
            ) : null}
          </>
        }
      >
        <FilterBar onSubmit={handleSearch}>
          <SearchInput value={draftQ} onChange={setDraftQ} placeholder="Buscar publicaciones..." />
          <SelectField value={draftStatus} onChange={(value) => setDraftStatus(value as PostStatus | "")}>
            <option value="">Todos</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </SelectField>
          <SecondaryButton type="submit">Filtrar</SecondaryButton>
        </FilterBar>
      </PageHeader>

      {!isLoading && posts.length === 0 ? (
        <EmptyPanel>
          <EmptyState
            icon={FileText}
            title={filters.q || filters.status ? "Sin resultados" : "No hay publicaciones"}
            description={
              filters.q || filters.status
                ? "Prueba con otros filtros o limpia la busqueda."
                : "Crea la primera publicacion del blog."
            }
            action={
              canCreate && !filters.q && !filters.status ? (
                <PrimaryButton onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear publicacion
                </PrimaryButton>
              ) : null
            }
          />
        </EmptyPanel>
      ) : (
        <DataTable
          minWidth="820px"
          footer={
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              onPrevious={() => setPage((value) => Math.max(1, value - 1))}
              onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
            />
          }
        >
          <TableHead
            columns={[
              { label: "Publicacion" },
              { label: "Estado" },
              { label: "Autor" },
              { label: "Acciones", align: "right" }
            ]}
          />
          <tbody>
            {isLoading ? (
              <LoadingRow colSpan={4} label="Cargando publicaciones..." />
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-bold">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /{post.slug}
                      {post.category ? ` · ${post.category.name}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={postStatusTone(post.status)}>{statusLabel(post.status)}</StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    {post.author.firstName} {post.author.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canUpdate ? (
                        <ActionIconButton title="Editar" onClick={() => openEdit(post)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canDelete ? (
                        <ActionIconButton title="Eliminar" danger onClick={() => void handleDelete(post)}>
                          <Trash2 className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      )}

      {isModalOpen ? (
        <Modal title={editingPost ? "Editar publicacion" : "Crear publicacion"} onClose={() => setIsModalOpen(false)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            <TextField label="Titulo *" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
            <TextField label="Resumen" value={form.excerpt} onChange={(value) => setForm({ ...form, excerpt: value })} />
            <label className="block space-y-1">
              <span className="text-sm font-bold">Contenido *</span>
              <textarea
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                required
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-bold">Estado</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as PostStatus })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-bold">Imagen de portada</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {form.coverImage ? (
                  <p className="text-xs text-muted-foreground">Nueva imagen: {form.coverImage.fileName}</p>
                ) : editingPost?.coverImageUrl ? (
                  <p className="text-xs text-muted-foreground">Se mantendra la imagen actual si no subes otra.</p>
                ) : null}
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <label className="space-y-1">
                <span className="text-sm font-bold">Categoria</span>
                <select
                  value={form.categoryId ?? ""}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value || null })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sin categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2">
                <p className="text-sm font-bold">Tags</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay tags creados.</p>
                  ) : (
                    tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <input type="checkbox" checked={form.tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                        {tag.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingPost ? "Guardar cambios" : "Crear publicacion"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}

      {isTaxonomyModalOpen ? (
        <Modal title="Categorias y tags" onClose={() => setIsTaxonomyModalOpen(false)} wide>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
              onCancelEdit={() => {
                setEditingCategory(null);
                setCategoryName("");
              }}
              onDelete={handleDeleteCategory}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isSaving={isSaving}
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
              onCancelEdit={() => {
                setEditingTag(null);
                setTagName("");
              }}
              onDelete={handleDeleteTag}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isSaving={isSaving}
            />
          </div>
        </Modal>
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

function postStatusTone(status: PostStatus): "success" | "neutral" | "warning" {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "neutral";
}

function TaxonomyPanel<TItem extends { id: string; name: string; slug: string; postsCount: number }>({
  title,
  items,
  value,
  setValue,
  editingName,
  onSubmit,
  onEdit,
  onCancelEdit,
  onDelete,
  canCreate,
  canUpdate,
  canDelete,
  isSaving
}: Readonly<{
  title: string;
  items: TItem[];
  value: string;
  setValue: (value: string) => void;
  editingName: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (item: TItem) => void;
  onCancelEdit: () => void;
  onDelete: (item: TItem) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isSaving: boolean;
}>) {
  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-lg font-black">{title}</h3>
        <p className="text-sm text-muted-foreground">{items.length} registros activos</p>
      </div>

      {canCreate || editingName ? (
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            placeholder="Nombre"
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {editingName ? (
            <SecondaryButton type="button" onClick={onCancelEdit} disabled={isSaving}>
              Cancelar
            </SecondaryButton>
          ) : null}
          <PrimaryButton type="submit" disabled={isSaving}>
            {editingName ? "Guardar" : "Crear"}
          </PrimaryButton>
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
                <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                  No hay registros.
                </td>
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
                        <ActionIconButton title="Editar" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canDelete ? (
                        <ActionIconButton title="Eliminar" danger onClick={() => onDelete(item)}>
                          <Trash2 className="h-4 w-4" />
                        </ActionIconButton>
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
