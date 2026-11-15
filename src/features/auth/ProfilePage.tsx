import { LogOut } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import { isStaff, ROLE_LABEL } from "@/lib/roles";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials, useMyProfile } from "./useMyProfile";

export default function ProfilePage() {
  const { session, role, signOut } = useAuth();
  const { data: profile, isLoading, error } = useMyProfile();

  return (
    <>
      <PageHeader title="Yo" />
      <section className="mx-5 mt-4 flex flex-col items-center gap-3 rounded-card border border-linea bg-white p-8 text-center lg:mx-10 lg:max-w-md">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-rosa text-2xl font-extrabold text-white">
          {initials(profile?.full_name)}
        </span>
        {isLoading && <p>Cargando…</p>}
        {error && (
          <p className="text-rosa-profundo">No pudimos cargar tu perfil.</p>
        )}
        {profile && (
          <p className="font-display text-2xl font-bold">{profile.full_name}</p>
        )}
        <p className="text-tinta/70">{session?.user.email}</p>
        {isStaff(role) && (
          <span className="rounded-full bg-azul-suave px-3 py-1 text-sm font-bold text-azul">
            {ROLE_LABEL[role]}
          </span>
        )}
        <button
          onClick={signOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-linea py-3 font-display text-lg font-bold"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </section>
    </>
  );
}
