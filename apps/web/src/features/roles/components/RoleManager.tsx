"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronDown, Edit, KeyRound, Plus, Save, Search, Shield, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { SelectField } from "@/components/ui/SelectField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createRole, deleteRole, listPermissions, listRolesPage, updateRole } from "../services/role-service";
import type { Permission, Role, RoleFormValues } from "../types/role.types";

const emptyForm: RoleFormValues = {
  name: "",
  code: "",
  description: "",
  permissionCodes: []
};

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<Permission[]>([]);
  const [q, setQ] = useState("");
  const [roleType, setRoleType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormValues>(emptyForm);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedQ, setDebouncedQ] = useState("");

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.ROLES_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.ROLES_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.ROLES_DELETE);
  const canLoadPermissions = permissions.includes(PERMISSIONS.ROLES_READ);

  const groupedPermissions = permissionsCatalog.reduce<Record<string, Permission[]>>((groups, permission) => {
    groups[permission.module] = groups[permission.module] ?? [];
    groups[permission.module].push(permission);
    return groups;
  }, {});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        listRolesPage({ q: debouncedQ, type: roleType, page, pageSize: 10 }),
        canLoadPermissions ? listPermissions() : Promise.resolve([] as Permission[])
      ]);
      setRoles(rolesResult.items);
      setTotal(rolesResult.pagination.total);
      setTotalPages(rolesResult.pagination.totalPages);
      setPermissionsCatalog(permissionsResult);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [canLoadPermissions, debouncedQ, roleType, page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedQ(q);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [q]);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm);
    setExpandedModules(new Set());
    setFormError("");
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
    setExpandedModules(new Set());
    setFormError("");
    setIsModalOpen(true);
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
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
    setFormError("");
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
      const message = getUserFacingErrorMessage(error, "No se pudo guardar el rol.");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async (role: Role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      toast.success("Rol eliminado correctamente.");
      setRoleToDelete(null);
      await loadData();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Seguridad</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black">Roles</h1>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{total} disponibles</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Administra perfiles de acceso y los permisos asociados.</p>
          </div>
          {canCreate ? (
            <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear rol
            </button>
          ) : null}
        </div>

        <div className="mt-6 max-w-full overflow-x-auto pb-1">
          <div className="inline-flex w-max flex-nowrap items-center gap-3">
            <div className="relative shrink-0" style={{ width: "500px", minWidth: "500px" }}>
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem", paddingRight: "1rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background text-base text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground hover:border-secondary/50 focus:border-secondary focus:bg-card focus:ring-4 focus:ring-secondary/15" placeholder="Nombre, código o descripción" />
            </div>
            <SelectField
              ariaLabel="Filtrar por tipo de rol"
              value={roleType}
              onValueChange={(value) => { setRoleType(value); setPage(1); }}
              options={[
                { value: "", label: "Todos los tipos" },
                { value: "SYSTEM", label: "Del sistema" },
                { value: "CUSTOM", label: "Personalizados" }
              ]}
              className="h-11 w-[180px] shrink-0 bg-muted/60 shadow-none"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Permisos</th>
                <th className="px-4 py-3">Usuarios</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Cargando roles...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex w-full flex-col items-center justify-center text-center">
                      <Shield className="mb-3 h-9 w-9 text-secondary" />
                      <p className="mx-auto font-bold">No hay roles para mostrar</p>
                      <p className="mx-auto mt-1 text-muted-foreground">Ajusta el filtro o crea un rol nuevo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="border-t border-border transition-colors hover:bg-muted/35">
                    <td className="px-4 py-3 text-center">
                      <p className="font-bold text-foreground">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.code}</p>
                    </td>
                    <td className="px-4 py-3 text-center">{role.permissions.length}</td>
                    <td className="px-4 py-3 text-center">{role.usersCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${role.isSystem ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {role.isSystem ? "Sistema" : "Personalizado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate ? (
                          <button type="button" onClick={() => openEdit(role)} className="rounded-md border border-border p-2 hover:bg-muted" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canDelete && !role.isSystem ? (
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
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Anterior</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-border px-3 py-1 font-bold disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="role-modal-title" className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:max-h-[calc(100vh-2rem)]">
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-muted/35 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  {editingRole ? <Edit className="h-4 w-4" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
                <div>
                  <h2 id="role-modal-title" className="text-lg font-black text-foreground">{editingRole ? "Editar rol" : "Crear rol"}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Define el perfil y los permisos que tendrá asignados.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Cerrar modal">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
                {formError ? (
                  <div role="alert" className="flex gap-3 rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div>
                      <p className="font-black">No se pudo guardar el rol</p>
                      <p className="mt-1 text-muted-foreground">{formError}</p>
                    </div>
                  </div>
                ) : null}
                <fieldset>
                  <legend className="mb-4 flex items-center gap-2 text-sm font-black text-foreground"><KeyRound className="h-4 w-4 text-secondary" />Información del rol</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField label="Nombre" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required placeholder="Ej. Supervisor" />
                    <TextField label="Código" value={form.code} onChange={(value) => setForm({ ...form, code: value })} required disabled={Boolean(editingRole?.isSystem)} placeholder="Ej. SUPERVISOR" />
                    <TextField label="Descripción" value={form.description} onChange={(value) => setForm({ ...form, description: value })} className="sm:col-span-2" placeholder="Describe el alcance de este rol" />
                  </div>
                </fieldset>

                <fieldset className="border-t border-border pt-5">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-black text-foreground"><ShieldCheck className="h-4 w-4 text-secondary" />Permisos</legend>
                  <p className="mb-4 text-xs text-muted-foreground">Selecciona las acciones permitidas para este perfil.</p>
                  <div className="space-y-2">
                    {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => {
                      const isExpanded = expandedModules.has(moduleName);
                      const selectedCount = modulePermissions.filter((permission) => form.permissionCodes.includes(permission.code)).length;

                      return (
                        <div key={moduleName} className="overflow-hidden rounded-xl border border-border bg-background/40">
                          <button
                            type="button"
                            onClick={() => toggleModule(moduleName)}
                            aria-expanded={isExpanded}
                            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-muted/50"
                          >
                            <span>
                              <span className="block text-sm font-black capitalize text-foreground">{moduleName}</span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {selectedCount} de {modulePermissions.length} permisos seleccionados
                              </span>
                            </span>
                            <ChevronDown className={`h-5 w-5 shrink-0 text-secondary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded ? (
                            <div className="grid gap-1 border-t border-border bg-card px-3 py-2 sm:grid-cols-2">
                              {modulePermissions.map((permission) => {
                                const isSelected = form.permissionCodes.includes(permission.code);
                                return (
                                  <label key={permission.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm outline-none transition focus-within:ring-4 focus-within:ring-secondary/15 ${isSelected ? "border-secondary/35 bg-secondary/10 text-foreground" : "border-transparent hover:border-border hover:bg-muted/50"}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => togglePermission(permission.code)} className="sr-only" />
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${isSelected ? "border-secondary bg-secondary text-secondary-foreground shadow-sm" : "border-border bg-background"}`} aria-hidden="true">
                                      {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
                                    </span>
                                    <span className="text-xs font-bold">{permission.code}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-black hover:bg-muted">Cancelar</button>
                <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" />{editingRole ? "Guardar cambios" : "Crear rol"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        title="Eliminar rol"
        description={`¿Deseas eliminar el rol “${roleToDelete?.name ?? ""}”? Se ocultará del sistema, pero se conservará su historial.`}
        confirmLabel="Eliminar rol"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  placeholder
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}>) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-bold text-foreground">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
