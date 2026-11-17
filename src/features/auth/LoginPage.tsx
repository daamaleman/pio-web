import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { readClaims } from "@/lib/claims";
import { isStaff } from "@/lib/roles";
import { useAuth } from "@/app/auth-context";
import { usePageTitle } from "@/lib/usePageTitle";
import { useTranslation } from "react-i18next";
import { t } from "@/i18n";

function loginMessage(error: AuthError): string {
  if (error.code === "invalid_credentials")
    return t("login.errors.invalid");
  if (error.code === "email_not_confirmed")
    return t("login.errors.notConfirmed");
  if (error.status === 429)
    return t("login.errors.tooMany");
  return t("login.errors.generic");
}

export default function LoginPage() {
  const { t: translate } = useTranslation();
  usePageTitle(translate("login.submit"));
  const { loading, session, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && session && isStaff(role)) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(loginMessage(error));
      setBusy(false);
      return;
    }
    if (!isStaff(readClaims(data.session.access_token)?.app_role)) {
      await supabase.auth.signOut();
      setError(translate("login.errors.noAccess"));
      setBusy(false);
    }
    // If everything is fine, the Navigate above takes over when the session updates.
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop: blue panel with Pío */}
      <aside className="hidden flex-1 flex-col items-center justify-center gap-6 bg-azul p-10 text-white lg:flex">
        <img src="/pio-mascota.png" alt="" className="h-48 w-48" />
        <h2 className="text-center text-4xl font-extrabold">Siento y Crezco</h2>
        <p className="max-w-sm text-center text-lg text-white/80">{translate("login.sideText")}</p>
      </aside>

      <main className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <img src="/logo-pio.png" alt="Pío" className="h-12" />
          <h1 className="mt-6 text-3xl font-extrabold">{translate("login.title")}</h1>
          <p className="mt-1 text-tinta/70">{translate("login.subtitle")}</p>

          <label className="mt-6 block text-sm font-bold" htmlFor="email">
            {translate("login.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul"
          />

          <label className="mt-4 block text-sm font-bold" htmlFor="password">
            {translate("login.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-60"
          >
            {busy ? translate("login.submitting") : translate("login.submit")}
          </button>
          <Link
            to="/olvide"
            className="mt-4 block text-center text-sm font-bold text-azul"
          >
            {translate("login.forgot")}
          </Link>
        </form>
      </main>
    </div>
  );
}
