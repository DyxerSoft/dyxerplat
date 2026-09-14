"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, Trash2, Users } from "lucide-react";
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
import { listRoles } from "@/features/roles/services/role-service";
import type { Role } from "@/features/roles/types/role.types";
import { createUser, deleteUser, listUsers, updateUser } from "../services/user-service";
import type { User, UserFormValues, UserStatus } from "../types/user.types";

const emptyForm: UserFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  documentNumber: "",
  position: "",
  status: "ACTIVE",
  roleIds: []
};

type Filters = {
  q: string;
  status: UserStatus | "";
};

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState<UserStatus | "">("");
  const [filters, setFilters] = useState<Filters>({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormValues>(emptyForm);

  const permissions = useMemo(() => getSessionPermissions(), []);
  const canCreate = permissions.includes(PERMISSIONS.USERS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.USERS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.USERS_DELETE);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listUsers({
        q: filters.q,
        status: filters.status,
        page,
        pageSize: 10
      });

      if (result.items.length === 0 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
        return;
      }

      setUsers(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void listRoles()
      .then(setRoles)
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters({ q: draftQ.trim(), status: draftStatus });
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
      documentNumber: user.documentNumber ?? "",
      position: user.position ?? "",
      status: user.status,
      roleIds: user.roles.map((role) => role.id)
    });
    setIsModalOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId]
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await createUser(form);
        toast.success("Usuario creado correctamente.");
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Eliminar el usuario ${user.email}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.success("Usuario eliminado correctamente.");
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Seguridad"
        title="Usuarios"
        description="Gestiona usuarios internos, datos de empleado y roles asignados."
        actions={
          canCreate ? (
            <PrimaryButton onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear usuario
            </PrimaryButton>
          ) : null
        }
      >
        <FilterBar onSubmit={handleSearch}>
          <SearchInput value={draftQ} onChange={setDraftQ} placeholder="Buscar por nombre, correo o documento..." />
          <SelectField value={draftStatus} onChange={(value) => setDraftStatus(value as UserStatus | "")}>
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="BLOCKED">Bloqueados</option>
          </SelectField>
          <SecondaryButton type="submit">Filtrar</SecondaryButton>
        </FilterBar>
      </PageHeader>

      {!isLoading && users.length === 0 ? (
        <EmptyPanel>
          <EmptyState
            icon={Users}
            title={filters.q || filters.status ? "Sin resultados" : "No hay usuarios registrados"}
            description={
              filters.q || filters.status
                ? "Prueba con otros filtros o limpia la busqueda."
                : "Crea usuarios internos para operar la plataforma."
            }
            action={
              canCreate && !filters.q && !filters.status ? (
                <PrimaryButton onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear usuario
                </PrimaryButton>
              ) : null
            }
          />
        </EmptyPanel>
      ) : (
        <DataTable
          minWidth="980px"
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
              { label: "Usuario" },
              { label: "Empleado" },
              { label: "Estado" },
              { label: "Roles" },
              { label: "Acciones", align: "right" }
            ]}
          />
          <tbody>
            {isLoading ? (
              <LoadingRow colSpan={5} label="Cargando usuarios..." />
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{user.position || "Sin cargo"}</p>
                    <p className="text-xs text-muted-foreground">{user.documentNumber || user.phone || "Sin documento"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={statusTone(user.status)}>{statusLabel(user.status)}</StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span key={role.id} className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canUpdate ? (
                        <ActionIconButton title="Editar" onClick={() => openEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canDelete ? (
                        <ActionIconButton title="Eliminar" danger onClick={() => void handleDelete(user)}>
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
        <Modal title={editingUser ? "Editar usuario" : "Crear usuario"} onClose={() => setIsModalOpen(false)} wide>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField label="Nombre *" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} required />
              <TextField label="Apellido *" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} required />
              <TextField label="Correo *" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
              <TextField
                label={editingUser ? "Nueva contrasena" : "Contrasena *"}
                type="password"
                value={form.password}
                onChange={(value) => setForm({ ...form, password: value })}
                required={!editingUser}
              />
              <TextField label="Telefono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <TextField label="Documento" value={form.documentNumber} onChange={(value) => setForm({ ...form, documentNumber: value })} />
              <TextField label="Cargo" value={form.position} onChange={(value) => setForm({ ...form, position: value })} />
              <label className="space-y-1">
                <span className="text-sm font-bold">Estado</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold">Roles</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                    <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} className="mt-1" />
                    <span>
                      <span className="block font-bold">{role.name}</span>
                      <span className="block text-xs text-muted-foreground">{role.code}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingUser ? "Guardar cambios" : "Crear usuario"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function statusLabel(status: UserStatus) {
  const labels: Record<UserStatus, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    BLOCKED: "Bloqueado"
  };
  return labels[status];
}

function statusTone(status: UserStatus): "success" | "neutral" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "BLOCKED") return "danger";
  return "neutral";
}
