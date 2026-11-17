// Rellena miq.json con el glosario de src/i18n/glossary.miq.json.
// - byKey: aplica a esa clave exacta (si existe en es.json).
// - byText: aplica a cualquier clave cuyo texto en español coincida (sin
//   distinguir mayúsculas, ignorando ":", "." y espacios al final).
// Nunca sobrescribe un valor que ya exista en miq.json, salvo con --force-keys
// (solo para las entradas byKey).
import { readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../src/i18n/', import.meta.url)
const read = (f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
const es = read('es.json')
const miq = read('miq.json')
const g = read('glossary.miq.json')
const forceKeys = process.argv.includes('--force-keys')

const norm = (s) => s.trim().replace(/[\s:.…]+$/u, '').toLocaleLowerCase('es')
const byText = new Map(Object.entries(g.byText).map(([k, v]) => [norm(k), v]))

const get = (o, path) => path.reduce((a, k) => (a && typeof a === 'object' ? a[k] : undefined), o)
const set = (o, path, v) => {
  let cur = o
  for (const k of path.slice(0, -1)) cur = cur[k] ??= {}
  cur[path.at(-1)] = v
}

let added = 0
const filled = []
function walk(node, path) {
  for (const [k, v] of Object.entries(node)) {
    const p = [...path, k]
    if (v && typeof v === 'object') { walk(v, p); continue }
    if (typeof v !== 'string') continue
    const id = p.join('.')
    const current = get(miq, p)
    const fromKey = g.byKey[id]
    if (fromKey && (current === undefined || forceKeys)) {
      if (current !== fromKey) { set(miq, p, fromKey); added++; filled.push(`${id} = ${fromKey}`) }
      continue
    }
    if (current !== undefined) continue
    // Respeta el sufijo ":" del original si lo tenía
    const hit = byText.get(norm(v))
    if (hit) {
      const suffix = /:\s*$/.test(v) ? ':' : ''
      set(miq, p, hit + suffix); added++; filled.push(`${id} = ${hit}${suffix}  (es: "${v}")`)
    }
  }
}
walk(es, [])

writeFileSync(new URL('miq.json', dir), JSON.stringify(miq, null, 2) + '\n', 'utf8')
const total = (o) => Object.values(o).reduce((n, v) => n + (v && typeof v === 'object' ? total(v) : 1), 0)
console.log(filled.map((l) => '  + ' + l).join('\n') || '  (nada nuevo)')
console.log(`\nAñadidas: ${added}. Miskitu cubre ${total(miq)} de ${total(es)} textos; el resto cae a español.`)
