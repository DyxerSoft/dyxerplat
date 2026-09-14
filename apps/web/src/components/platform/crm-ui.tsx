"use client";

import type { FormEvent, ReactNode } from "react";
import { Loader2, Search, type LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
}>) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function FilterBar({
  children,
  onSubmit
}: Readonly<{
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}>) {
  return (
    <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
      {children}
    </form>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
        placeholder={placeholder}
      />
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  children
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}>) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
    >
      {children}
    </select>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = ""
}: Readonly<{
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = ""
}: Readonly<{
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function DataTable({
  children,
  minWidth = "900px",
  footer
}: Readonly<{
  children: ReactNode;
  minWidth?: string;
  footer?: ReactNode;
}>) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
      {footer}
    </section>
  );
}

export function TableHead({
  columns
}: Readonly<{ columns: Array<{ label: string; align?: "left" | "right" | "center" }> }>) {
  return (
    <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
      <tr>
        {columns.map((column) => (
          <th
            key={column.label}
            className={`px-4 py-3 ${
              column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
            }`}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: Readonly<{
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary/10 text-secondary">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function EmptyPanel({
  children,
  footer
}: Readonly<{
  children: ReactNode;
  footer?: ReactNode;
}>) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {children}
      {footer}
    </section>
  );
}

export function LoadingRow({ colSpan, label = "Cargando..." }: Readonly<{ colSpan: number; label?: string }>) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          {label}
        </span>
      </td>
    </tr>
  );
}

export function StatusPill({
  tone = "neutral",
  children
}: Readonly<{
  tone?: "success" | "neutral" | "danger" | "warning";
  children: ReactNode;
}>) {
  const tones = {
    success: "bg-secondary/10 text-secondary",
    neutral: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  onPrevious,
  onNext
}: Readonly<{
  page: number;
  totalPages: number;
  total?: number;
  onPrevious: () => void;
  onNext: () => void;
}>) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">
        Pagina {page} de {Math.max(totalPages, 1)}
        {typeof total === "number" ? ` · ${total} registro${total === 1 ? "" : "s"}` : ""}
      </span>
      <div className="flex gap-2">
        <SecondaryButton disabled={page <= 1} onClick={onPrevious} className="px-3 py-1.5">
          Anterior
        </SecondaryButton>
        <SecondaryButton disabled={page >= totalPages} onClick={onNext} className="px-3 py-1.5">
          Siguiente
        </SecondaryButton>
      </div>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide = false
}: Readonly<{
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-[1px]">
      <section
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-border bg-card shadow-2xl ${
          wide ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <SecondaryButton onClick={onClose} className="px-3 py-1">
            Cerrar
          </SecondaryButton>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  placeholder
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}>) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}

export function ActionIconButton({
  title,
  onClick,
  children,
  danger = false
}: Readonly<{
  title: string;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}>) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md border border-border p-2 transition hover:bg-muted ${
        danger ? "text-destructive hover:bg-destructive/10" : ""
      }`}
    >
      {children}
    </button>
  );
}
