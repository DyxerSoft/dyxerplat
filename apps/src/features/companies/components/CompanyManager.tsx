"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Edit, Loader2, Plus, Trash2, UserRound } from "lucide-react";
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
  createCompany,
  createContact,
  deleteCompany,
  deleteContact,
  listCompanies,
  listContacts,
  updateCompany,
  updateContact
} from "../services/company-service";
import type { Company, CompanyContact, CompanyFormValues, CompanyStatus, ContactFormValues, PaginatedCompanies } from "../types/company.types";

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

type Filters = {
  q: string;
  status: CompanyStatus | "";
};

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState<CompanyStatus | "">("");
  const [filters, setFilters] = useState<Filters>({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormValues>(emptyCompanyForm);
  const [contactsCompany, setContactsCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormValues>(emptyContactForm);

  const permissions = useMemo(() => getSessionPermissions(), []);
  const canCreate = permissions.includes(PERMISSIONS.COMPANIES_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.COMPANIES_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.COMPANIES_DELETE);
  const canCreateContact = permissions.includes(PERMISSIONS.CONTACTS_CREATE);
  const canUpdateContact = permissions.includes(PERMISSIONS.CONTACTS_UPDATE);
  const canDeleteContact = permissions.includes(PERMISSIONS.CONTACTS_DELETE);

  const loadCompanies = useCallback(async (options?: { silent?: boolean; bustCache?: boolean }) => {
    const cacheKey = `companies:q=${filters.q}:status=${filters.status}:page=${page}`;

    if (options?.bustCache) {
      invalidateListCache("companies:");
    }

    const cached = readListCache<PaginatedCompanies>(cacheKey);

    if (cached) {
      setCompanies(cached.items);
      setTotalPages(cached.pagination.totalPages);
      setTotal(cached.pagination.total);
      setIsLoading(false);
    } else if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const result = await listCompanies({
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
      setCompanies(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters({
      q: draftQ.trim(),
      status: draftStatus
    });
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
    setIsSaving(true);
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyForm);
        toast.success("Compania actualizada correctamente.");
      } else {
        await createCompany(companyForm);
        toast.success("Compania creada correctamente.");
      }
      setIsCompanyModalOpen(false);
      await loadCompanies({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!window.confirm(`Eliminar la compania ${company.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deleteCompany(company.id);
      toast.success("Compania eliminada correctamente.");
      await loadCompanies({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openContacts = async (company: Company) => {
    setContactsCompany(company);
    setEditingContact(null);
    setContactForm(emptyContactForm);
    setIsContactsLoading(true);
    try {
      setContacts(await listContacts(company.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsContactsLoading(false);
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

    setIsSaving(true);
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
      await loadCompanies({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
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
      await loadCompanies({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="CRM"
        title="Companias"
        description="Gestiona companias y sus encargados de contacto."
        actions={
          canCreate ? (
            <PrimaryButton onClick={openCreateCompany}>
              <Plus className="mr-2 h-4 w-4" />
              Crear compania
            </PrimaryButton>
          ) : null
        }
      >
        <FilterBar onSubmit={handleSearch}>
          <SearchInput
            value={draftQ}
            onChange={setDraftQ}
            placeholder="Buscar por nombre, NIT, correo..."
          />
          <SelectField value={draftStatus} onChange={(value) => setDraftStatus(value as CompanyStatus | "")}>
            <option value="">Todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </SelectField>
          <SecondaryButton type="submit">Filtrar</SecondaryButton>
        </FilterBar>
      </PageHeader>

      {!isLoading && companies.length === 0 ? (
        <EmptyPanel>
          <EmptyState
            icon={Building2}
            title={filters.q || filters.status ? "Sin resultados" : "No hay companias registradas"}
            description={
              filters.q || filters.status
                ? "Prueba con otros filtros o limpia la busqueda."
                : "Crea la primera compania para comenzar."
            }
            action={
              canCreate && !filters.q && !filters.status ? (
                <PrimaryButton onClick={openCreateCompany}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear compania
                </PrimaryButton>
              ) : null
            }
          />
        </EmptyPanel>
      ) : (
        <DataTable
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
              { label: "Compania" },
              { label: "Contacto" },
              { label: "Estado" },
              { label: "Encargados" },
              { label: "Acciones", align: "right" }
            ]}
          />
          <tbody>
            {isLoading ? (
              <LoadingRow colSpan={5} label="Cargando companias..." />
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.legalName || company.taxId || "Sin razon social"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{company.email || "Sin correo"}</p>
                    <p className="text-xs text-muted-foreground">{company.phone || "Sin telefono"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={company.status === "ACTIVE" ? "success" : "neutral"}>
                      {company.status === "ACTIVE" ? "Activa" : "Inactiva"}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 font-semibold">{company.contactsCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <ActionIconButton title="Contactos" onClick={() => void openContacts(company)}>
                        <UserRound className="h-4 w-4" />
                      </ActionIconButton>
                      {canUpdate ? (
                        <ActionIconButton title="Editar" onClick={() => openEditCompany(company)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canDelete ? (
                        <ActionIconButton title="Eliminar" danger onClick={() => void handleDeleteCompany(company)}>
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

      {isCompanyModalOpen ? (
        <Modal title={editingCompany ? "Editar compania" : "Crear compania"} onClose={() => setIsCompanyModalOpen(false)}>
          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Nombre *" value={companyForm.name} onChange={(value) => setCompanyForm({ ...companyForm, name: value })} required />
            <TextField label="Razon social" value={companyForm.legalName} onChange={(value) => setCompanyForm({ ...companyForm, legalName: value })} />
            <TextField label="NIT / Tax ID" value={companyForm.taxId} onChange={(value) => setCompanyForm({ ...companyForm, taxId: value })} />
            <TextField label="Correo" type="email" value={companyForm.email} onChange={(value) => setCompanyForm({ ...companyForm, email: value })} />
            <TextField label="Telefono" value={companyForm.phone} onChange={(value) => setCompanyForm({ ...companyForm, phone: value })} />
            <TextField label="Sitio web" value={companyForm.website} onChange={(value) => setCompanyForm({ ...companyForm, website: value })} placeholder="https://" />
            <TextField label="Direccion" value={companyForm.address} onChange={(value) => setCompanyForm({ ...companyForm, address: value })} className="md:col-span-2" />
            <label className="space-y-1">
              <span className="text-sm font-bold">Estado</span>
              <select
                value={companyForm.status}
                onChange={(event) => setCompanyForm({ ...companyForm, status: event.target.value as CompanyStatus })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </label>
            <TextField label="Notas" value={companyForm.notes} onChange={(value) => setCompanyForm({ ...companyForm, notes: value })} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2">
              <SecondaryButton onClick={() => setIsCompanyModalOpen(false)} disabled={isSaving}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingCompany ? "Guardar cambios" : "Crear compania"}
              </PrimaryButton>
            </div>
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
                  {isContactsLoading ? (
                    <LoadingRow colSpan={3} label="Cargando contactos..." />
                  ) : contacts.length === 0 ? (
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
                            {contact.isPrimary ? (
                              <span className="ml-2 rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary">Principal</span>
                            ) : null}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.position || "Sin cargo"} · {contact.email || "Sin correo"}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <StatusPill tone={contact.status === "ACTIVE" ? "success" : "neutral"}>
                            {contact.status === "ACTIVE" ? "Activo" : "Inactivo"}
                          </StatusPill>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            {canUpdateContact ? (
                              <ActionIconButton title="Editar" onClick={() => openEditContact(contact)}>
                                <Edit className="h-4 w-4" />
                              </ActionIconButton>
                            ) : null}
                            {canDeleteContact ? (
                              <ActionIconButton title="Eliminar" danger onClick={() => void handleDeleteContact(contact)}>
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

            {canCreateContact || editingContact ? (
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
                  <input
                    type="checkbox"
                    checked={contactForm.isPrimary}
                    onChange={(event) => setContactForm({ ...contactForm, isPrimary: event.target.checked })}
                  />
                  Contacto principal
                </label>
                <select
                  value={contactForm.status}
                  onChange={(event) => setContactForm({ ...contactForm, status: event.target.value as CompanyStatus })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
                <TextField label="Notas" value={contactForm.notes} onChange={(value) => setContactForm({ ...contactForm, notes: value })} />
                <PrimaryButton type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingContact ? "Guardar contacto" : "Crear contacto"}
                </PrimaryButton>
              </form>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
