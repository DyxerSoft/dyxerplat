"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Newspaper, Shield, Users } from "lucide-react";
import { clearSession, getCurrentUser, getStoredSession, saveSession } from "@/features/auth/auth-service";
import type { AuthSession } from "@/features/auth/types";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companias", icon: Building2 },
  { href: "/posts", label: "Publicaciones", icon: Newspaper },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/roles", label: "Roles", icon: Shield }
] as const;

export function PlatformShell({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession) {
      router.replace("/login");
      return;
    }

    getCurrentUser(storedSession.token)
      .then((user) => {
        const refreshedSession = {
          token: storedSession.token,
          user
        };
        saveSession(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground">
          Validando sesion...
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="text-lg font-black text-foreground">Dyxerplat</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-secondary">CRM</p>
          </div>
          <nav className="space-y-1 p-3">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
            <div>
              <p className="text-sm font-bold text-foreground">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </button>
          </header>

          <div className="p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
