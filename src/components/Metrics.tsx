import { formatReading } from '../lib/format'
import { safetyStatus } from '../lib/status'
import type { SeaInfo } from '../types/ocean'

interface MetricsProps {
  severity: string
  seaInfo: SeaInfo | null
  airTemperature: number | null
  uv: number | null
}

export default function Metrics({ severity, seaInfo, airTemperature, uv }: MetricsProps) {
  const status = safetyStatus(severity)

  return (
    <div className="metrics">
      <div className={`metric ${status.tone === 'safe' ? '' : 'accent'}`}>
        <span className="m-icon" aria-hidden="true">
          🛡
        </span>
        <span className="m-value">{status.label}</span>
        <span className="m-label">Status</span>
      </div>
      <div className="metric accent">
        <span className="m-icon" aria-hidden="true">
          🌡
        </span>
        <span className="m-value">{formatReading(seaInfo?.waterTemperature, '°C')}</span>
        <span className="m-label">Vanntemperatur</span>
      </div>
      <div className="metric">
        <span className="m-icon" aria-hidden="true">
          ☀️
        </span>
        <span className="m-value">{formatReading(uv, '')}</span>
        <span className="m-label">UV</span>
      </div>
      <div className="metric">
        <span className="m-icon" aria-hidden="true">
          🌊
        </span>
        <span className="m-value">{formatReading(seaInfo?.waveHeight, 'm')}</span>
        <span className="m-label">Bølgehøyde</span>
      </div>
      <div className="metric">
        <span className="m-icon" aria-hidden="true">
          🌤
        </span>
        <span className="m-value">{formatReading(airTemperature, '°C')}</span>
        <span className="m-label">Lufttemperatur</span>
      </div>
      <div className="metric">
        <span className="m-icon" aria-hidden="true">
          🌀
        </span>
        <span className="m-value">{formatReading(seaInfo?.currentSpeed, 'm/s')}</span>
        <span className="m-label">Strøm</span>
      </div>
    </div>
  )
}
