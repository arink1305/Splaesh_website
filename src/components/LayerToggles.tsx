import type { MapLayerToggles } from './MapView'

interface LayerTogglesProps {
  layers: MapLayerToggles
  onChange: (layers: MapLayerToggles) => void
}

const LABELS: Array<[keyof MapLayerToggles, string, string]> = [
  ['temp', '🌡', 'Temperatur'],
  ['rain', '🌧', 'Nedbør'],
  ['wind', '💨', 'Vind'],
  ['warnings', '⚠️', 'Farevarsler'],
]

export default function LayerToggles({ layers, onChange }: LayerTogglesProps) {
  return (
    <div className="controls">
      <span className="label">
        <img src="/brand/meteorology.png" alt="" className="label-icon" />
        Kartlag
      </span>
      {LABELS.map(([key, emoji, label]) => (
        <button
          key={key}
          type="button"
          className="chip"
          aria-pressed={layers[key]}
          onClick={() => onChange({ ...layers, [key]: !layers[key] })}
        >
          <span className="chip-emoji" aria-hidden="true">
            {emoji}
          </span>
          {label}
        </button>
      ))}
    </div>
  )
}
