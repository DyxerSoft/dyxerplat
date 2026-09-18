"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Inbox, Loader2, Trash2 } from "lucide-react";
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
  TableHead
} from "@/components/platform/crm-ui";
import { getErrorMessage, getSessionPermissions } from "@/lib/crm";
import { deleteLead, listLeads, updateLead } from "../services/lead-service";
import type { Lead, LeadFormValues, LeadStatus } from "../types/lead.types";

type Filters = {
  q: string;
  status: LeadStatus | "";
};

const statusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "Nuevo" },
  { value: "IN_CONTACT", label: "En contacto" },
  { value: "CLOSED_WON", label: "Cerrado ganado" },
  { value: "CLOSED_LOST", label: "Cerrado perdido" }
];

function statusLabel(status: LeadStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function statusTone(status: LeadStatus): "success" | "neutral" | "danger" | "warning" {
  if (status === "NEW") return "warning";
  if (status === "IN_CONTACT") return "neutral";
  if (status === "CLOSED_WON") return "success";
  return "danger";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-PA", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState<LeadStatus | "">("");
  const [filters, setFilters] = useState<Filters>({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadFormValues>({ status: "NEW", notes: "" });

  const permissions = useMemo(() => getSessionPermissions(), []);
  const canUpdate = permissions.includes(PERMISSIONS.LEADS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.LEADS_DELETE);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listLeads({
        q: filters.q,
        status: filters.status,
        page,
        pageSize: 10
      });

      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
        return;
      }

      setLeads(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters({ q: draftQ.trim(), status: draftStatus });
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      status: lead.status,
      notes: lead.notes ?? ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingLead) return;

    setIsSaving(true);
    try {
      await updateLead(editingLead.id, form);
      toast.success("Lead actualizado correctamente.");
      setIsModalOpen(false);
      await loadLeads();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Eliminar el lead de ${lead.fullName}?`)) {
      return;
    }

    try {
      await deleteLead(lead.id);
      toast.success("Lead eliminado correctamente.");
      await loadLeads();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        description="Mensajes del formulario de contacto y su seguimiento hasta el cierre."
      >
        <FilterBar onSubmit={handleSearch}>
          <SearchInput
            value={draftQ}
            onChange={setDraftQ}
            placeholder="Buscar por nombre, empresa, correo..."
          />
          <SelectField value={draftStatus} onChange={(value) => setDraftStatus(value as LeadStatus | "")}>
            <option value="">Todos los estados</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SecondaryButton type="submit">Filtrar</SecondaryButton>
        </FilterBar>
      </PageHeader>

      {leads.length === 0 && !isLoading ? (
        <EmptyPanel>
          <EmptyState
            icon={Inbox}
            title="Sin leads"
            description="Cuando alguien envie el formulario de contacto, aparecera aqui."
          />
        </EmptyPanel>
      ) : (
        <DataTable
          minWidth="1080px"
          footer={
            !isLoading && leads.length > 0 ? (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                total={total}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
              />
            ) : undefined
          }
        >
          <TableHead
            columns={[
              { label: "Contacto" },
              { label: "Servicio" },
              { label: "Estado" },
              { label: "Seguimiento" },
              { label: "Recibido" },
              { label: "Acciones", align: "right" }
            ]}
          />
          <tbody>
            {isLoading ? (
              <LoadingRow colSpan={6} label="Cargando leads..." />
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{lead.fullName}</div>
                    <div className="text-sm text-muted-foreground">{lead.companyName}</div>
                    <div className="text-xs text-muted-foreground">
                      {lead.email} · {lead.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{lead.serviceInterest}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={statusTone(lead.status)}>{statusLabel(lead.status)}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {lead.followedBy ? (
                      <div>
                        <p className="font-semibold">{lead.followedBy.fullName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(lead.updatedAt)}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canUpdate ? (
                        <ActionIconButton title="Gestionar lead" onClick={() => openEdit(lead)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canDelete ? (
                        <ActionIconButton title="Eliminar lead" danger onClick={() => void handleDelete(lead)}>
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

      {isModalOpen && editingLead ? (
        <Modal title="Gestionar lead" onClose={() => setIsModalOpen(false)}>
          <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">{editingLead.fullName}</p>
              <p className="text-muted-foreground">{editingLead.companyName}</p>
              {editingLead.position ? <p className="text-muted-foreground">{editingLead.position}</p> : null}
              <p className="mt-2 text-muted-foreground">
                {editingLead.email} · {editingLead.phone}
              </p>
              <p className="mt-2 font-medium text-foreground">{editingLead.serviceInterest}</p>
              <p className="mt-3 whitespace-pre-wrap text-foreground">{editingLead.message}</p>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <span>Recibido: {formatDate(editingLead.createdAt)}</span>
                <span>Contactado: {formatDate(editingLead.contactedAt)}</span>
                <span>Cerrado: {formatDate(editingLead.closedAt)}</span>
                <span>
                  Seguimiento:{" "}
                  {editingLead.followedBy
                    ? `${editingLead.followedBy.fullName} · ${formatDate(editingLead.updatedAt)}`
                    : "Sin asignar"}
                </span>
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-bold">Estado</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as LeadStatus })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-bold">Notas internas</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={4}
                placeholder="Seguimiento, acuerdos, siguientes pasos..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
