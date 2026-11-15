import { NavLink, Outlet } from "react-router";
import {
  Bell,
  BookOpen,
  House,
  LogOut,
  Smile,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/app/auth-context";
import { isStaff, ROLE_LABEL, type StaffRole } from "@/lib/roles";
import { initials, useMyProfile } from "@/features/auth/useMyProfile";

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const NAV: Record<StaffRole, NavItem[]> = {
  teacher: [
    { to: "/docente", label: "Inicio", icon: House, end: true },
    { to: "/docente/lecciones", label: "Lecciones", icon: BookOpen },
    { to: "/docente/grupos", label: "Grupos", icon: Users },
    { to: "/yo", label: "Yo", icon: Smile },
  ],
  director: [
    { to: "/escuela", label: "Inicio", icon: House, end: true },
    { to: "/escuela/alertas", label: "Alertas", icon: Bell },
    { to: "/escuela/personal", label: "Personal", icon: UserPlus },
    { to: "/yo", label: "Yo", icon: Smile },
  ],
  counselor: [
    { to: "/escuela", label: "Inicio", icon: House, end: true },
    { to: "/escuela/alertas", label: "Alertas", icon: Bell },
    { to: "/yo", label: "Yo", icon: Smile },
  ],
  admin: [
    { to: "/admin", label: "Inicio", icon: House, end: true },
    { to: "/yo", label: "Yo", icon: Smile },
  ],
};

export function AppShell() {
  const { role, signOut } = useAuth();
  const { data: profile } = useMyProfile();
  if (!isStaff(role)) return null;
  const items = NAV[role];

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop: sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-linea bg-white p-5 lg:flex">
        <img src="/logo-pio.png" alt="Pío" className="mb-8 h-10 self-start" />
        <nav className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-4 py-2.5 font-bold transition ${
                  isActive
                    ? "bg-azul-suave text-azul"
                    : "text-tinta/70 hover:bg-arena"
                }`
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-linea pt-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rosa text-sm font-extrabold text-white">
            {initials(profile?.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {profile?.full_name ?? "…"}
            </p>
            <p className="text-xs text-tinta/60">{ROLE_LABEL[role]}</p>
          </div>
          <button
            onClick={signOut}
            title="Cerrar sesión"
            className="rounded-full p-2 text-tinta/60 hover:bg-arena"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile: bottom bar (as in Figma) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid border-t border-linea bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-bold ${isActive ? "text-azul" : "text-tinta/50"}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`rounded-full px-4 py-1 ${isActive ? "bg-azul-suave" : ""}`}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
