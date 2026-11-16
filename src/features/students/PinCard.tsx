// In primary, the PIN is 4 drawings from a 3x3 grid. Each digit (1–9) is a position:
// 1 2 3 / 4 5 6 / 7 8 9. The card shows which square to tap, in order.
function PinGrid({ digit, order }: { digit: number; order: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-3 gap-0.5 rounded-md border border-linea p-0.5">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`h-3.5 w-3.5 rounded-sm ${i + 1 === digit ? 'bg-rosa' : 'bg-arena'}`} />
        ))}
      </div>
      <span className="text-[10px] font-bold text-tinta/50">{order}.º</span>
    </div>
  )
}

export function PinCard({ name, groupText, classCode, pin, level }: {
  name: string
  groupText: string
  classCode: string
  pin: string
  level: string
}) {
  return (
    <div className="break-inside-avoid rounded-2xl border-2 border-dashed border-rosa bg-white p-4">
      <div className="flex items-center justify-between">
        <img src="/logo-pio.png" alt="Pío" className="h-6" />
        <span className="text-xs font-bold text-tinta/60">{groupText}</span>
      </div>
      <p className="mt-2 font-display text-xl font-extrabold leading-tight">{name}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-tinta/50">Código de clase</p>
          <p className="font-display text-lg font-extrabold tracking-widest text-azul">{classCode}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-tinta/50">Tu PIN</p>
          {level === 'primary' ? (
            <div className="mt-1 flex gap-1.5">
              {pin.split('').map((d, i) => <PinGrid key={i} digit={Number(d)} order={i + 1} />)}
            </div>
          ) : (
            <p className="font-display text-2xl font-extrabold tracking-[0.3em]">{pin}</p>
          )}
        </div>
      </div>
      {level === 'primary' && <p className="mt-1 text-right text-[10px] text-tinta/40">({pin})</p>}
    </div>
  )
}

export function PinCardSheet({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">{children}</div>
}