import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { searchLocations } from '../lib/search'
import type { GeoPlace } from '../types/geo'
import type { Location } from '../types/location'

interface SearchBarProps {
  locations: Location[]
  onSelectLocation: (location: Location) => void
  onSelectPlace: (place: GeoPlace) => void
}

type Row =
  | { kind: 'location'; location: Location }
  | { kind: 'place'; place: GeoPlace }

export default function SearchBar({
  locations,
  onSelectLocation,
  onSelectPlace,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => searchLocations(locations, query), [locations, query])
  const { places, loading } = usePlaceSearch(query)

  const rows = useMemo<Row[]>(
    () => [
      ...matches.map((location) => ({ kind: 'location' as const, location })),
      ...places.map((place) => ({ kind: 'place' as const, place })),
    ],
    [matches, places],
  )

  useEffect(() => {
    setActive(0)
  }, [rows.length])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  function choose(row: Row) {
    if (row.kind === 'location') {
      onSelectLocation(row.location)
      setQuery(row.location.name)
    } else {
      onSelectPlace(row.place)
      setQuery(row.place.name)
    }
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || rows.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % rows.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + rows.length) % rows.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(rows[active] ?? rows[0])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const trimmed = query.trim()

  return (
    <div className="search" ref={wrapRef}>
      <div className="search-box">
        <span className="search-pin" aria-hidden="true">
          📍
        </span>
        <input
          type="search"
          value={query}
          placeholder="Søk etter badeplass eller sted …"
          aria-label="Søk etter badeplass eller sted"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="search-submit"
          onClick={() => {
            if (rows.length > 0) choose(rows[0])
          }}
        >
          <span aria-hidden="true">🔍</span> Søk
        </button>
      </div>

      {open && trimmed.length > 0 && (
        <ul className="suggestions">
          {matches.length > 0 && <li className="suggestion-group">Badeplasser</li>}
          {matches.map((location, index) => (
            <li key={`l-${location.id}`}>
              <button
                type="button"
                className={index === active ? 'suggestion active' : 'suggestion'}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose({ kind: 'location', location })}
              >
                <span className="suggestion-pin" aria-hidden="true">
                  🏖
                </span>
                <span>
                  <strong>{location.name}</strong>
                  <span className="suggestion-sub">Badeplass</span>
                </span>
              </button>
            </li>
          ))}

          {(places.length > 0 || loading) && <li className="suggestion-group">Steder</li>}
          {places.map((place, index) => {
            const rowIndex = matches.length + index
            return (
              <li key={`p-${place.name}-${place.latitude}-${place.longitude}`}>
                <button
                  type="button"
                  className={rowIndex === active ? 'suggestion active' : 'suggestion'}
                  onMouseEnter={() => setActive(rowIndex)}
                  onClick={() => choose({ kind: 'place', place })}
                >
                  <span className="suggestion-pin" aria-hidden="true">
                    📍
                  </span>
                  <span>
                    <strong>{place.name}</strong>
                    <span className="suggestion-sub">
                      {place.kind} · {place.region}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}

          {loading && places.length === 0 && (
            <li className="suggestion empty">Søker etter steder …</li>
          )}

          {!loading && rows.length === 0 && (
            <li className="suggestion empty">Ingen treff på «{trimmed}».</li>
          )}
        </ul>
      )}
    </div>
  )
}
