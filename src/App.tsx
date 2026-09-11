import { useEffect, useMemo, useRef, useState } from 'react'
import Hero from './components/Hero'
import type { FlyTarget, MapLayerToggles } from './components/MapView'
import SiteFooter from './components/SiteFooter'
import { getLocations } from './data/locations'
import { useFavorites } from './hooks/useFavorites'
import { useSettings } from './hooks/useSettings'
import { useWarnings } from './hooks/useWarnings'
import { createBaseTime } from './lib/timeSteps'
import FavoritesScreen from './screens/FavoritesScreen'
import HomeScreen from './screens/HomeScreen'
import RecommendationsScreen from './screens/RecommendationsScreen'
import SettingsScreen from './screens/SettingsScreen'
import type { GeoPlace } from './types/geo'
import type { Location } from './types/location'

type Tab = 'favorites' | 'home' | 'recommendations' | 'settings'

const TABS: Array<[Tab, string, string]> = [
  ['favorites', '♥', 'Favoritter'],
  ['home', '⌂', 'Hjem'],
  ['recommendations', '★', 'Anbefalinger'],
  ['settings', '⚙', 'Innstillinger'],
]

export default function App() {
  const locations = useMemo(getLocations, [])
  const baseTime = useMemo(() => createBaseTime(), [])

  const [tab, setTab] = useState<Tab>('home')
  const [selected, setSelected] = useState<Location | null>(locations[0] ?? null)
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0)
  const [radiusKm, setRadiusKm] = useState(5)
  const [pendingRemovalIds, setPendingRemovalIds] = useState<number[]>([])
  const [mapFocus, setMapFocus] = useState(0)
  const [selectionNonce, setSelectionNonce] = useState(0)
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const [layers, setLayers] = useState<MapLayerToggles>({
    temp: false,
    rain: false,
    wind: false,
    warnings: true,
  })

  const { warnings } = useWarnings()
  const { settings, update, toggleTheme } = useSettings()
  const { favoriteIds, toggle, removeMany, isFavorite } = useFavorites()

  const previousTab = useRef<Tab>(tab)
  const navRef = useRef<HTMLElement>(null)
  const skipTopScroll = useRef(false)

  useEffect(() => {
    if (previousTab.current === 'favorites' && tab !== 'favorites' && pendingRemovalIds.length > 0) {
      removeMany(pendingRemovalIds)
      setPendingRemovalIds([])
    }
    previousTab.current = tab
  }, [tab, pendingRemovalIds, removeMany])

  useEffect(() => {
    if (skipTopScroll.current) {
      skipTopScroll.current = false
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [tab])

  const favorites = useMemo(
    () => locations.filter((location) => favoriteIds.includes(location.id)),
    [locations, favoriteIds],
  )

  function selectPlace(location: Location | null) {
    setSelected(location)
    setSelectionNonce((value) => value + 1)
  }

  function selectGeoPlace(place: GeoPlace) {
    setFlyTarget((current) => ({
      latitude: place.latitude,
      longitude: place.longitude,
      nonce: (current?.nonce ?? 0) + 1,
    }))
    setMapFocus((value) => value + 1)
  }

  function openOnMap(location: Location) {
    skipTopScroll.current = true
    selectPlace(location)
    setTab('home')
    setMapFocus((value) => value + 1)
  }

  function selectFromSearch(location: Location) {
    selectPlace(location)
    setMapFocus((value) => value + 1)
  }


  function togglePendingRemoval(id: number) {
    setPendingRemovalIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  return (
    <div className="page">
      <header className="appbar">
        <div className="appbar-inner">
          <button
            type="button"
            className="brand"
            onClick={() => setTab('home')}
            aria-label="Splæsh — gå til hjem"
          >
            <img className="brand-logo" src="/brand/logo.png" alt="" />
            <span className="brand-word">Splæsh</span>
          </button>

          <nav className="topnav" ref={navRef}>
            {TABS.map(([key, icon, label]) => (
              <button
                key={key}
                type="button"
                className="nav-item"
                aria-current={tab === key}
                onClick={() => setTab(key)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {icon}
                </span>
                {label}
                {key === 'favorites' && favorites.length > 0 && (
                  <span className="nav-count">{favorites.length}</span>
                )}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-pressed={settings.dark}
            aria-label={settings.dark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
            title={settings.dark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
          >
            <span aria-hidden="true">{settings.dark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      {tab === 'home' && (
        <Hero
          locations={locations}
          warningCount={warnings.length}
          onSelectLocation={selectFromSearch}
          onSelectPlace={selectGeoPlace}
        />
      )}

      <main className="shell">
        <div className="screen" key={tab}>
          {tab === 'home' && (
            <HomeScreen
              locations={locations}
              warnings={warnings}
              selected={selected}
              onSelect={selectPlace}
              selectionNonce={selectionNonce}
              flyTarget={flyTarget}
              profile={settings.profile}
              dark={settings.dark}
              layers={layers}
              onLayersChange={setLayers}
              baseTime={baseTime}
              selectedTimeIndex={selectedTimeIndex}
              onTimeChange={setSelectedTimeIndex}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              mapFocus={mapFocus}
            />
          )}

          {tab === 'favorites' && (
            <FavoritesScreen
              favorites={favorites}
              warnings={warnings}
              profile={settings.profile}
              pendingRemovalIds={pendingRemovalIds}
              onTogglePendingRemoval={togglePendingRemoval}
              onOpenOnMap={openOnMap}
            />
          )}

          {tab === 'recommendations' && (
            <RecommendationsScreen
              warnings={warnings}
              profile={settings.profile}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              onOpenOnMap={openOnMap}
            />
          )}

          {tab === 'settings' && (
            <SettingsScreen
              dark={settings.dark}
              onDarkChange={(dark) => update({ dark })}
              profile={settings.profile}
              onProfileChange={(profile) => update({ profile })}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
