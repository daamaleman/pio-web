import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { ArrowLeft, Copy, ExternalLink, Printer } from "lucide-react";
import { ErrorCard } from "@/components/ui/Card";
import { groupLabel, publicBase } from "@/lib/format";
import { useFamilyToken, useGroupOverview, useMyGroups } from "./api";
import { usePageTitle } from "@/lib/usePageTitle";

export default function FamilyQrPage() {
  const { t } = useTranslation();
  usePageTitle(t("groups.qr"));
  const { groupId } = useParams();
  const groups = useMyGroups();
  const group = groups.data?.find((g) => g.id === groupId);
  const token = useFamilyToken(groupId);
  const overview = useGroupOverview(groupId);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = token.data ? `${publicBase()}/familia/${token.data}` : null;
  const isLocal = ["localhost", "127.0.0.1"].includes(
    new URL(publicBase()).hostname,
  );

  useEffect(() => {
    if (!url) return;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(url, {
          width: 640,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#1D2A5C", light: "#FFFFFF" },
        }),
      )
      .then(setQr);
  }, [url]);

  if (groups.isLoading || token.isLoading)
    return (
      <div className="m-5 h-96 animate-pulse rounded-card bg-linea lg:m-10" />
    );
  if (!group || token.error) {
    return (
      <div className="p-5 lg:p-10">
        <ErrorCard
          message={t("familyQr.error")}
          onRetry={() => token.refetch()}
        />
      </div>
    );
  }

  // The printed sheet goes home: it uses the group's language, not the portal's
  const tg = i18n.getFixedT(group.language ?? "es");

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-4 lg:pt-8 print:max-w-none print:p-0">
      <div className="mb-4 flex items-center gap-2 print:hidden">
        <Link
          to="/docente/grupos"
          aria-label={t("common.back")}
          className="rounded-full p-2 hover:bg-white"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold">{t("groups.qr")}</h1>
      </div>

      {isLocal && (
        <p className="mb-4 rounded-2xl bg-[#FFF3D1] px-4 py-3 text-sm print:hidden">
          <b>{t("familyQr.localTitle")}</b> {t("familyQr.localText")}
        </p>
      )}

      {/* Printable sheet */}
      <section className="rounded-card border-2 border-rosa bg-white p-8 text-center print:rounded-none print:border-0">
        <img src="/logo-pio.png" alt="Pío" className="mx-auto h-12" />
        <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-rosa-profundo">
          {tg("familyQr.space")}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold">{groupLabel(group)}</h2>
        {overview.data && (
          <p className="text-tinta/70">{overview.data.group.school_name}</p>
        )}

        {qr ? (
          <img
            src={qr}
            alt={t("familyQr.qrAlt", { url })}
            className="mx-auto mt-6 w-64 print:w-80"
          />
        ) : (
          <div className="mx-auto mt-6 h-64 w-64 animate-pulse rounded-2xl bg-linea" />
        )}

        <ol className="mx-auto mt-6 max-w-sm space-y-1 text-left text-sm">
          <li>1. {tg("familyQr.step1")}</li>
          <li>2. {tg("familyQr.step2")}</li>
          <li>3. {tg("familyQr.step3")}</li>
        </ol>
        <p className="mt-6 text-xs text-tinta/60">
          {tg("familyQr.privacy")}
        </p>
        <img src="/pio-mascota.png" alt="" className="mx-auto mt-4 h-16 w-16" />
      </section>

      <div className="mt-5 grid gap-2 sm:grid-cols-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-full bg-azul py-3 font-bold text-white"
        >
          <Printer size={18} /> {t("common.print")}
        </button>
        <button
          onClick={async () => {
            if (!url) return;
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-linea bg-white py-3 font-bold"
        >
          <Copy size={18} /> {copied ? t("familyQr.copied") : t("familyQr.copy")}
        </button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-linea bg-white py-3 font-bold"
          >
            <ExternalLink size={18} /> {t("familyQr.open")}
          </a>
        )}
      </div>
    </div>
  );
}
