import { useEffect, useState } from 'react'
import { supabase, envName } from '@/lib/supabase'

type Check =
  | { state: 'loading' }
  | { state: 'ok'; detail: string }
  | { state: 'error'; detail: string }

const emotions = [
  { name: 'Alegría', cls: 'bg-alegria' },
  { name: 'Tristeza', cls: 'bg-tristeza' },
  { name: 'Enojo', cls: 'bg-enojo' },
  { name: 'Miedo', cls: 'bg-miedo' },
  { name: 'Calma', cls: 'bg-calma' },
  { name: 'Cariño', cls: 'bg-carino' },
]

export default function App() {
  const [check, setCheck] = useState<Check>({ state: 'loading' })

  useEffect(() => {
    // family_week is the only RPC open to anon: a fake token must come back as NOT_FOUND.
    // If that happens, the URL, the key and the network are all right.
    supabase
      .rpc('family_week', { p_token: 'w0-connection-check' })
      .then(({ data, error }) => {
        if (error?.message.includes('NOT_FOUND') || (!error && data === null)) {
          setCheck({ state: 'ok', detail: 'Staging respondió NOT_FOUND, como se esperaba.' })
        } else if (error) {
          setCheck({ state: 'error', detail: `${error.code ?? ''} ${error.message}` })
        } else {
          setCheck({ state: 'error', detail: 'Respuesta inesperada: ese token no debería existir.' })
        }
      })
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <header className="flex items-center gap-3">
        <img src="/logo-pio.png" alt="Pío" className="h-10" />
        <span className="rounded-full bg-azul-suave px-3 py-1 text-sm font-bold text-azul">
          Portal docente · {envName}
        </span>
      </header>

      <section className="rounded-card border border-linea bg-white p-6">
        <h1 className="text-3xl font-extrabold">Conexión con el API</h1>
        {check.state === 'loading' && <p className="mt-2">Conectando…</p>}
        {check.state === 'ok' && (
          <p className="mt-2 font-bold text-[#3B7D23]">✓ Conectado. {check.detail}</p>
        )}
        {check.state === 'error' && (
          <p className="mt-2 font-bold text-rosa-profundo">✗ Error: {check.detail}</p>
        )}
        <p className="mt-1 text-sm opacity-70">{import.meta.env.VITE_SUPABASE_URL}</p>
      </section>

      <section className="rounded-card border border-linea bg-white p-6">
        <h2 className="text-xl font-bold">Sistema visual</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {emotions.map((e) => (
            <div key={e.name} className="flex flex-col items-center gap-1 text-xs font-semibold">
              <span className={`h-10 w-10 rounded-full ${e.cls}`} />
              {e.name}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <button className="rounded-full bg-azul py-3 font-display text-lg font-bold text-white">
            Asignar a 12 estudiantes
          </button>
          <button className="rounded-full border-2 border-linea bg-white py-3 font-display text-lg font-bold">
            Ahora no
          </button>
        </div>
      </section>
    </main>
  )
}