import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageRoot({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  return <Fragment key={i18n.language}>{children}</Fragment>
}
