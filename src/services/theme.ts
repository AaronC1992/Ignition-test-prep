import type { ThemeMode } from '../types/app'

export const getSystemTheme = (): ThemeMode =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme
}
