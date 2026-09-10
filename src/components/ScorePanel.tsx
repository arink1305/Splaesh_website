import { useEffect, useRef, useState } from 'react'
import Metrics from './Metrics'
import PlaceImage from './PlaceImage'
import { degreesToCompass } from '../lib/forecastAggregator'
import { useCountUp } from '../hooks/useCountUp'
import type { PlaceData } from '../data/placeData'
import type { BathingScore } from '../types/bathingScore'
import type { Location } from '../types/location'

interface ScorePanelProps {
  location: Location
  data: PlaceData | null
  score: BathingScore | null
  severity: string
  warningText: string | null
  loading: boolean
  error: string | null
}

function bandFor(score: number): 'good' | 'fair' | 'poor' {
  if (score >= 70) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function ScoreRing({ score, band }: { score: number; band: string }) {
  const shown = useCountUp(score)
  const [ring, setRing] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    raf.current = requestAnimationFrame(() => setRing(score * 3.6))
    return () => cancelAnimationFrame(raf.current)
  }, [score])

  const color = band === 'good' ? 'var(--safe)' : band === 'fair' ? 'var(--warn)' : 'var(--danger)'

  return (
    <span
      className="score-ring"
      style={{ '--ring': ring, '--ring-color': color } as React.CSSProperties}
    >
      <span className="score-ring-inner">{shown}</span>
    </span>
  )
}

export default function ScorePanel({
  location,
  data,
  score,
  severity,
  warningText,
  loading,
  error,
}: ScorePanelProps) {
  const band = score && !score.isUnavailable ? bandFor(score.score) : 'fair'

  return (
    <>
      <h2>{location.name}</h2>
      <p className="source">Kreditering: {location.source}</p>

      <PlaceImage src={location.image} alt={location.name} />

      {loading && <p className="state">Henter vær-, sjø- og UV-data …</p>}
      {error && <p className="state error">Kunne ikke hente data: {error}</p>}

      {score && data && (
        <>
          <div className="score-row">
            {score.isUnavailable ? (
              <span className="score-ring">
                <span className="score-ring-inner">–</span>
              </span>
            ) : (
              <ScoreRing score={score.score} band={band} />
            )}
            <span>
              <span className={`verdict ${band}`}>{score.label}</span>
              <br />
              <span className="state">{score.summary}</span>
            </span>
          </div>

          <ul className="reasons">
            <li>{score.primaryReason}</li>
            {score.secondaryReason && <li>{score.secondaryReason}</li>}
            {warningText && <li>{warningText}</li>}
          </ul>

          <Metrics
            severity={severity}
            seaInfo={data.seaInfo}
            airTemperature={data.airTemperature}
            uv={data.currentUv}
          />

          <div className="forecast">
            <table>
              <thead>
                <tr>
                  <th>Dato</th>
                  <th>Min</th>
                  <th>Maks</th>
                  <th>Nedbør</th>
                  <th>Vind</th>
                  <th>UV</th>
                </tr>
              </thead>
              <tbody>
                {data.forecasts.map((day) => (
                  <tr key={day.dateKey}>
                    <td>{day.date}</td>
                    <td>{day.tempMin} °</td>
                    <td>{day.tempMax} °</td>
                    <td>{day.precipitation} mm</td>
                    <td>
                      {day.windSpeed} m/s {degreesToCompass(day.windDirection)}
                    </td>
                    <td>{day.uvMax ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
