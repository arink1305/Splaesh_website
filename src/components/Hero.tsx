import SearchBar from './SearchBar'
import type { GeoPlace } from '../types/geo'
import type { Location } from '../types/location'

interface HeroProps {
  locations: Location[]
  warningCount: number
  onSelectLocation: (location: Location) => void
  onSelectPlace: (place: GeoPlace) => void
}

export default function Hero({
  locations,
  warningCount,
  onSelectLocation,
  onSelectPlace,
}: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1>
          Finn din neste <span>badeplass</span>
        </h1>
        <p>
          {locations.length} badeplasser i Norge, med vanntemperatur, vær, UV og farevarsler samlet
          i én badescore.
        </p>

        <SearchBar
          locations={locations}
          onSelectLocation={onSelectLocation}
          onSelectPlace={onSelectPlace}
        />

        <p className="hero-meta">
          <span className="live-dot" aria-hidden="true" />
          Live fra Meteorologisk institutt
          {warningCount > 0 && ` · ${warningCount} aktive farevarsler`}
        </p>
      </div>

      <svg className="hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,64 C240,110 480,10 720,44 C960,78 1200,110 1440,72 L1440,120 L0,120 Z"
          className="wave-back"
        />
        <path
          d="M0,88 C260,46 520,116 780,84 C1040,52 1240,86 1440,64 L1440,120 L0,120 Z"
          className="wave-front"
        />
      </svg>
    </section>
  )
}
