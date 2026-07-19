"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { createRole, deleteRole, listPermissions, listRoles, updateRole } from "../services/role-service";
import type { Permission, Role, RoleFormValues } from "../types/role.types";

const emptyForm: RoleFormValues = {
  name: "",
  code: "",
  description: "",
  permissionCodes: []
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiClientError ? error.message : "No se pudo completar la accion.";
}

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<Permission[]>([]);
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormValues>(emptyForm);

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canManage = permissions.includes(PERMISSIONS.ROLES_MANAGE);

  const filteredRoles = roles.filter((role) => {
    const value = q.trim().toLowerCase();
    if (!value) {
      return true;
    }

    return [role.name, role.code, role.description ?? ""].some((field) => field.toLowerCase().includes(value));
  });

  const groupedPermissions = permissionsCatalog.reduce<Record<string, Permission[]>>((groups, permission) => {
    groups[permission.module] = groups[permission.module] ?? [];
    groups[permission.module].push(permission);
    return groups;
  }, {});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        listRoles(),
        canManage ? listPermissions() : Promise.resolve([] as Permission[])
      ]);
      setRoles(rolesResult);
      setPermissionsCatalog(permissionsResult);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [canManage]);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      code: role.code,
      description: role.description ?? "",
      permissionCodes: role.permissions
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permissionCode: string) => {
    setForm((current) => ({
      ...current,
      permissionCodes: current.permissionCodes.includes(permissionCode)
        ? current.permissionCodes.filter((code) => code !== permissionCode)
        : [...current.permissionCodes, permissionCode]
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, form);
        toast.success("Rol actualizado correctamente.");
      } else {
        await createRole(form);
        toast.success("Rol creado correctamente.");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Eliminar el rol ${role.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deleteRole(role.id);
      toast.success("Rol eliminado correctamente.");
      await loadData();
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
            <h1 className="mt-2 text-3xl font-black">Roles</h1>
            <p className="mt-2 text-sm text-muted-foreground">Administra perfiles de acceso y sus permisos.</p>
          </div>
          {canManage ? (
            <button type="button" onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear rol
            </button>
          ) : null}
        </div>

        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(event) => setQ(event.target.value)} className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20" placeholder="Buscar por nombre o codigo..." />
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Permisos</th>
                <th className="px-4 py-3">Usuarios</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Cargando roles...</td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Shield className="mx-auto mb-3 h-8 w-8 text-secondary" />
                    <p className="font-bold">No hay roles para mostrar</p>
                    <p className="mt-1 text-muted-foreground">Ajusta el filtro o crea un rol nuevo.</p>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.code}</p>
                    </td>
                    <td className="px-4 py-3">{role.permissions.length}</td>
                    <td className="px-4 py-3">{role.usersCount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${role.isSystem ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {role.isSystem ? "Sistema" : "Personalizado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <button type="button" onClick={() => openEdit(role)} className="rounded-md border border-border p-2 hover:bg-muted" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canManage && !role.isSystem ? (
                          <button type="button" onClick={() => handleDelete(role)} className="rounded-md border border-border p-2 text-destructive hover:bg-destructive/10" title="Eliminar">
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
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xl font-black">{editingRole ? "Editar rol" : "Crear rol"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-3 py-1 text-sm font-bold hover:bg-muted">Cerrar</button>
            </header>
            <form onSubmit={handleSave} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextField label="Nombre *" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
                <TextField label="Codigo *" value={form.code} onChange={(value) => setForm({ ...form, code: value })} required disabled={Boolean(editingRole?.isSystem)} />
                <TextField label="Descripcion" value={form.description} onChange={(value) => setForm({ ...form, description: value })} className="md:col-span-2" />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold">Permisos</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                    <div key={moduleName} className="rounded-lg border border-border p-4">
                      <p className="mb-3 text-sm font-black capitalize">{moduleName}</p>
                      <div className="space-y-2">
                        {modulePermissions.map((permission) => (
                          <label key={permission.id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.permissionCodes.includes(permission.code)} onChange={() => togglePermission(permission.code)} />
                            <span>{permission.code}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">{editingRole ? "Guardar cambios" : "Crear rol"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className = ""
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className="text-sm font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
