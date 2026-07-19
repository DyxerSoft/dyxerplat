"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit, IdCard, KeyRound, Plus, Search, ShieldCheck, Trash2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserFacingErrorMessage } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import { SelectField } from "@/components/ui/SelectField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  return getUserFacingErrorMessage(error);
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const permissions = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return getStoredSession()?.user.permissions ?? [];
  }, []);

  const canCreate = permissions.includes(PERMISSIONS.USERS_CREATE);
  const canUpdate = permissions.includes(PERMISSIONS.USERS_UPDATE);
  const canDelete = permissions.includes(PERMISSIONS.USERS_DELETE);

  const loadUsers = async (targetPage = page) => {
    setIsLoading(true);
    try {
      const result = await listUsers({ q: debouncedQ, status, roleId, page: targetPage, pageSize: 10 });
      setUsers(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotalUsers(result.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRoles((await listRoles()).filter((role) => role.code !== "SUPER_ADMIN"));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [page, debouncedQ, status, roleId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedQ(q);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [q]);

  useEffect(() => {
    void loadRoles();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
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
      roleIds: user.roles.slice(0, 1).map((role) => role.id)
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateUserForm(form, Boolean(editingUser));
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
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
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success("Usuario eliminado correctamente.");
      setUserToDelete(null);
      await loadUsers();
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
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Seguridad</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black">Usuarios</h1>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">{totalUsers} operativos</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Gestiona cuentas operativas, datos del personal y roles asignados.</p>
          </div>
          {canCreate ? (
            <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Crear usuario
            </button>
          ) : null}
        </div>

        <div className="mt-6 max-w-full overflow-x-auto pb-1">
        <div className="inline-flex w-max flex-nowrap items-center gap-3">
          <div className="relative shrink-0" style={{ width: "500px", minWidth: "500px" }}>
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(event) => setQ(event.target.value)} style={{ paddingLeft: "3rem", paddingRight: "1rem" }} className="h-11 w-full rounded-lg border border-secondary/30 bg-background text-base text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground hover:border-secondary/50 focus:border-secondary focus:bg-card focus:ring-4 focus:ring-secondary/15" placeholder="Nombre, correo o documento" />
          </div>
          <SelectField
            ariaLabel="Filtrar por estado"
            value={status}
            onValueChange={(value) => { setStatus(value as UserStatus | ""); setPage(1); }}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "ACTIVE", label: "Activos" },
              { value: "INACTIVE", label: "Inactivos" },
              { value: "BLOCKED", label: "Bloqueados" }
            ]}
            className="h-9 w-[150px] shrink-0 border-0 bg-muted/60 shadow-none"
          />
          <SelectField
            ariaLabel="Filtrar por rol"
            value={roleId}
            onValueChange={(value) => { setRoleId(value); setPage(1); }}
            options={[{ value: "", label: "Todos los roles" }, ...roles.map((role) => ({ value: role.id, label: role.name }))]}
            className="h-9 w-[165px] shrink-0 border-0 bg-muted/60 shadow-none"
          />
        </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/70 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Cargando usuarios...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex w-full flex-col items-center justify-center text-center">
                      <Users className="mb-3 h-9 w-9 text-secondary" />
                      <p className="mx-auto font-bold">No hay usuarios operativos</p>
                      <p className="mx-auto mt-1 text-muted-foreground">El Super Admin está protegido y no se muestra aquí.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-border transition-colors hover:bg-muted/35">
                    <td className="px-4 py-3 text-center">
                      <p className="font-bold text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p>{user.position || "Sin cargo"}</p>
                      <p className="text-xs text-muted-foreground">{user.documentNumber || user.phone || "Sin documento"}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(user.status)}`}>
                        {statusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {user.roles.length > 0 ? user.roles.map((role) => (
                          <span key={role.id} className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">{role.name}</span>
                        )) : <span className="text-xs text-muted-foreground">Sin roles</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
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
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-muted/35 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  {editingUser ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </span>
                <div>
                  <h2 id="user-modal-title" className="text-lg font-black text-foreground">{editingUser ? "Editar usuario" : "Crear usuario"}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{editingUser ? "Actualiza los datos y accesos de la cuenta." : "Registra una nueva cuenta operativa en Dyxerplat."}</p>
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
                    <div><p className="font-black">Revisa los datos del usuario</p><p className="mt-1 text-muted-foreground">{formError}</p></div>
                  </div>
                ) : null}
                <fieldset>
                  <legend className="mb-4 flex items-center gap-2 text-sm font-black text-foreground">
                    <IdCard className="h-4 w-4 text-secondary" /> Información personal
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField label="Nombre" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} required minLength={2} pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+" title="Solo se permiten letras" placeholder="Ej. María" />
                    <TextField label="Apellido" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} required minLength={2} pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+" title="Solo se permiten letras" placeholder="Ej. Pérez" />
                    <TextField label="Teléfono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} inputMode="tel" pattern="\+?[0-9]{7,15}" title="Ingresa entre 7 y 15 dígitos" placeholder="Ej. 70000000" />
                    <TextField label="Documento" value={form.documentNumber} onChange={(value) => setForm({ ...form, documentNumber: value })} pattern="[A-Za-z0-9-]{4,20}" title="Usa entre 4 y 20 letras, números o guiones" placeholder="Número de identificación" />
                    <div className="sm:col-span-2">
                      <TextField label="Cargo" value={form.position} onChange={(value) => setForm({ ...form, position: value })} placeholder="Ej. Analista de operaciones" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-t border-border pt-5">
                  <legend className="mb-4 flex items-center gap-2 text-sm font-black text-foreground">
                    <KeyRound className="h-4 w-4 text-secondary" /> Acceso a la plataforma
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextField label="Correo electrónico" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required placeholder="nombre@empresa.com" />
                    <TextField label={editingUser ? "Nueva contraseña" : "Contraseña"} type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required={!editingUser} minLength={form.password ? 8 : undefined} pattern={form.password ? "(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?=.*[0-9]).{8,}" : undefined} title="Mínimo 8 caracteres, con al menos una letra y un número" placeholder={editingUser ? "Déjala vacía para conservarla" : "Mínimo 8 caracteres, letras y números"} />
                    <div className="space-y-2 sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
                      <span className="text-sm font-bold text-foreground">Estado</span>
                      <SelectField
                        ariaLabel="Estado del usuario"
                        value={form.status}
                        onValueChange={(value) => setForm({ ...form, status: value as UserStatus })}
                        options={[
                          { value: "ACTIVE", label: "Activo" },
                          { value: "INACTIVE", label: "Inactivo" },
                          { value: "BLOCKED", label: "Bloqueado" }
                        ]}
                        className="h-11 w-full rounded-xl bg-background shadow-none"
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-t border-border pt-5">
                  <legend className="mb-1 flex items-center gap-2 text-sm font-black text-foreground">
                    <ShieldCheck className="h-4 w-4 text-secondary" /> Roles y permisos
                  </legend>
                  <p className="mb-3 text-xs text-muted-foreground">Asigna un único rol para definir las funciones de este usuario.</p>
                  <div className="max-w-sm">
                    <div className="block space-y-2">
                      <span className="text-sm font-bold text-foreground">Rol del usuario<span className="ml-1 text-destructive">*</span></span>
                      <SelectField
                        ariaLabel="Rol del usuario"
                        value={form.roleIds[0] ?? ""}
                        onValueChange={(value) => setForm({ ...form, roleIds: value ? [value] : [] })}
                        options={[{ value: "", label: "Sin rol asignado" }, ...roles.map((role) => ({ value: role.id, label: role.name }))]}
                        className="h-11 w-full rounded-xl bg-background shadow-none"
                      />
                    </div>
                    {form.roleIds[0] ? (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {roles.find((role) => role.id === form.roleIds[0])?.description ?? "El usuario recibirá los permisos asociados a este rol."}
                      </p>
                    ) : null}
                  </div>
                </fieldset>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-black hover:bg-muted">Cancelar</button>
                <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm hover:bg-primary/90">
                  {editingUser ? <Edit className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {editingUser ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Eliminar usuario"
        description={`¿Deseas eliminar la cuenta “${userToDelete?.email ?? ""}”? Se conservará su historial, pero ya no podrá acceder a la plataforma.`}
        confirmLabel="Eliminar usuario"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setUserToDelete(null)}
      />
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

function validateUserForm(form: UserFormValues, isEditing: boolean) {
  const namePattern = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
  if (form.firstName.trim().length < 2 || !namePattern.test(form.firstName.trim())) return "El nombre debe tener al menos 2 caracteres y contener solamente letras.";
  if (form.lastName.trim().length < 2 || !namePattern.test(form.lastName.trim())) return "El apellido debe tener al menos 2 caracteres y contener solamente letras.";
  if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) return "El teléfono debe contener entre 7 y 15 dígitos; solamente puede iniciar con +.";
  if (form.documentNumber && !/^[A-Za-z0-9-]{4,20}$/.test(form.documentNumber)) return "El documento debe tener entre 4 y 20 letras, números o guiones.";
  if (!isEditing || form.password) {
    if (form.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(form.password) || !/\d/.test(form.password)) return "La contraseña debe incluir al menos una letra y un número.";
  }
  if (form.roleIds.length !== 1) return "Debes seleccionar un rol para el usuario.";
  return "";
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  pattern,
  title,
  minLength,
  inputMode
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  title?: string;
  minLength?: number;
  inputMode?: "text" | "tel" | "email" | "numeric";
}>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-foreground">{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        minLength={minLength}
        inputMode={inputMode}
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
      />
    </label>
  );
}
