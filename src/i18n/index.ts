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

// Dates: English for en; Nicaraguan Spanish for es and miq (Intl has no Miskitu)
export function locale(): string {
  return i18n.language === 'en' ? 'en-US' : 'es-NI'
}

export default i18n
