"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, Edit, Plus, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@dyxerplat/shared";
import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
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
  return error instanceof ApiClientError ? error.message : "No se pudo completar la accion.";
}

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormValues>(emptyCompanyForm);
  const [contactsCompany, setContactsCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormValues>(emptyContactForm);

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
  const canUpdateContact = permissions.includes(PERMISSIONS.CONTACTS_UPDATE);
  const canDeleteContact = permissions.includes(PERMISSIONS.CONTACTS_DELETE);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const result = await listCompanies({ q, status, page, pageSize: 10 });
      setCompanies(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, [page]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadCompanies();
  };

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
        toast.success("Compania actualizada correctamente.");
      } else {
        await createCompany(companyForm);
        toast.success("Compania creada correctamente.");
      }
      setIsCompanyModalOpen(false);
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!window.confirm(`Eliminar la compania ${company.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deleteCompany(company.id);
      toast.success("Compania eliminada correctamente.");
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openContacts = async (company: Company) => {
    setContactsCompany(company);
    setEditingContact(null);
    setContactForm(emptyContactForm);
    try {
      setContacts(await listContacts(company.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const refreshContacts = async () => {
    if (!contactsCompany) {
      return;
    }

    setContacts(await listContacts(contactsCompany.id));
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
    if (!contactsCompany || !window.confirm(`Eliminar el contacto ${contact.firstName} ${contact.lastName}?`)) {
      return;
    }

    try {
      await deleteContact(contactsCompany.id, contact.id);
      toast.success("Contacto eliminado correctamente.");
      await refreshContacts();
      await loadCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">CRM</p>
            <h1 className="mt-2 text-3xl font-black">Companias</h1>
            <p className="mt-2 text-sm text-muted-foreground">Gestiona companias y sus encargados de contacto.</p>
          </div>
          {canCreate ? (
            <button
              type="button"
              onClick={openCreateCompany}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear compania
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Buscar por nombre, NIT, correo..."
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as CompanyStatus | "")}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
          <button type="submit" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">
            Filtrar
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Compania</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Encargados</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Cargando companias...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Building2 className="mx-auto mb-3 h-8 w-8 text-secondary" />
                    <p className="font-bold">No hay companias registradas</p>
                    <p className="mt-1 text-muted-foreground">Crea la primera compania para comenzar.</p>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.legalName || company.taxId || "Sin razon social"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{company.email || "Sin correo"}</p>
                      <p className="text-xs text-muted-foreground">{company.phone || "Sin telefono"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${company.status === "ACTIVE" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {company.status === "ACTIVE" ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{company.contactsCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openContacts(company)} className="rounded-md border border-border p-2 hover:bg-muted" title="Contactos">
                          <UserRound className="h-4 w-4" />
                        </button>
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
        <Modal title={editingCompany ? "Editar compania" : "Crear compania"} onClose={() => setIsCompanyModalOpen(false)}>
          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Nombre *" value={companyForm.name} onChange={(value) => setCompanyForm({ ...companyForm, name: value })} required />
            <TextField label="Razon social" value={companyForm.legalName} onChange={(value) => setCompanyForm({ ...companyForm, legalName: value })} />
            <TextField label="NIT / Tax ID" value={companyForm.taxId} onChange={(value) => setCompanyForm({ ...companyForm, taxId: value })} />
            <TextField label="Correo" type="email" value={companyForm.email} onChange={(value) => setCompanyForm({ ...companyForm, email: value })} />
            <TextField label="Telefono" value={companyForm.phone} onChange={(value) => setCompanyForm({ ...companyForm, phone: value })} />
            <TextField label="Sitio web" value={companyForm.website} onChange={(value) => setCompanyForm({ ...companyForm, website: value })} />
            <TextField label="Direccion" value={companyForm.address} onChange={(value) => setCompanyForm({ ...companyForm, address: value })} className="md:col-span-2" />
            <label className="space-y-1">
              <span className="text-sm font-bold">Estado</span>
              <select value={companyForm.status} onChange={(event) => setCompanyForm({ ...companyForm, status: event.target.value as CompanyStatus })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </label>
            <TextField label="Notas" value={companyForm.notes} onChange={(value) => setCompanyForm({ ...companyForm, notes: value })} className="md:col-span-2" />
            <ModalActions onCancel={() => setIsCompanyModalOpen(false)} submitLabel={editingCompany ? "Guardar cambios" : "Crear compania"} />
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
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false
}: Readonly<{
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <section className={`max-h-[90vh] w-full overflow-y-auto rounded-lg border border-border bg-card shadow-xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-1 text-sm font-bold hover:bg-muted">
            Cerrar
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
  className = ""
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}>) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className="text-sm font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
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
    <div className="flex justify-end gap-2 md:col-span-2">
      <button type="button" onClick={onCancel} className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted">
        Cancelar
      </button>
      <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
        {submitLabel}
      </button>
    </div>
  );
}
