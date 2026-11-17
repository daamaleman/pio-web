// Checks that every static t('key') used in src exists in es.json and en.json,
// and that es and en have the same keys. Run: npm run i18n:check
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname
const read = (f) => JSON.parse(readFileSync(join(root, 'i18n', f), 'utf8'))
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`]))
const base = (k) => k.replace(/_(zero|one|two|few|many|other)$/, '')
const es = new Set(flat(read('es.json')).map(base))
const en = new Set(flat(read('en.json')).map(base))

const files = []
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f)
  if (statSync(p).isDirectory()) walk(p)
  else if (/\.(tsx?|mjs)$/.test(f) && !p.includes('database.types')) files.push(p)
})
walk(root)

const problems = []
const re = /\b(?:t|tr|tg|tKey|i18nKey=)\(?\s*["'`]([a-zA-Z][\w.]*?)["'`]/g
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(re)) {
    const key = m[1]
    if (!key.includes('.')) continue
    if (!es.has(key)) problems.push(`${f.replace(root, 'src/')}: missing in es.json → ${key}`)
    if (!en.has(key)) problems.push(`${f.replace(root, 'src/')}: missing in en.json → ${key}`)
  }
}
for (const k of es) if (!en.has(k)) problems.push(`only in es.json → ${k}`)
for (const k of en) if (!es.has(k)) problems.push(`only in en.json → ${k}`)

if (problems.length) {
  console.log(problems.join('\n'))
  process.exit(1)
}
console.log(`OK: ${es.size} keys in es and en, all keys used in code exist.`)
