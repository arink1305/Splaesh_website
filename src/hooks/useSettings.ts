import { useCallback, useEffect, useState } from 'react'
import { applyTheme, prefersDark, readSettings, writeSettings, type Settings } from '../state/settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({
    dark: false,
    profile: 'standard',
  }))

  useEffect(() => {
    const stored = readSettings()
    setSettings(stored)
    applyTheme(stored.dark)
  }, [])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      writeSettings(next)
      if (patch.dark !== undefined) applyTheme(next.dark)
      return next
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((current) => {
      const next = { ...current, dark: !current.dark }
      writeSettings(next)
      applyTheme(next.dark)
      return next
    })
  }, [])

  return { settings, update, toggleTheme, systemPrefersDark: prefersDark() }
}
