import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { AuthError, EmailOtpType } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth-context'
import { usePageTitle } from '@/lib/usePageTitle'

function passwordError(e: AuthError): string {
  if (e.code === 'same_password') return 'Esa ya es tu contraseña. Elegí una distinta.'
  if (e.code === 'weak_password') return 'Elegí una contraseña más segura: al menos 8 caracteres, con letras y números.'
  if (e.status === 429) return 'Demasiados intentos seguidos. Esperá un momento.'
  return 'No pudimos guardar la contraseña. Intentá de nuevo.'
}

// What the link brought, read once when the page opens
function readLink() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return {
    errorCode: hash.get('error_code') ?? query.get('error_code'),
    tokenHash: query.get('token_hash'),
    type: query.get('type') as EmailOtpType | null,
  }
}

function linkErrorText(code: string) {
  return code === 'otp_expired' ? 'El enlace venció (dura 24 horas) o ya se usó.' : 'El enlace no es válido.'
}

export default function SetPasswordPage({ mode }: { mode: 'invite' | 'recovery' }) {
  usePageTitle(mode === 'invite' ? 'Crear contraseña' : 'Nueva contraseña')
  const { loading, session } = useAuth()
  const navigate = useNavigate()
  const [link] = useState(readLink)
  const [verifying, setVerifying] = useState(() => !link.errorCode && !!link.tokenHash && !!link.type)
  const [linkError, setLinkError] = useState<string | null>(() => (link.errorCode ? linkErrorText(link.errorCode) : null))
  const started = useRef(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!verifying || !link.tokenHash || !link.type || started.current) return
    started.current = true // React runs effects twice in development: the token can only be used once
    supabase.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type }).then(({ error: e }) => {
      if (e) setLinkError('El enlace venció o ya se usó.')
      window.history.replaceState(null, '', window.location.pathname) // remove the token from the address bar
      setVerifying(false)
    })
  }, [link, verifying])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('Usá al menos 8 caracteres.')
    if (password !== confirm) return setError('Las dos contraseñas no coinciden.')
    setBusy(true)
    const { error: e2 } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (e2) return setError(passwordError(e2))
    navigate('/', { replace: true })
  }

  const title = mode === 'invite' ? '¡Bienvenida a Pío!' : 'Nueva contraseña'
  const ready = !loading && !verifying

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <img src="/logo-pio.png" alt="Pío" className="h-12" />
        <h1 className="mt-6 text-3xl font-extrabold">{title}</h1>

        {!ready && <p className="mt-4">Verificando el enlace…</p>}

        {ready && (linkError || !session) && (
          <div className="mt-4 rounded-2xl bg-rosa-suave p-4 text-sm text-rosa-profundo">
            <p className="font-bold">{linkError ?? 'El enlace no es válido o ya se usó.'}</p>
            <p className="mt-1">
              {mode === 'invite' ? 'Pedile a la dirección de tu escuela que te invite de nuevo, o ' : ''}
              <Link to="/olvide" className="font-bold underline">pedí un enlace nuevo</Link>.
            </p>
          </div>
        )}

        {ready && !linkError && session && (
          <form onSubmit={onSubmit}>
            <p className="mt-1 text-tinta/70">
              {mode === 'invite' ? 'Creá tu contraseña para entrar al portal.' : 'Escribí tu nueva contraseña.'}
            </p>
            <p className="mt-1 text-sm text-tinta/60">{session.user.email}</p>

            <label htmlFor="pw" className="mt-6 block text-sm font-bold">Contraseña</label>
            <input id="pw" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul" />
            <label htmlFor="pw2" className="mt-4 block text-sm font-bold">Repetila</label>
            <input id="pw2" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-linea bg-white px-4 py-3 outline-none focus:border-azul" />
            <p className="mt-1 text-xs text-tinta/50">Al menos 8 caracteres.</p>

            {error && <p role="alert" className="mt-4 rounded-2xl bg-rosa-suave px-4 py-3 text-sm font-bold text-rosa-profundo">{error}</p>}

            <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-azul py-3.5 font-display text-lg font-bold text-white disabled:opacity-60">
              {busy ? 'Guardando…' : 'Guardar y entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}