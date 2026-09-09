import { useEffect, useMemo, useRef, useState } from 'react'
import type { MapLayerToggles } from './components/MapView'
import { getLocations } from './data/locations'
import { useFavorites } from './hooks/useFavorites'
import { useSettings } from './hooks/useSettings'
import { useWarnings } from './hooks/useWarnings'
import { createBaseTime } from './lib/timeSteps'
import FavoritesScreen from './screens/FavoritesScreen'
import HomeScreen from './screens/HomeScreen'
import RecommendationsScreen from './screens/RecommendationsScreen'
import SettingsScreen from './screens/SettingsScreen'
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
  const [layers, setLayers] = useState<MapLayerToggles>({
    temp: false,
    rain: false,
    wind: false,
    warnings: true,
  })

  const { warnings, loading: warningsLoading } = useWarnings()
  const { settings, update, toggleTheme } = useSettings()
  const { favoriteIds, toggle, removeMany, isFavorite } = useFavorites()

  const previousTab = useRef<Tab>(tab)

  useEffect(() => {
    if (previousTab.current === 'favorites' && tab !== 'favorites' && pendingRemovalIds.length > 0) {
      removeMany(pendingRemovalIds)
      setPendingRemovalIds([])
    }
    previousTab.current = tab
  }, [tab, pendingRemovalIds, removeMany])

  const favorites = useMemo(
    () => locations.filter((location) => favoriteIds.includes(location.id)),
    [locations, favoriteIds],
  )

  function openOnMap(location: Location) {
    setSelected(location)
    setTab('home')
  }

  return (
    <div className="shell">
      <header className="appbar">
        <p className="brand">
          <img className="brand-logo" src="/brand/logo.png" alt="" />
          <span className="brand-word">Splæsh</span>
        </p>

        <nav className="topnav">
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
      </header>

      {tab === 'home' && (
        <HomeScreen
          locations={locations}
          warnings={warnings}
          selected={selected}
          onSelect={setSelected}
          profile={settings.profile}
          dark={settings.dark}
          layers={layers}
          onLayersChange={setLayers}
          baseTime={baseTime}
          selectedTimeIndex={selectedTimeIndex}
          onTimeChange={setSelectedTimeIndex}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
        />
      )}

      {tab === 'favorites' && (
        <FavoritesScreen
          favorites={favorites}
          warnings={warnings}
          profile={settings.profile}
          pendingRemovalIds={pendingRemovalIds}
          onTogglePendingRemoval={(id) =>
            setPendingRemovalIds((current) =>
              current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
            )
          }
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

      <p className="footnote">
        {warningsLoading
          ? 'Henter farevarsler …'
          : `${warnings.length} aktive farevarsler fra MET Alerts.`}{' '}
        Kartlag fra Victoria WMS. Data fra Meteorologisk institutt (Locationforecast, Oceanforecast,
        MET Alerts) og Open-Meteo. Bakgrunnskart © OpenStreetMap-bidragsytere © CARTO.
      </p>
    </div>
  )
}
