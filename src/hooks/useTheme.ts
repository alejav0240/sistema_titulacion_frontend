import { useEffect, useState } from 'react'

function currentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Lee y refleja el tema real de <html>, así cualquier componente (incluidos
 * los que no controlan el toggle, como gráficos con JS options) se entera si
 * el tema cambia desde otro lugar de la app. */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(currentTheme)

  useEffect(() => {
    setTheme(currentTheme())
    const observer = new MutationObserver(() => setTheme(currentTheme()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
  }

  return { theme, toggle }
}
