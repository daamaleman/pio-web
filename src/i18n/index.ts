import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import en from './en.json'
import miq from './miq.json'

export const LANGS = ['es', 'en', 'miq'] as const
export type Lang = (typeof LANGS)[number]
const KEY = 'pio.lang'

export function isLang(value: unknown): value is Lang {
  return value === 'es' || value === 'en' || value === 'miq'
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage not available */
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, miq: { translation: miq } },
  lng: initialLang(),
  fallbackLng: { miq: ['es'], default: ['es'] },
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lang) => {
  document.documentElement.lang = lang
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* storage not available */
  }
})

export const t = i18n.t.bind(i18n)
// Untyped lookup for keys built at runtime
const tKey = t as unknown as (key: string) => string

// Dates: English for en; Nicaraguan Spanish for es and miq (Intl has no Miskitu)
export function locale(): string {
  return i18n.language === 'en' ? 'en-US' : 'es-NI'
}

// Language for lesson content stored as { es, en, miq? }: falls back to es
export function contentLang(): string {
  return i18n.language
}

// Record whose values are read from i18n every time (so they follow language changes).
// Works with Object.entries / Object.keys because the getters are enumerable.
export function tLabels<K extends string>(prefix: string, keys: readonly K[]): Record<K, string> {
  const out = {} as Record<K, string>
  for (const k of keys) Object.defineProperty(out, k, { get: () => tKey(`${prefix}.${k}`), enumerable: true })
  return out
}

export default i18n
