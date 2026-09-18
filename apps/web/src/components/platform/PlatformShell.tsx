"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Users
} from "lucide-react";
import { clearSession, getCurrentUser, getStoredSession, saveSession } from "@/features/auth/auth-service";
import type { AuthSession } from "@/features/auth/types";

const SIDEBAR_STORAGE_KEY = "dyxerplat_sidebar_collapsed";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Compañías", icon: Building2 },
  { href: "/inquiries", label: "Solicitudes web", icon: MessageSquareText },
  { href: "/posts", label: "Publicaciones", icon: Newspaper },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/roles", label: "Roles", icon: Shield }
] as const;

export function PlatformShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    const storedSession = getStoredSession();

    if (!storedSession) {
      router.replace("/login");
      return;
    }

    getCurrentUser(storedSession.token)
      .then((user) => {
        const refreshedSession = { token: storedSession.token, user };
        saveSession(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => setIsCheckingSession(false));
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground shadow-sm">
          Validando sesión...
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-muted/35">
      <div className="flex min-h-screen">
        <aside className={`hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
          <SidebarBrand collapsed={isSidebarCollapsed} />
          <SidebarNavigation pathname={pathname} collapsed={isSidebarCollapsed} />
          <div className="mt-auto border-t border-border p-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}
              title={isSidebarCollapsed ? "Expandir menú" : "Plegar menú"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              {!isSidebarCollapsed ? <span>Plegar menú</span> : <span className="sr-only">Expandir menú</span>}
            </button>
          </div>
        </aside>

        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            />
            <aside className="relative flex h-full w-[290px] flex-col border-r border-border bg-card shadow-2xl">
              <SidebarBrand />
              <SidebarNavigation pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
            </aside>
          </div>
        ) : null}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </header>

          <div className="p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

function SidebarBrand({ collapsed = false }: Readonly<{ collapsed?: boolean }>) {
  return (
    <div className={`flex h-16 items-center border-b border-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">DX</span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block text-lg font-black leading-none text-foreground">Dyxerplat</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Administración</span>
        </span>
      ) : null}
    </div>
  );
}

function SidebarNavigation({
  pathname,
  collapsed = false,
  onNavigate
}: Readonly<{ pathname: string; collapsed?: boolean; onNavigate?: () => void }>) {
  return (
    <nav className="space-y-1 p-3" aria-label="Menú principal">
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`flex h-11 items-center rounded-lg px-3 text-sm font-bold transition ${collapsed ? "justify-center" : "gap-3"} ${
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>{label}</span> : <span className="sr-only">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
