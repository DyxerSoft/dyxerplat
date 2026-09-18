"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Edit, Plus, Save, Search, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField } from "@/components/ui/SelectField";
import {
  createCompany,
  createContact,
  deleteCompany,
  deleteContact,
  listCompanies,
  listContacts,
  updateCompany,
  updateContact
} from "../services/company-service";
import type { Company, CompanyContact, CompanyFormValues, CompanyStatus, ContactFormValues } from "../types/company.types";

const emptyCompanyForm: CompanyFormValues = {
  name: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  status: "ACTIVE",
  notes: ""
};

const emptyContactForm: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  isPrimary: false,
  status: "ACTIVE",
  notes: ""
};

function getErrorMessage(error: unknown) {
  return getUserFacingErrorMessage(error);
}

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormValues>(emptyCompanyForm);
  const [contactsCompany, setContactsCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormValues>(emptyContactForm);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [contactToDelete, setContactToDelete] = useState<CompanyContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.COMPANIES_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.COMPANIES_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.COMPANIES_DELETE);
  const canCreateContact = permissions.includes(PERMISSIONS.CONTACTS_CREATE);
  const canReadContact = permissions.includes(PERMISSIONS.CONTACTS_READ);
  const canUpdateContact = permissions.includes(PERMISSIONS.CONTACTS_UPDATE);
  const canDeleteContact = permissions.includes(PERMISSIONS.CONTACTS_DELETE);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const result = await listCompanies({ q: debouncedQ, status, page, pageSize: 10 });
      setCompanies(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotalCompanies(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, [page, debouncedQ, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setDebouncedQ(q); }, 300);
    return () => window.clearTimeout(timeout);
  }, [q]);

  const openCreateCompany = () => {
    setEditingCompany(null);
    setCompanyForm(emptyCompanyForm);
    setIsCompanyModalOpen(true);
  };

  const openEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      legalName: company.legalName ?? "",
      taxId: company.taxId ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
      address: company.address ?? "",
      website: company.website ?? "",
      status: company.status,
      notes: company.notes ?? ""
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyForm);
        toast.success("Compañía actualizada correctamente.");
      } else {
        await createCompany(companyForm);
        toast.success("Compañía creada correctamente.");
      }
      setIsCompanyModalOpen(false);
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    setCompanyToDelete(company);
  };

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCompany(companyToDelete.id);
      toast.success("Compañía eliminada correctamente.");
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const openContacts = async (company: Company) => {
    setContactsCompany(company);
    setEditingContact(null);
    setContactForm(emptyContactForm);
    try {
      setContacts((await listContacts(company.id, { pageSize: 100 })).items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const refreshContacts = async () => {
    if (!contactsCompany) {
      return;
    }

    setContacts((await listContacts(contactsCompany.id, { pageSize: 100 })).items);
  };

  const openEditContact = (contact: CompanyContact) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      position: contact.position ?? "",
      isPrimary: contact.isPrimary,
      status: contact.status,
      notes: contact.notes ?? ""
    });
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setContactForm(emptyContactForm);
  };

  const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactsCompany) {
      return;
    }

    try {
      if (editingContact) {
        await updateContact(contactsCompany.id, editingContact.id, contactForm);
        toast.success("Contacto actualizado correctamente.");
      } else {
        await createContact(contactsCompany.id, contactForm);
        toast.success("Contacto creado correctamente.");
      }
      resetContactForm();
      await refreshContacts();
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteContact = async (contact: CompanyContact) => {
    if (!contactsCompany) return;
    setContactToDelete(contact);
  };

  const confirmDeleteContact = async () => {
    if (!contactsCompany || !contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteContact(contactsCompany.id, contactToDelete.id);
      toast.success("Contacto eliminado correctamente.");
      setContactToDelete(null);
      await refreshContacts();
      await loadCompanies();
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
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">CRM</p>
            <div className="mt-2 flex items-center gap-3"><h1 className="text-3xl font-black">Compañías</h1><span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{totalCompanies} registradas</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Gestiona compañías y sus encargados de contacto.</p>
          </div>
          {canCreate ? (
            <button
              type="button"
              onClick={openCreateCompany}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear compañía
            </button>
          ) : null}
        </div>

        <div className="mt-6 max-w-full overflow-x-auto pb-1"><div className="inline-flex w-max items-center gap-3">
          <div className="relative shrink-0" style={{ width: "500px", minWidth: "500px" }}>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              style={{ paddingLeft: "3rem", paddingRight: "1rem" }}
              className="h-11 w-full rounded-lg border border-secondary/30 bg-background text-base outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15"
              placeholder="Buscar por nombre, NIT, correo..."
            />
          </div>
          <SelectField
            ariaLabel="Filtrar compañías por estado"
            value={status}
            onValueChange={(value) => { setStatus(value as CompanyStatus | ""); setPage(1); }}
            options={[{ value: "", label: "Todos los estados" }, { value: "ACTIVE", label: "Activas" }, { value: "INACTIVE", label: "Inactivas" }]}
            className="h-11 w-[180px] bg-muted/60 shadow-none"
          />
        </div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Compañía</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Encargados</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Cargando compañías...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex w-full flex-col items-center justify-center text-center">
                      <Building2 className="mb-3 h-9 w-9 text-secondary" />
                      <p className="mx-auto font-bold">No hay compañías registradas</p>
                      <p className="mx-auto mt-1 text-muted-foreground">Crea la primera compañía para comenzar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-t border-border text-center transition-colors hover:bg-muted/35">
                    <td className="px-4 py-3 text-center">
                      <p className="font-bold text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.legalName || company.taxId || "Sin razon social"}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p>{company.email || "Sin correo"}</p>
                      <p className="text-xs text-muted-foreground">{company.phone || "Sin telefono"}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${company.status === "ACTIVE" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {company.status === "ACTIVE" ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{company.contactsCount}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {canReadContact ? <Link href={`/companies/${company.id}/contacts`} className="rounded-md border border-border p-2 hover:bg-muted" title="Gestionar contactos">
                          <UserRound className="h-4 w-4" />
                        </Link> : null}
                        {canUpdate ? (
                          <button type="button" onClick={() => openEditCompany(company)} className="rounded-md border border-border p-2 hover:bg-muted" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button type="button" onClick={() => handleDeleteCompany(company)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10" title="Eliminar">
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

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Pagina {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {isCompanyModalOpen ? (
        <Modal title={editingCompany ? "Editar compañía" : "Crear compañía"} subtitle={editingCompany ? "Actualiza la información comercial y de contacto." : "Registra la información principal de la empresa."} onClose={() => setIsCompanyModalOpen(false)}>
          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Nombre comercial" value={companyForm.name} onChange={(value) => setCompanyForm({ ...companyForm, name: value })} required placeholder="Ej. DYXERSOFT" />
            <TextField label="Razón social" value={companyForm.legalName} onChange={(value) => setCompanyForm({ ...companyForm, legalName: value })} placeholder="Ej. DYXERSOFT S.R.L." />
            <TextField label="NIT" value={companyForm.taxId} onChange={(value) => setCompanyForm({ ...companyForm, taxId: value })} placeholder="Identificador tributario" />
            <TextField label="Correo" type="email" value={companyForm.email} onChange={(value) => setCompanyForm({ ...companyForm, email: value })} placeholder="contacto@empresa.com" />
            <TextField label="Teléfono" value={companyForm.phone} onChange={(value) => setCompanyForm({ ...companyForm, phone: value })} placeholder="Ej. 70000000" />
            <TextField label="Sitio web" value={companyForm.website} onChange={(value) => setCompanyForm({ ...companyForm, website: value })} placeholder="https://empresa.com" />
            <TextField label="Dirección" value={companyForm.address} onChange={(value) => setCompanyForm({ ...companyForm, address: value })} className="md:col-span-2" placeholder="Dirección principal" />
            <div className="space-y-2">
              <span className="text-sm font-bold">Estado</span>
              <SelectField ariaLabel="Estado de la compañía" value={companyForm.status} onValueChange={(value) => setCompanyForm({ ...companyForm, status: value as CompanyStatus })} options={[{ value: "ACTIVE", label: "Activa" }, { value: "INACTIVE", label: "Inactiva" }]} className="h-11 w-full rounded-xl shadow-none" />
            </div>
            <TextField label="Notas" value={companyForm.notes} onChange={(value) => setCompanyForm({ ...companyForm, notes: value })} className="md:col-span-2" />
            <ModalActions onCancel={() => setIsCompanyModalOpen(false)} submitLabel={editingCompany ? "Guardar cambios" : "Crear compañía"} />
          </form>
        </Modal>
      ) : null}

      {contactsCompany ? (
        <Modal title={`Contactos de ${contactsCompany.name}`} onClose={() => setContactsCompany(null)} wide>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Contacto</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                        No hay contactos registrados.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-bold">
                            {contact.firstName} {contact.lastName}
                            {contact.isPrimary ? <span className="ml-2 rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary">Principal</span> : null}
                          </p>
                          <p className="text-xs text-muted-foreground">{contact.position || "Sin cargo"} · {contact.email || "Sin correo"}</p>
                        </td>
                        <td className="px-3 py-2">{contact.status === "ACTIVE" ? "Activo" : "Inactivo"}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            {canUpdateContact ? (
                              <button type="button" onClick={() => openEditContact(contact)} className="rounded-md border border-border p-2 hover:bg-muted">
                                <Edit className="h-4 w-4" />
                              </button>
                            ) : null}
                            {canDeleteContact ? (
                              <button type="button" onClick={() => handleDeleteContact(contact)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10">
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

            {(canCreateContact || editingContact) ? (
              <form onSubmit={handleSaveContact} className="space-y-3 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{editingContact ? "Editar contacto" : "Crear contacto"}</h3>
                  {editingContact ? (
                    <button type="button" onClick={resetContactForm} className="text-xs font-bold text-secondary">
                      Nuevo
                    </button>
                  ) : null}
                </div>
                <TextField label="Nombre *" value={contactForm.firstName} onChange={(value) => setContactForm({ ...contactForm, firstName: value })} required />
                <TextField label="Apellido *" value={contactForm.lastName} onChange={(value) => setContactForm({ ...contactForm, lastName: value })} required />
                <TextField label="Correo" type="email" value={contactForm.email} onChange={(value) => setContactForm({ ...contactForm, email: value })} />
                <TextField label="Telefono" value={contactForm.phone} onChange={(value) => setContactForm({ ...contactForm, phone: value })} />
                <TextField label="Cargo" value={contactForm.position} onChange={(value) => setContactForm({ ...contactForm, position: value })} />
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={contactForm.isPrimary} onChange={(event) => setContactForm({ ...contactForm, isPrimary: event.target.checked })} />
                  Contacto principal
                </label>
                <select value={contactForm.status} onChange={(event) => setContactForm({ ...contactForm, status: event.target.value as CompanyStatus })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
                <TextField label="Notas" value={contactForm.notes} onChange={(value) => setContactForm({ ...contactForm, notes: value })} />
                <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                  {editingContact ? "Guardar contacto" : "Crear contacto"}
                </button>
              </form>
            ) : null}
          </div>
        </Modal>
      ) : null}

      <ConfirmDialog
        open={Boolean(companyToDelete)}
        title="Eliminar compañía"
        description={`¿Deseas eliminar “${companyToDelete?.name ?? ""}”? La compañía y su información dejarán de aparecer en la gestión operativa.`}
        confirmLabel="Eliminar compañía"
        isLoading={isDeleting}
        onConfirm={() => void confirmDeleteCompany()}
        onCancel={() => setCompanyToDelete(null)}
      />

      <ConfirmDialog
        open={Boolean(contactToDelete)}
        title="Eliminar contacto"
        description={`¿Deseas eliminar a “${contactToDelete?.firstName ?? ""} ${contactToDelete?.lastName ?? ""}” de esta compañía?`}
        confirmLabel="Eliminar contacto"
        isLoading={isDeleting}
        onConfirm={() => void confirmDeleteContact()}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false
}: Readonly<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <section className={`max-h-[88dvh] w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <header className="flex items-center justify-between border-b border-border bg-muted/35 px-5 py-3">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="h-5 w-5" /></span><div><h2 className="text-lg font-black">{title}</h2>{subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}</div></div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Cerrar modal">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
  placeholder
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}>) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-bold">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
      />
    </label>
  );
}

function ModalActions({
  onCancel,
  submitLabel
}: Readonly<{
  onCancel: () => void;
  submitLabel: string;
}>) {
  return (
    <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4 md:col-span-2">
      <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-black hover:bg-muted">
        Cancelar
      </button>
      <button type="submit" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90">
        <Save className="mr-2 h-4 w-4" />{submitLabel}
      </button>
    </div>
  );
}
