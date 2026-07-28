"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Edit, Mail, MessageSquareText, Phone, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField } from "@/components/ui/SelectField";
import { getStoredSession } from "@/features/auth/auth-service";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { deleteInquiry, listInquiries, updateInquiry } from "./inquiry-service";
import type { ContactInquiry, InquiryStatus } from "./types";

const statuses: Array<{ value: InquiryStatus; label: string }> = [
  { value: "NEW", label: "Nuevo" }, { value: "CONTACTED", label: "Contactado" },
  { value: "FOLLOW_UP", label: "En seguimiento" }, { value: "CONVERTED", label: "Convertido" },
  { value: "CLOSED", label: "Cerrado" }
];

export function InquiryManager() {
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [q, setQ] = useState(""); const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">(""); const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Partial<Record<InquiryStatus, number>>>({});
  const [isLoading, setIsLoading] = useState(true); const [selected, setSelected] = useState<ContactInquiry | null>(null);
  const [editStatus, setEditStatus] = useState<InquiryStatus>("NEW"); const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false); const [toDelete, setToDelete] = useState<ContactInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const permissions = useMemo(() => getStoredSession()?.user.permissions ?? [], []);
  const canUpdate = permissions.includes(PERMISSIONS.INQUIRIES_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.INQUIRIES_DELETE);

  const load = async () => {
    setIsLoading(true);
    try {
      const result = await listInquiries({ q: debouncedQ, status, page, pageSize: 10 });
      setItems(result.items); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages); setCounts(result.statusCounts);
    } catch (error) { toast.error(getUserFacingErrorMessage(error)); } finally { setIsLoading(false); }
  };
  useEffect(() => { void load(); }, [debouncedQ, status, page]);
  useEffect(() => { const timeout = window.setTimeout(() => { setPage(1); setDebouncedQ(q); }, 300); return () => window.clearTimeout(timeout); }, [q]);
  const open = (item: ContactInquiry) => { setSelected(item); setEditStatus(item.status); setNotes(item.notes ?? ""); };
  const save = async () => {
    if (!selected) return; setIsSaving(true);
    try { const updated = await updateInquiry(selected.id, { status: editStatus, notes }); setSelected(updated); toast.success("Seguimiento actualizado correctamente."); await load(); }
    catch (error) { toast.error(getUserFacingErrorMessage(error)); } finally { setIsSaving(false); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return; setIsDeleting(true);
    try { await deleteInquiry(toDelete.id); setToDelete(null); setSelected(null); toast.success("Solicitud eliminada correctamente."); await load(); }
    catch (error) { toast.error(getUserFacingErrorMessage(error)); } finally { setIsDeleting(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">CRM · Landing</p>
      <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black">Solicitudes web</h1><span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{total} recibidas</span></div>
      <p className="mt-2 text-sm text-muted-foreground">Gestiona los mensajes enviados desde el formulario de contacto de la landing.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{statuses.map((item) => <button key={item.value} onClick={() => { setStatus(status === item.value ? "" : item.value); setPage(1); }} className={`rounded-xl border p-3 text-left transition ${status === item.value ? "border-secondary bg-secondary/10" : "border-border bg-background hover:border-secondary/35"}`}><span className="text-xs font-bold text-muted-foreground">{item.label}</span><span className="mt-1 block text-xl font-black">{counts[item.value] ?? 0}</span></button>)}</div>
      <div className="mt-5 flex max-w-full items-center gap-3 overflow-x-auto pb-1"><div className="relative shrink-0" style={{ width: 500, minWidth: 500 }}><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background pr-4 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10" placeholder="Nombre, empresa, correo, teléfono o servicio" /></div><SelectField ariaLabel="Filtrar por estado" value={status} onValueChange={(value) => { setStatus(value as InquiryStatus | ""); setPage(1); }} options={[{ value: "", label: "Todos los estados" }, ...statuses]} className="h-11 w-[190px] shrink-0 bg-muted/60 shadow-none" /></div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Interés</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Recibido</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Cargando solicitudes...</td></tr> : items.length === 0 ? <tr><td colSpan={6} className="py-12"><div className="flex flex-col items-center text-center"><MessageSquareText className="mb-3 h-9 w-9 text-secondary" /><p className="font-bold">No hay solicitudes para mostrar</p><p className="mt-1 text-muted-foreground">Los mensajes enviados desde la landing aparecerán aquí.</p></div></td></tr> : items.map((item) => <tr key={item.id} className="border-t border-border text-center hover:bg-muted/35"><td className="px-4 py-3"><p className="font-bold">{item.name}</p><p className="text-xs text-muted-foreground">{item.email}</p></td><td className="px-4 py-3">{item.company}</td><td className="px-4 py-3">{item.service}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td><td className="px-4 py-3"><div className="flex justify-center gap-2"><button onClick={() => open(item)} className="rounded-md border border-border p-2 hover:bg-muted" title="Ver seguimiento"><Edit className="h-4 w-4" /></button>{canDelete ? <button onClick={() => setToDelete(item)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button> : null}</div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm"><span className="text-muted-foreground">Pagina {page} de {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button></div></div></section>
    {selected ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"><section className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"><header className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-3"><div><h2 className="text-lg font-black">Seguimiento de solicitud</h2><p className="text-xs text-muted-foreground">Recibida el {formatDate(selected.createdAt)}</p></div><button onClick={() => setSelected(null)} className="p-2 text-muted-foreground"><X className="h-5 w-5" /></button></header><div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5"><div className="grid gap-3 sm:grid-cols-2"><Info icon={Mail} label="Contacto" value={`${selected.name} · ${selected.email}`} /><Info icon={Building2} label="Empresa" value={selected.company} /><Info icon={Phone} label="Teléfono" value={selected.phone || "No indicado"} /><Info icon={CalendarDays} label="Servicio" value={selected.service} /></div><div className="rounded-xl border border-border bg-background p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mensaje</p><p className="mt-2 whitespace-pre-wrap leading-7">{selected.message}</p></div><div className="space-y-2"><span className="text-sm font-bold">Estado del seguimiento</span><SelectField ariaLabel="Estado del seguimiento" value={editStatus} onValueChange={(value) => setEditStatus(value as InquiryStatus)} options={statuses} className="h-11" /></div><label className="block space-y-2"><span className="text-sm font-bold">Notas internas</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="w-full resize-none rounded-xl border border-input bg-background p-3 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10" placeholder="Registra llamadas, acuerdos y próximos pasos..." /></label></div><div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3"><button onClick={() => setSelected(null)} className="h-11 rounded-xl border border-border px-5 font-bold">Cerrar</button>{canUpdate ? <button disabled={isSaving} onClick={() => void save()} className="h-11 rounded-xl bg-primary px-5 font-black text-primary-foreground disabled:opacity-60">{isSaving ? "Guardando..." : "Guardar seguimiento"}</button> : null}</div></section></div> : null}
    <ConfirmDialog open={Boolean(toDelete)} title="Eliminar solicitud" description={`¿Deseas eliminar la solicitud de “${toDelete?.name ?? ""}”? Se conservará únicamente como historial eliminado.`} confirmLabel="Eliminar solicitud" isLoading={isDeleting} onConfirm={() => void confirmDelete()} onCancel={() => setToDelete(null)} />
  </div>;
}

function StatusBadge({ status }: Readonly<{ status: InquiryStatus }>) {
  const styles: Record<InquiryStatus, string> = { NEW: "bg-blue-500/10 text-blue-400", CONTACTED: "bg-cyan-500/10 text-cyan-400", FOLLOW_UP: "bg-amber-500/10 text-amber-400", CONVERTED: "bg-emerald-500/10 text-emerald-400", CLOSED: "bg-muted text-muted-foreground" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{statuses.find((item) => item.value === status)?.label}</span>;
}
function Info({ icon: Icon, label, value }: Readonly<{ icon: typeof Mail; label: string; value: string }>) { return <div className="flex gap-3 rounded-xl border border-border bg-background p-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><div className="min-w-0"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
