"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, FileText, Inbox, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { PERMISSIONS } from "@dyxerplat/shared";
import { PageHeader, StatusPill } from "@/components/platform/crm-ui";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage, getSessionPermissions } from "@/lib/crm";
import { getStoredSession } from "@/features/auth/auth-service";

type DashboardStats = {
  companies: number | null;
  posts: number | null;
  users: number | null;
  roles: number | null;
  leads: number | null;
};

export function DashboardOverview() {
  const [permissions] = useState(() => getSessionPermissions());
  const [stats, setStats] = useState<DashboardStats>({
    companies: null,
    posts: null,
    users: null,
    roles: null,
    leads: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const token = getStoredSession()?.token ?? null;
        const result = await apiRequest<DashboardStats>("/dashboard/stats", { token });

        if (!cancelled) {
          setStats(result);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Leads",
      value: stats.leads,
      href: "/leads",
      icon: Inbox,
      description: "Mensajes de contacto pendientes de seguimiento.",
      canView: permissions.includes(PERMISSIONS.LEADS_READ)
    },
    {
      label: "Companias",
      value: stats.companies,
      href: "/companies",
      icon: Building2,
      description: "Clientes y cuentas activas en el CRM.",
      canView: permissions.includes(PERMISSIONS.COMPANIES_READ)
    },
    {
      label: "Publicaciones",
      value: stats.posts,
      href: "/posts",
      icon: FileText,
      description: "Contenido del blog interno y publico.",
      canView: permissions.includes(PERMISSIONS.POSTS_READ)
    },
    {
      label: "Usuarios",
      value: stats.users,
      href: "/users",
      icon: Users,
      description: "Cuentas internas con acceso a la plataforma.",
      canView: permissions.includes(PERMISSIONS.USERS_READ)
    },
    {
      label: "Roles",
      value: stats.roles,
      href: "/roles",
      icon: Shield,
      description: "Perfiles de permisos disponibles.",
      canView: true
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="CRM"
        title="Dashboard"
        description="Resumen operativo de la plataforma. Usa los accesos rapidos para gestionar cada modulo."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-secondary/40 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-3xl font-black text-primary">
                    {isLoading ? "…" : card.canView ? (card.value ?? "—") : "—"}
                  </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
              {!card.canView ? (
                <div className="mt-3">
                  <StatusPill tone="neutral">Sin permiso de lectura</StatusPill>
                </div>
              ) : null}
            </article>
          );

          return card.canView ? (
            <Link key={card.label} href={card.href} prefetch className="block">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
