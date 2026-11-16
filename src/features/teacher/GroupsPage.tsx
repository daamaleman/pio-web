import { Link } from "react-router";
import { QrCode, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel } from "@/lib/format";
import { useMyGroups } from "./api";

const WEEKDAY = [
  "",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

export default function GroupsPage() {
  const groups = useMyGroups();

  return (
    <div className="pb-10">
      <PageHeader
        title="Mis grupos"
        subtitle="El código de clase es lo que tus estudiantes escriben para entrar a la app."
      />
      <div className="grid gap-3 px-5 lg:grid-cols-2 lg:px-10">
        {groups.isLoading && (
          <div className="h-40 animate-pulse rounded-card bg-linea" />
        )}
        {groups.error && (
          <ErrorCard
            message="No pudimos cargar tus grupos."
            onRetry={() => groups.refetch()}
          />
        )}
        {groups.data?.map((g) => (
          <section
            key={g.id}
            className="rounded-card border border-linea bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{groupLabel(g)}</h2>
                {g.class_weekday && (
                  <p className="text-sm text-tinta/60">
                    Clase los {WEEKDAY[g.class_weekday]}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-azul-suave p-2.5 text-azul">
                <Users size={20} />
              </span>
            </div>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-tinta/60">
              Código de clase
            </p>
            <p className="font-display text-4xl font-extrabold tracking-[0.2em] text-azul">
              {g.class_code}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/docente/grupos/${g.id}/qr`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-azul py-2.5 font-bold text-white"
              >
                <QrCode size={18} /> QR para familias
              </Link>
              <Link
                to={`/docente/grupos/${g.id}/estudiantes`}
                className="flex flex-1 items-center justify-center rounded-full border-2 border-linea py-2.5 font-bold"
              >
                Estudiantes
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
