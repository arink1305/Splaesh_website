import Metrics from '../components/Metrics'
import PhotoCard from '../components/PhotoCard'
import { useLocationDetails } from '../hooks/useLocationDetails'
import { calculateBathingScore } from '../lib/bathingScore'
import { resolveWarningSeverityForLocation } from '../lib/warningSeverity'
import type { BathingScoreProfile } from '../types/bathingScore'
import type { Location } from '../types/location'
import type { Warning } from '../types/warning'

interface FavoritesScreenProps {
  favorites: Location[]
  warnings: Warning[]
  profile: BathingScoreProfile
  pendingRemovalIds: number[]
  onTogglePendingRemoval: (id: number) => void
  onOpenOnMap: (location: Location) => void
}

export default function FavoritesScreen({
  favorites,
  warnings,
  profile,
  pendingRemovalIds,
  onTogglePendingRemoval,
  onOpenOnMap,
}: FavoritesScreenProps) {
  const { details } = useLocationDetails(favorites)

  return (
    <>
      <div className="screen-head">
        {favorites.length > 0 && (
          <span className="pill-badge">{favorites.length} lagrede</span>
        )}
        <h1>Favoritter</h1>
        <p>Dine favorittbadeplasser, klare med UV, sjøforhold og farestatus.</p>
      </div>

      {favorites.length === 0 ? (
        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              ♥
            </span>
            <div>
              <h3>Ingen favoritter ennå</h3>
              <p>Trykk hjertet på en badeplass for å lagre den her.</p>
            </div>
          </div>
        </section>
      ) : (
        <div className="cards">
          {favorites.map((location) => {
            const data = details[location.id] ?? null
            const severity = resolveWarningSeverityForLocation(
              location.latitude,
              location.longitude,
              warnings,
            )
            const score = data
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
              <PhotoCard
                key={location.id}
                location={location}
                favorite={!pendingRemovalIds.includes(location.id)}
                onToggleFavorite={() => onTogglePendingRemoval(location.id)}
                onOpenOnMap={() => onOpenOnMap(location)}
                pending={pendingRemovalIds.includes(location.id)}
              >
                {score && <p className="card-note">{score.summary}</p>}
                {data ? (
                  <Metrics
                    severity={severity}
                    seaInfo={data.seaInfo}
                    airTemperature={data.airTemperature}
                    uv={data.currentUv}
                  />
                ) : (
                  <p className="state">Henter liveinfo …</p>
                )}
              </PhotoCard>
            )
          })}
        </div>
      )}

      {pendingRemovalIds.length > 0 && (
        <p className="footnote">
          {pendingRemovalIds.length} favoritt
          {pendingRemovalIds.length === 1 ? '' : 'er'} fjernes når du forlater denne siden.
        </p>
      )}
    </>
  )
}
