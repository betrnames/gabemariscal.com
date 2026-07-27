export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'gm-theme'

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* private mode / blocked storage */
  }
  return null
}

/** Apply theme to <html>. Default is dark. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? 'dark'
}
