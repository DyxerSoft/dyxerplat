"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
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

function getErrorMessage(error: unknown) {
  return error instanceof ApiClientError ? error.message : "No se pudo completar la accion.";
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormValues>(emptyForm);

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.USERS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.USERS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.USERS_DELETE);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await listUsers({ q, status, page, pageSize: 10 });
      setUsers(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRoles(await listRoles());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [page]);

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadUsers();
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
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Seguridad</p>
            <h1 className="mt-2 text-3xl font-black">Usuarios</h1>
            <p className="mt-2 text-sm text-muted-foreground">Gestiona usuarios internos, datos de empleado y roles asignados.</p>
          </div>
          {canCreate ? (
            <button type="button" onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear usuario
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSearch} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(event) => setQ(event.target.value)} className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20" placeholder="Buscar por nombre, correo o documento..." />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as UserStatus | "")} className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20">
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="BLOCKED">Bloqueados</option>
          </select>
          <button type="submit" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">Filtrar</button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Cargando usuarios...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-secondary" />
                    <p className="font-bold">No hay usuarios registrados</p>
                    <p className="mt-1 text-muted-foreground">Crea usuarios internos para operar la plataforma.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{user.position || "Sin cargo"}</p>
                      <p className="text-xs text-muted-foreground">{user.documentNumber || user.phone || "Sin documento"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(user.status)}`}>
                        {statusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? user.roles.map((role) => (
                          <span key={role.id} className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">{role.name}</span>
                        )) : <span className="text-xs text-muted-foreground">Sin roles</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canUpdate ? (
                          <button type="button" onClick={() => openEdit(user)} className="rounded-md border border-border p-2 hover:bg-muted" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button type="button" onClick={() => handleDelete(user)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10" title="Eliminar">
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
          <span className="text-muted-foreground">Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xl font-black">{editingUser ? "Editar usuario" : "Crear usuario"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-3 py-1 text-sm font-bold hover:bg-muted">Cerrar</button>
            </header>
            <form onSubmit={handleSave} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField label="Nombre *" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} required />
                <TextField label="Apellido *" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} required />
                <TextField label="Correo *" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
                <TextField label={editingUser ? "Nueva contrasena" : "Contrasena *"} type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required={!editingUser} />
                <TextField label="Telefono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                <TextField label="Documento" value={form.documentNumber} onChange={(value) => setForm({ ...form, documentNumber: value })} />
                <TextField label="Cargo" value={form.position} onChange={(value) => setForm({ ...form, position: value })} />
                <label className="space-y-1">
                  <span className="text-sm font-bold">Estado</span>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20">
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">{editingUser ? "Guardar cambios" : "Crear usuario"}</button>
              </div>
            </form>
          </section>
        </div>
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

function statusClass(status: UserStatus) {
  const classes: Record<UserStatus, string> = {
    ACTIVE: "bg-secondary/10 text-secondary",
    INACTIVE: "bg-muted text-muted-foreground",
    BLOCKED: "bg-destructive/10 text-destructive"
  };
  return classes[status];
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}>) {
  return (
    <label className="space-y-1">
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
