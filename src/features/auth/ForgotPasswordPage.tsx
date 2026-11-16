import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { publicBase } from '@/lib/format'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${publicBase()}/restablecer` })
    setBusy(false)
    if (err?.status === 429) return setError('Ya pediste un enlace hace poco. Esperá unos minutos.')
    setSent(true) // same message whether the email exists or not
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <img src="/logo-pio.png" alt="Pío" className="h-12" />
        <h1 className="mt-6 text-3xl font-extrabold">¿Olvidaste tu contraseña?</h1>
        {sent ? (
          <p className="mt-4 rounded-2xl bg-[#E6F4DC] px-4 py-3 font-bold text-[#2E6B12]">
            Si ese correo está registrado en Pío, te llegará un enlace para crear una contraseña nueva. Revisá también la carpeta de spam.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <p className="mt-1 text-tinta/70">Te mandamos un enlace a tu correo.</p>
            <label htmlFor="em" className="mt-6 block text-sm font-bold">Correo</label>
            <input id="em" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul" />
            {error && <p role="alert" className="mt-4 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">{error}</p>}
            <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-60">
              {busy ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm font-bold text-azul">Volver al inicio de sesión</Link>
      </div>
    </div>
  )
}