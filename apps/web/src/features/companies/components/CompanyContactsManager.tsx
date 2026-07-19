"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Edit, Plus, Search, Star, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField } from "@/components/ui/SelectField";
import { getStoredSession } from "@/features/auth/auth-service";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { createContact, deleteContact, getCompany, listContacts, updateContact } from "../services/company-service";
import type { Company, CompanyContact, CompanyStatus, ContactFormValues } from "../types/company.types";

const emptyForm: ContactFormValues = { firstName: "", lastName: "", email: "", phone: "", position: "", isPrimary: false, status: "ACTIVE", notes: "" };

export function CompanyContactsManager({ companyId }: Readonly<{ companyId: string }>) {
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyContact | null>(null);
  const [form, setForm] = useState<ContactFormValues>(emptyForm);
  const [toDelete, setToDelete] = useState<CompanyContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const permissions = useMemo(() => getStoredSession()?.user.permissions ?? [], []);
  const canCreate = permissions.includes(PERMISSIONS.CONTACTS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.CONTACTS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.CONTACTS_DELETE);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const result = await listContacts(companyId, { q: debouncedQ, status, page, pageSize: 10 });
      setContacts(result.items);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (error) { toast.error(getUserFacingErrorMessage(error)); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { getCompany(companyId).then(setCompany).catch((error) => toast.error(getUserFacingErrorMessage(error))); }, [companyId]);
  useEffect(() => { void loadContacts(); }, [companyId, debouncedQ, status, page]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setDebouncedQ(q); }, 300);
    return () => window.clearTimeout(timeout);
  }, [q]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (contact: CompanyContact) => {
    setEditing(contact);
    setForm({ firstName: contact.firstName, lastName: contact.lastName, email: contact.email ?? "", phone: contact.phone ?? "", position: contact.position ?? "", isPrimary: contact.isPrimary, status: contact.status, notes: contact.notes ?? "" });
    setIsModalOpen(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing) { await updateContact(companyId, editing.id, form); toast.success("Contacto actualizado correctamente."); }
      else { await createContact(companyId, form); toast.success("Contacto creado correctamente."); }
      setIsModalOpen(false);
      await loadContacts();
    } catch (error) { toast.error(getUserFacingErrorMessage(error)); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try { await deleteContact(companyId, toDelete.id); setToDelete(null); toast.success("Contacto eliminado correctamente."); await loadContacts(); }
    catch (error) { toast.error(getUserFacingErrorMessage(error)); }
    finally { setIsDeleting(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/companies" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"><ArrowLeft className="h-4 w-4" />Volver a compañías</Link>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">CRM · Contactos</p>
          <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black">{company?.name ?? "Contactos"}</h1><span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{total} encargados</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Administra las personas encargadas y define un contacto principal.</p>
        </div>
        {canCreate ? <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Crear contacto</button> : null}
      </div>
      <div className="mt-6 max-w-full overflow-x-auto pb-1"><div className="inline-flex w-max items-center gap-3">
        <div className="relative shrink-0" style={{ width: "500px", minWidth: "500px" }}><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem", paddingRight: "1rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background text-base outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15" placeholder="Nombre, correo o cargo" /></div>
        <SelectField ariaLabel="Filtrar contactos por estado" value={status} onValueChange={(value) => { setStatus(value as CompanyStatus | ""); setPage(1); }} options={[{ value: "", label: "Todos los estados" }, { value: "ACTIVE", label: "Activos" }, { value: "INACTIVE", label: "Inactivos" }]} className="h-11 w-[180px] bg-muted/60 shadow-none" />
      </div></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Cargo</th><th className="px-4 py-3">Comunicación</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead>
        <tbody>{isLoading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Cargando contactos...</td></tr> : contacts.length === 0 ? <tr><td colSpan={5} className="px-4 py-12"><div className="flex flex-col items-center text-center"><UserRound className="mb-3 h-9 w-9 text-secondary" /><p className="font-bold">No hay contactos para mostrar</p><p className="mt-1 text-muted-foreground">Registra al primer encargado de esta compañía.</p></div></td></tr> : contacts.map((contact) => <tr key={contact.id} className="border-t border-border text-center hover:bg-muted/35">
          <td className="px-4 py-3"><p className="font-bold">{contact.firstName} {contact.lastName}</p>{contact.isPrimary ? <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary"><Star className="h-3 w-3" />Principal</span> : null}</td>
          <td className="px-4 py-3">{contact.position || "Sin cargo"}</td><td className="px-4 py-3"><p>{contact.email || "Sin correo"}</p><p className="text-xs text-muted-foreground">{contact.phone || "Sin teléfono"}</p></td>
          <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${contact.status === "ACTIVE" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>{contact.status === "ACTIVE" ? "Activo" : "Inactivo"}</span></td>
          <td className="px-4 py-3"><div className="flex justify-center gap-2">{canUpdate ? <button onClick={() => openEdit(contact)} className="rounded-md border border-border p-2 hover:bg-muted"><Edit className="h-4 w-4" /></button> : null}{canDelete ? <button onClick={() => setToDelete(contact)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button> : null}</div></td>
        </tr>)}</tbody>
      </table></div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm"><span className="text-muted-foreground">Pagina {page} de {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button></div></div>
    </section>

    {isModalOpen ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"><section className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"><header className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><UserRound className="h-5 w-5" /></span><div><h2 className="text-lg font-black">{editing ? "Editar contacto" : "Crear contacto"}</h2><p className="text-xs text-muted-foreground">Información del encargado de {company?.name}.</p></div></div><button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground"><X className="h-5 w-5" /></button></header>
      <form onSubmit={save} className="flex min-h-0 flex-1 flex-col overflow-hidden"><div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2"><Field label="Nombre" required value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} /><Field label="Apellido" required value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} /><Field label="Correo" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><Field label="Teléfono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><Field label="Cargo" value={form.position} onChange={(value) => setForm({ ...form, position: value })} /><div className="space-y-2"><span className="text-sm font-bold">Estado</span><SelectField ariaLabel="Estado del contacto" value={form.status} onValueChange={(value) => setForm({ ...form, status: value as CompanyStatus })} options={[{ value: "ACTIVE", label: "Activo" }, { value: "INACTIVE", label: "Inactivo" }]} className="h-11" /></div><Field label="Notas" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} className="sm:col-span-2" /><div className={`flex items-center justify-between gap-4 rounded-xl border p-3 transition sm:col-span-2 ${form.isPrimary ? "border-secondary/40 bg-secondary/10" : "border-border bg-background"}`}><span><span className="block text-sm font-bold">Contacto principal</span><span className="text-xs text-muted-foreground">Será el encargado prioritario de la compañía.</span></span><button type="button" role="switch" aria-checked={form.isPrimary} aria-label="Marcar como contacto principal" onClick={() => setForm({ ...form, isPrimary: !form.isPrimary })} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-4 focus:ring-secondary/15 ${form.isPrimary ? "border-secondary bg-secondary" : "border-border bg-muted"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isPrimary ? "translate-x-5" : "translate-x-0.5"}`} /></button></div></div><div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3"><button type="button" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border border-border px-5 font-bold">Cancelar</button><button type="submit" className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground">{editing ? "Guardar cambios" : "Crear contacto"}</button></div></form>
    </section></div> : null}
    <ConfirmDialog open={Boolean(toDelete)} title="Eliminar contacto" description={`¿Deseas eliminar a “${toDelete?.firstName ?? ""} ${toDelete?.lastName ?? ""}”? Se conservará su historial.`} confirmLabel="Eliminar contacto" isLoading={isDeleting} onConfirm={() => void confirmDelete()} onCancel={() => setToDelete(null)} />
  </div>;
}

function Field({ label, value, onChange, required = false, type = "text", className = "" }: Readonly<{ label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; className?: string }>) {
  return <label className={`block space-y-2 ${className}`}><span className="text-sm font-bold">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</span><input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10" /></label>;
}
