"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, Search, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS, ROLE_CODES } from "@dyxerplat/shared";
import {
  ActionIconButton,
  DataTable,
  EmptyState,
  EmptyPanel,
  LoadingRow,
  Modal,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
  TableHead,
  TextField
} from "@/components/platform/crm-ui";
import { getErrorMessage, getSessionPermissions } from "@/lib/crm";
import { invalidateListCache, readListCache, writeListCache } from "@/lib/list-cache";
import { createRole, deleteRole, listPermissions, listRoles, updateRole } from "../services/role-service";
import type { Permission, Role, RoleFormValues } from "../types/role.types";

type RolesCache = {
  roles: Role[];
  permissions: Permission[];
};

const emptyForm: RoleFormValues = {
  name: "",
  code: "",
  description: "",
  permissionCodes: [],
  grantAllPermissions: false
};

type RoleTemplate = "custom" | "admin";

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<Permission[]>([]);
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormValues>(emptyForm);
  const [roleTemplate, setRoleTemplate] = useState<RoleTemplate>("custom");

  const permissions = useMemo(() => getSessionPermissions(), []);
  const canManage = permissions.includes(PERMISSIONS.ROLES_MANAGE);

  const filteredRoles = useMemo(() => {
    const value = q.trim().toLowerCase();
    if (!value) {
      return roles;
    }

    return roles.filter((role) =>
      [role.name, role.code, role.description ?? ""].some((field) => field.toLowerCase().includes(value))
    );
  }, [q, roles]);

  const groupedPermissions = useMemo(
    () =>
      permissionsCatalog.reduce<Record<string, Permission[]>>((groups, permission) => {
        groups[permission.module] = groups[permission.module] ?? [];
        groups[permission.module].push(permission);
        return groups;
      }, {}),
    [permissionsCatalog]
  );

  const loadData = useCallback(async (options?: { silent?: boolean; bustCache?: boolean }) => {
    const cacheKey = `roles:manage=${canManage ? "1" : "0"}`;

    if (options?.bustCache) {
      invalidateListCache("roles:");
    }

    const cached = readListCache<RolesCache>(cacheKey);

    if (cached) {
      setRoles(cached.roles);
      setPermissionsCatalog(cached.permissions);
      setIsLoading(false);
    } else if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        listRoles(),
        canManage ? listPermissions() : Promise.resolve([] as Permission[])
      ]);
      writeListCache(cacheKey, { roles: rolesResult, permissions: permissionsResult });
      setRoles(rolesResult);
      setPermissionsCatalog(permissionsResult);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allPermissionCodes = useMemo(
    () => permissionsCatalog.map((permission) => permission.code),
    [permissionsCatalog]
  );

  const isAdminTemplate =
    roleTemplate === "admin" || editingRole?.code === ROLE_CODES.ADMIN || Boolean(form.grantAllPermissions);

  const openCreate = () => {
    setEditingRole(null);
    setRoleTemplate("custom");
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    const isAdminRole = role.code === ROLE_CODES.ADMIN;
    setEditingRole(role);
    setRoleTemplate(isAdminRole ? "admin" : "custom");
    setForm({
      name: role.name,
      code: role.code,
      description: role.description ?? "",
      permissionCodes: isAdminRole ? allPermissionCodes : role.permissions,
      grantAllPermissions: isAdminRole
    });
    setIsModalOpen(true);
  };

  const applyTemplate = (template: RoleTemplate) => {
    setRoleTemplate(template);

    if (template === "admin") {
      setForm((current) => ({
        ...current,
        name: current.name || "Administrador",
        code: current.code || "ADMINISTRATOR",
        description: current.description || "Acceso operativo completo a la plataforma.",
        permissionCodes: allPermissionCodes,
        grantAllPermissions: true
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      permissionCodes: [],
      grantAllPermissions: false
    }));
  };

  const togglePermission = (permissionCode: string) => {
    if (isAdminTemplate) {
      return;
    }

    setForm((current) => ({
      ...current,
      permissionCodes: current.permissionCodes.includes(permissionCode)
        ? current.permissionCodes.filter((code) => code !== permissionCode)
        : [...current.permissionCodes, permissionCode]
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload: RoleFormValues = isAdminTemplate
        ? {
            ...form,
            permissionCodes: allPermissionCodes,
            grantAllPermissions: true
          }
        : {
            ...form,
            grantAllPermissions: false
          };

      if (editingRole) {
        await updateRole(editingRole.id, payload);
        toast.success("Rol actualizado correctamente.");
      } else {
        await createRole(payload);
        toast.success("Rol creado correctamente.");
      }
      setIsModalOpen(false);
      await loadData({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Eliminar el rol ${role.name}? Esta accion sera logica.`)) {
      return;
    }

    try {
      await deleteRole(role.id);
      toast.success("Rol eliminado correctamente.");
      await loadData({ bustCache: true, silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Seguridad"
        title="Roles"
        description="Administra perfiles de acceso y sus permisos."
        actions={
          canManage ? (
            <PrimaryButton onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear rol
            </PrimaryButton>
          ) : null
        }
      >
        <div className="relative mt-5 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
            placeholder="Buscar por nombre o codigo..."
          />
        </div>
      </PageHeader>

      {!isLoading && filteredRoles.length === 0 ? (
        <EmptyPanel>
          <EmptyState
            icon={Shield}
            title={q.trim() ? "Sin resultados" : "No hay roles para mostrar"}
            description={q.trim() ? "Ajusta el filtro de busqueda." : "Crea un rol nuevo para comenzar."}
            action={
              canManage && !q.trim() ? (
                <PrimaryButton onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear rol
                </PrimaryButton>
              ) : null
            }
          />
        </EmptyPanel>
      ) : (
        <DataTable minWidth="860px">
          <TableHead
            columns={[
              { label: "Rol" },
              { label: "Permisos", align: "center" },
              { label: "Usuarios", align: "center" },
              { label: "Tipo" },
              { label: "Acciones", align: "right" }
            ]}
          />
          <tbody>
            {isLoading ? (
              <LoadingRow colSpan={5} label="Cargando roles..." />
            ) : (
              filteredRoles.map((role) => (
                <tr key={role.id} className="border-t border-border transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.code}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{role.permissions.length}</td>
                  <td className="px-4 py-3 text-center font-semibold">{role.usersCount}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={role.isSystem ? "success" : "neutral"}>
                      {role.isSystem ? "Sistema" : "Personalizado"}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canManage ? (
                        <ActionIconButton title="Editar" onClick={() => openEdit(role)}>
                          <Edit className="h-4 w-4" />
                        </ActionIconButton>
                      ) : null}
                      {canManage && !role.isSystem ? (
                        <ActionIconButton title="Eliminar" danger onClick={() => void handleDelete(role)}>
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
        <Modal title={editingRole ? "Editar rol" : "Crear rol"} onClose={() => setIsModalOpen(false)} wide>
          <form onSubmit={handleSave} className="space-y-5">
            {!editingRole ? (
              <label className="block space-y-1">
                <span className="text-sm font-bold">Tipo de rol</span>
                <select
                  value={roleTemplate}
                  onChange={(event) => applyTemplate(event.target.value as RoleTemplate)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="custom">Personalizado (elegir permisos)</option>
                  <option value="admin">Admin (todos los permisos)</option>
                </select>
              </label>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField label="Nombre *" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
              <TextField
                label="Codigo *"
                value={form.code}
                onChange={(value) => setForm({ ...form, code: value })}
                required
                disabled={Boolean(editingRole?.isSystem)}
              />
              <TextField
                label="Descripcion"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                className="md:col-span-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">Permisos</p>
                <p className="text-xs text-muted-foreground">
                  {isAdminTemplate ? `${allPermissionCodes.length} automaticos` : `${form.permissionCodes.length} seleccionados`}
                </p>
              </div>

              {isAdminTemplate ? (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-foreground">
                  Este rol de tipo Admin recibe <span className="font-bold">todos los permisos</span> por defecto. No necesitas
                  seleccionarlos manualmente.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                    <div key={moduleName} className="rounded-lg border border-border p-4">
                      <p className="mb-3 text-sm font-black capitalize">{moduleName}</p>
                      <div className="space-y-2">
                        {modulePermissions.map((permission) => (
                          <label key={permission.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.permissionCodes.includes(permission.code)}
                              onChange={() => togglePermission(permission.code)}
                            />
                            <span>{permission.code}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingRole ? "Guardar cambios" : "Crear rol"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
