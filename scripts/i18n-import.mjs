// Reads translations.csv (after the translators fill the "miq" column) and writes src/i18n/miq.json.
// Empty cells are skipped: those texts keep showing in Spanish.
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const file = process.argv[2] ?? 'translations.csv'
const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')

// Excel saves CSV with "," or ";" depending on the computer's region
const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ','

function parse(src) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === delimiter) { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

const [header, ...rows] = parse(text)
const keyCol = header.indexOf('key')
const miqCol = header.indexOf('miq')
if (keyCol < 0 || miqCol < 0) throw new Error('The CSV needs "key" and "miq" columns')

const out = {}
let count = 0
for (const r of rows) {
  const key = r[keyCol]?.trim()
  const value = r[miqCol]?.trim()
  if (!key || !value) continue
  const parts = key.split('.')
  let node = out
  parts.slice(0, -1).forEach((p) => (node = node[p] ??= {}))
  node[parts.at(-1)] = value
  count++
}

writeFileSync('src/i18n/miq.json', JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`src/i18n/miq.json: ${count} texts in Miskitu`)
