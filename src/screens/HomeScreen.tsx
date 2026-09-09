import LayerToggles from '../components/LayerToggles'
import SearchBar from '../components/SearchBar'
import MapView, { type MapLayerToggles } from '../components/MapView'
import ScorePanel from '../components/ScorePanel'
import TimeScroller from '../components/TimeScroller'
import { usePlaceData } from '../hooks/usePlaceData'
import { calculateBathingScore } from '../lib/bathingScore'
import { wmsTimeAt } from '../lib/timeSteps'
import {
  resolveWarningSeverityForLocation,
  warningDescriptionForLocation,
} from '../lib/warningSeverity'
import type { BathingScoreProfile } from '../types/bathingScore'
import type { Location } from '../types/location'
import type { Warning } from '../types/warning'

interface HomeScreenProps {
  locations: Location[]
  warnings: Warning[]
  selected: Location | null
  onSelect: (location: Location | null) => void
  profile: BathingScoreProfile
  dark: boolean
  layers: MapLayerToggles
  onLayersChange: (layers: MapLayerToggles) => void
  baseTime: number
  selectedTimeIndex: number
  onTimeChange: (index: number) => void
  isFavorite: (id: number) => boolean
  onToggleFavorite: (id: number) => void
}

export default function HomeScreen({
  locations,
  warnings,
  selected,
  onSelect,
  profile,
  dark,
  layers,
  onLayersChange,
  baseTime,
  selectedTimeIndex,
  onTimeChange,
  isFavorite,
  onToggleFavorite,
}: HomeScreenProps) {
  const { data, loading, error } = usePlaceData(selected)

  const severity = selected
    ? resolveWarningSeverityForLocation(selected.latitude, selected.longitude, warnings)
    : 'green'

  const warningText = selected
    ? warningDescriptionForLocation(selected.latitude, selected.longitude, warnings)
    : null

  const score =
    data && selected
      ? calculateBathingScore({
          profile,
          warningSeverity: severity,
          waterTemperature: data.seaInfo?.waterTemperature ?? null,
          waveHeight: data.seaInfo?.waveHeight ?? null,
          currentSpeed: data.seaInfo?.currentSpeed ?? null,
          uvIndex: data.currentUv,
          airTemperature: data.airTemperature,
        })
      : null

  return (
    <>
      <div className="screen-head">
        <h1>Hjem</h1>
        <p>
          Badeforhold for {locations.length} badeplasser i Norge, med værkartlag og farevarsler
          direkte i kartet.
        </p>
      </div>

      <SearchBar locations={locations} onSelect={onSelect} />

      <LayerToggles layers={layers} onChange={onLayersChange} />

      <div className="map-frame">
        <MapView
          locations={locations}
          warnings={warnings}
          selectedId={selected?.id ?? null}
          onSelect={(id) => onSelect(locations.find((place) => place.id === id) ?? null)}
          dark={dark}
          layers={layers}
          wmsTime={wmsTimeAt(baseTime, selectedTimeIndex)}
          selectedTimeIndex={selectedTimeIndex}
        />
      </div>

      <div className="map-legend">
        <span className="legend-item">
          <img src="/brand/pin-blue.png" alt="" />
          Ingen farevarsel
        </span>
        <span className="legend-item">
          <img src="/brand/pin-yellow.png" alt="" />
          Gult varsel
        </span>
        <span className="legend-item">
          <img src="/brand/pin-red.png" alt="" />
          Oransje eller rødt varsel
        </span>
      </div>

      <TimeScroller
        baseTime={baseTime}
        selectedTimeIndex={selectedTimeIndex}
        onTimeChange={onTimeChange}
      />

      <div className="layout">
        <ul className="places">
          {locations.map((location) => (
            <li key={location.id} className="place-row">
              <button
                type="button"
                className="star"
                aria-pressed={isFavorite(location.id)}
                aria-label={`Favoritt: ${location.name}`}
                onClick={() => onToggleFavorite(location.id)}
              >
                {isFavorite(location.id) ? '★' : '☆'}
              </button>
              <button
                type="button"
                className="place-button"
                aria-current={selected?.id === location.id}
                onClick={() => onSelect(location)}
              >
                <span>{location.name}</span>
                <span className="meta">
                  {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="panel">
          {!selected && <p className="state">Velg en badeplass.</p>}
          {selected && (
            <ScorePanel
              location={selected}
              data={data}
              score={score}
              severity={severity}
              warningText={warningText}
              loading={loading}
              error={error}
            />
          )}
        </section>
      </div>
    </>
  )
}
