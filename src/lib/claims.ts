import type { AppRole } from './roles'

export type Claims = {
  sub: string
  email?: string
  app_role?: AppRole
  exp: number
}

// Reads the JWT payload to decide what to SHOW (menus, routes).
// It does not verify the signature: security is enforced by RLS and the
// functions in Postgres, never by the browser.
export function readClaims(accessToken: string): Claims | null {
  try {
    const part = accessToken.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as Claims
  } catch {
    return null
  }
}