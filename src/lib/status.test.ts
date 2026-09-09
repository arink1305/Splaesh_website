import { describe, expect, it } from 'vitest'
import { safetyStatus } from './status'

describe('safetyStatus', () => {
  it('calls a place without warnings safe', () => {
    expect(safetyStatus('green')).toEqual({ label: 'Trygt', tone: 'safe' })
  })

  it('warns on a yellow alert', () => {
    expect(safetyStatus('gul')).toEqual({ label: 'Vær obs', tone: 'warn' })
    expect(safetyStatus('Yellow')).toEqual({ label: 'Vær obs', tone: 'warn' })
  })

  it('escalates orange and red', () => {
    expect(safetyStatus('oransje').tone).toBe('danger')
    expect(safetyStatus('rød')).toEqual({ label: 'Frarådes', tone: 'danger' })
  })
})
