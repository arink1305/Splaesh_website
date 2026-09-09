import { describe, expect, it } from 'vitest'
import { profileFromStorageKey } from '../types/bathingScore'

describe('profileFromStorageKey', () => {
  it('reads the stored profiles back', () => {
    expect(profileFromStorageKey('sol')).toBe('sol')
    expect(profileFromStorageKey('barnevennlig')).toBe('barnevennlig')
    expect(profileFromStorageKey('standard')).toBe('standard')
  })

  it('falls back to standard for anything unknown', () => {
    expect(profileFromStorageKey(null)).toBe('standard')
    expect(profileFromStorageKey(undefined)).toBe('standard')
    expect(profileFromStorageKey('tull')).toBe('standard')
  })
})
