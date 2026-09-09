import { profileFromStorageKey, type BathingScoreProfile } from '../types/bathingScore'

const DARK_KEY = 'splaesh.dark'
const PROFILE_KEY = 'splaesh.bathingScoreProfile'

export interface Settings {
  dark: boolean
  profile: BathingScoreProfile
}

export function prefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function readSettings(): Settings {
  try {
    const stored = window.localStorage.getItem(DARK_KEY)
    return {
      dark: stored === null ? prefersDark() : stored === 'true',
      profile: profileFromStorageKey(window.localStorage.getItem(PROFILE_KEY)),
    }
  } catch {
    return { dark: false, profile: 'standard' }
  }
}

export function writeSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(DARK_KEY, String(settings.dark))
    window.localStorage.setItem(PROFILE_KEY, settings.profile)
  } catch {
    return
  }
}

export function applyTheme(dark: boolean): void {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#1b1712' : '#fbf8f3')
}
