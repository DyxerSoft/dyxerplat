"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel
}: Readonly<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={isLoading ? undefined : onCancel} aria-label="Cerrar confirmación" />
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="confirm-title" className="text-xl font-black text-foreground">{title}</h2>
              <p id="confirm-description" className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <button type="button" onClick={onCancel} disabled={isLoading} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={isLoading} className="h-10 rounded-xl border border-border bg-card px-5 text-sm font-black text-foreground transition hover:bg-muted disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading} autoFocus className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-5 text-sm font-black text-destructive-foreground transition hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
