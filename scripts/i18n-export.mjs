// Exports every portal text to translations.csv: key, es, en, miq.
// Open it in Excel, fill the "miq" column and bring it back with `npm run i18n:import`.
import { readFileSync, writeFileSync } from 'node:fs'

const load = (lang) => JSON.parse(readFileSync(`src/i18n/${lang}.json`, 'utf8'))

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (Array.isArray(v)) v.forEach((item, i) => (out[`${key}.${i}`] = String(item)))
    else if (v && typeof v === 'object') flatten(v, key, out)
    else out[key] = String(v)
  }
  return out
}

const es = flatten(load('es'))
const en = flatten(load('en'))
const miq = flatten(load('miq'))

const cell = (s = '') => `"${String(s).replace(/"/g, '""')}"`
const rows = [['key', 'es', 'en', 'miq'].map(cell).join(',')]
for (const key of Object.keys(es)) rows.push([key, es[key], en[key] ?? '', miq[key] ?? ''].map(cell).join(','))

// BOM so Excel opens it as UTF-8 (ñ, tildes)
writeFileSync('translations.csv', '\uFEFF' + rows.join('\r\n'), 'utf8')
console.log(`translations.csv: ${rows.length - 1} texts, ${Object.keys(miq).length} already in Miskitu`)
