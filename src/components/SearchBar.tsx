import { useEffect, useMemo, useRef, useState } from 'react'
import { searchLocations } from '../lib/search'
import type { Location } from '../types/location'

interface SearchBarProps {
  locations: Location[]
  onSelect: (location: Location) => void
}

export default function SearchBar({ locations, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => searchLocations(locations, query), [locations, query])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  function choose(location: Location) {
    onSelect(location)
    setQuery(location.name)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(suggestions[active] ?? suggestions[0])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="search" ref={wrapRef}>
      <div className="search-box">
        <span className="search-pin" aria-hidden="true">
          📍
        </span>
        <input
          type="search"
          value={query}
          placeholder="Søk etter badeplass …"
          aria-label="Søk etter badeplass"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="search-submit"
          onClick={() => {
            if (suggestions.length > 0) choose(suggestions[0])
          }}
        >
          <span aria-hidden="true">🔍</span> Søk
        </button>
      </div>

      {open && query.trim().length > 0 && (
        <ul className="suggestions">
          {suggestions.length === 0 ? (
            <li className="suggestion empty">Ingen badeplasser matcher «{query.trim()}».</li>
          ) : (
            suggestions.map((location, index) => (
              <li key={location.id}>
                <button
                  type="button"
                  className={index === active ? 'suggestion active' : 'suggestion'}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(location)}
                >
                  <span className="suggestion-pin" aria-hidden="true">
                    📍
                  </span>
                  <span>
                    <strong>{location.name}</strong>
                    <span className="suggestion-sub">Badeplass</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
