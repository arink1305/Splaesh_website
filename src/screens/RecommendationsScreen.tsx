import Metrics from '../components/Metrics'
import PhotoCard from '../components/PhotoCard'
import { useRecommendations } from '../hooks/useRecommendations'
import { useUserPosition } from '../hooks/useUserPosition'
import { formatDistanceKm } from '../lib/format'
import type { BathingScoreProfile } from '../types/bathingScore'
import type { Location } from '../types/location'
import type { Warning } from '../types/warning'

const RADIUS_OPTIONS = [2, 5, 10, 20]

interface RecommendationsScreenProps {
  warnings: Warning[]
  profile: BathingScoreProfile
  radiusKm: number
  onRadiusChange: (radiusKm: number) => void
  isFavorite: (id: number) => boolean
  onToggleFavorite: (id: number) => void
  onOpenOnMap: (location: Location) => void
}

export default function RecommendationsScreen({
  warnings,
  profile,
  radiusKm,
  onRadiusChange,
  isFavorite,
  onToggleFavorite,
  onOpenOnMap,
}: RecommendationsScreenProps) {
  const { position, status, request } = useUserPosition()
  const { recommendations, loading } = useRecommendations(position, radiusKm, warnings, profile)

  return (
    <>
      <div className="screen-head">
        {position && recommendations.length > 0 && (
          <span className="pill-badge">{recommendations.length} innenfor {radiusKm} km</span>
        )}
        <h1>Anbefalinger</h1>
        <p>Badeplasser nær deg, rangert etter badescore og avstand.</p>
      </div>

      <div className="controls">
        <span className="label">Radius</span>
        {RADIUS_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            aria-pressed={option === radiusKm}
            onClick={() => onRadiusChange(option)}
          >
            {option} km
          </button>
        ))}
      </div>

      {!position && (
        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              📍
            </span>
            <div>
              <h3>Anbefalinger nær deg</h3>
              <p>
                {status === 'denied'
                  ? 'Vi fikk ikke tilgang til posisjonen din. Gi tilgang i nettleseren og prøv igjen.'
                  : status === 'unsupported'
                    ? 'Nettleseren din støtter ikke posisjonstjenester.'
                    : 'Splæsh trenger posisjonen din for å rangere badeplasser etter avstand og badescore.'}
              </p>
            </div>
          </div>
          <div className="segmented" style={{ gridTemplateColumns: '1fr' }}>
            <button
              type="button"
              aria-pressed="true"
              disabled={status === 'locating'}
              onClick={request}
            >
              {status === 'locating' ? 'Finner posisjon …' : 'Gi tilgang'}
            </button>
          </div>
        </section>
      )}

      {position && loading && (
        <section className="card">
          <p className="state">Vurderer badeplasser innenfor {radiusKm} km …</p>
        </section>
      )}

      {position && !loading && recommendations.length === 0 && (
        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              🔍
            </span>
            <div>
              <h3>Ingen treff innenfor {radiusKm} km</h3>
              <p>Prøv en større radius for å få anbefalte badeplasser.</p>
            </div>
          </div>
        </section>
      )}

      {position && !loading && recommendations.length > 0 && (
        <div className="cards">
          {recommendations.map((recommendation) => (
            <PhotoCard
              key={recommendation.location.id}
              location={recommendation.location}
              favorite={isFavorite(recommendation.location.id)}
              onToggleFavorite={() => onToggleFavorite(recommendation.location.id)}
              scoreLabel={`${recommendation.score.score}/100`}
              liveLabel={`${formatDistanceKm(recommendation.distanceKm)} unna`}
            >
              <p className="card-note">{recommendation.score.primaryReason}</p>
              <Metrics
                severity={recommendation.warningSeverity}
                seaInfo={recommendation.seaInfo}
                airTemperature={recommendation.airTemperature}
                uv={recommendation.uvValue}
              />
              <div className="segmented" style={{ gridTemplateColumns: '1fr' }}>
                <button
                  type="button"
                  aria-pressed="true"
                  onClick={() => onOpenOnMap(recommendation.location)}
                >
                  Gå til kart
                </button>
              </div>
            </PhotoCard>
          ))}
        </div>
      )}
    </>
  )
}
