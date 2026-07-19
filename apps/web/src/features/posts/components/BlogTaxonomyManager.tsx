"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Edit, FolderOpen, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getStoredSession } from "@/features/auth/auth-service";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { PERMISSIONS } from "@/lib/permissions";
import { createTaxonomy, deleteTaxonomy, listTaxonomies, updateTaxonomy } from "../services/post-service";
import type { BlogTaxonomy } from "../types/post.types";

export function BlogTaxonomyManager({ kind }: Readonly<{ kind: "categories" | "tags" }>) {
  const isCategory = kind === "categories";
  const singular = isCategory ? "categoría" : "tag";
  const title = isCategory ? "Categorías" : "Tags";
  const [items, setItems] = useState<BlogTaxonomy[]>([]);
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<BlogTaxonomy | null>(null);
  const [name, setName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BlogTaxonomy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const permissions = useMemo(() => getStoredSession()?.user.permissions ?? [], []);
  const canCreate = permissions.includes(isCategory ? PERMISSIONS.CATEGORIES_CREATE : PERMISSIONS.TAGS_CREATE);
  const canUpdate = permissions.includes(isCategory ? PERMISSIONS.CATEGORIES_UPDATE : PERMISSIONS.TAGS_UPDATE);
  const canDelete = permissions.includes(isCategory ? PERMISSIONS.CATEGORIES_DELETE : PERMISSIONS.TAGS_DELETE);
  const filtered = items.filter((item) => !q.trim() || [item.name, item.slug].some((value) => value.toLowerCase().includes(q.trim().toLowerCase())));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const pageItems = filtered.slice((page - 1) * 10, page * 10);
  const load = async () => { setIsLoading(true); try { setItems(await listTaxonomies(kind)); } catch (error) { toast.error(getUserFacingErrorMessage(error)); } finally { setIsLoading(false); } };
  useEffect(() => { void load(); }, [kind]);
  useEffect(() => { setPage(1); }, [q]);
  const openCreate = () => { setEditing(null); setName(""); setIsModalOpen(true); };
  const openEdit = (item: BlogTaxonomy) => { setEditing(item); setName(item.name); setIsModalOpen(true); };
  const save = async (event: FormEvent) => { event.preventDefault(); try { if (editing) await updateTaxonomy(kind, editing.id, name); else await createTaxonomy(kind, name); toast.success(`${isCategory ? "Categoría" : "Tag"} ${editing ? "actualizado" : "creado"} correctamente.`); setIsModalOpen(false); await load(); } catch (error) { toast.error(getUserFacingErrorMessage(error)); } };
  const confirmDelete = async () => { if (!toDelete) return; setIsDeleting(true); try { await deleteTaxonomy(kind, toDelete.id); setToDelete(null); toast.success(`${isCategory ? "Categoría" : "Tag"} eliminado correctamente.`); await load(); } catch (error) { toast.error(getUserFacingErrorMessage(error)); } finally { setIsDeleting(false); } };
  const Icon = isCategory ? FolderOpen : Tag;

  return <div className="space-y-5">
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><Link href="/posts" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"><ArrowLeft className="h-4 w-4" />Volver a publicaciones</Link><p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Blog</p><div className="mt-2 flex items-center gap-3"><h1 className="text-3xl font-black">{title}</h1><span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{items.length} disponibles</span></div><p className="mt-2 text-sm text-muted-foreground">Organiza el contenido publicado mediante {title.toLowerCase()}.</p></div>{canCreate ? <button onClick={openCreate} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Crear {singular}</button> : null}</div><div className="mt-6 max-w-full overflow-x-auto"><div className="relative shrink-0" style={{ width: 500, minWidth: 500 }}><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background pr-4 text-base outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15" placeholder={`Buscar ${title.toLowerCase()}...`} /></div></div></section>
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><table className="w-full text-sm"><thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Publicaciones</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Cargando...</td></tr> : filtered.length === 0 ? <tr><td colSpan={4} className="py-12"><div className="flex flex-col items-center text-center"><Icon className="mb-3 h-9 w-9 text-secondary" /><p className="font-bold">No hay {title.toLowerCase()}</p></div></td></tr> : pageItems.map((item) => <tr key={item.id} className="border-t border-border text-center hover:bg-muted/35"><td className="px-4 py-3 font-bold">{item.name}</td><td className="px-4 py-3 text-muted-foreground">/{item.slug}</td><td className="px-4 py-3">{item._count?.posts ?? 0}</td><td className="px-4 py-3"><div className="flex justify-center gap-2">{canUpdate ? <button onClick={() => openEdit(item)} className="rounded-md border border-border p-2"><Edit className="h-4 w-4" /></button> : null}{canDelete ? <button onClick={() => setToDelete(item)} className="rounded-md border border-border p-2 text-destructive"><Trash2 className="h-4 w-4" /></button> : null}</div></td></tr>)}</tbody></table><div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm"><span className="text-muted-foreground">Pagina {page} de {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button></div></div></section>
    {isModalOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"><header className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span><h2 className="text-lg font-black">{editing ? "Editar" : "Crear"} {singular}</h2></div><button onClick={() => setIsModalOpen(false)} className="p-2"><X className="h-5 w-5" /></button></header><form onSubmit={save}><div className="p-5"><label className="space-y-2"><span className="text-sm font-bold">Nombre<span className="ml-1 text-destructive">*</span></span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10" /></label></div><div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3"><button type="button" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border border-border px-5 font-bold">Cancelar</button><button className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground">{editing ? "Guardar cambios" : "Crear"}</button></div></form></section></div> : null}
    <ConfirmDialog open={Boolean(toDelete)} title={`Eliminar ${singular}`} description={`¿Deseas eliminar “${toDelete?.name ?? ""}”? Las publicaciones se conservarán.`} confirmLabel="Eliminar" isLoading={isDeleting} onConfirm={() => void confirmDelete()} onCancel={() => setToDelete(null)} />
  </div>;
}
