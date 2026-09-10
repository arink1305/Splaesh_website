import { useState } from 'react'
import type { Location } from '../types/location'

interface PhotoCardProps {
  location: Location
  overlay?: React.ReactNode
  favorite?: boolean
  onToggleFavorite?: () => void
  onOpenOnMap?: () => void
  scoreLabel?: string
  pending?: boolean
  children?: React.ReactNode
  liveLabel?: string
}

export default function PhotoCard({
  location,
  favorite,
  onToggleFavorite,
  onOpenOnMap,
  scoreLabel,
  pending,
  children,
  liveLabel = 'Vis liveinfo',
}: PhotoCardProps) {
  const [open, setOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <article className={pending ? 'photo-card pending' : 'photo-card'}>
      <div className="photo">
        {imageFailed || !location.image ? (
          <div className="photo-fallback" aria-hidden="true">
            🏖
          </div>
        ) : (
          <>
            {!imageLoaded && <span className="photo-skeleton" aria-hidden="true" />}
            <img
              src={location.image}
              alt={location.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          </>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            className="heart"
            aria-pressed={Boolean(favorite)}
            aria-label={favorite ? `Fjern ${location.name} fra favoritter` : `Lagre ${location.name}`}
            onClick={onToggleFavorite}
          >
            {favorite ? '♥' : '♡'}
          </button>
        )}

        {scoreLabel ? (
          <span className="score-pill">{scoreLabel}</span>
        ) : (
          onOpenOnMap && (
            <button type="button" className="photo-action" onClick={onOpenOnMap}>
              Gå til kart
            </button>
          )
        )}

        <div className="photo-title">
          <h3>{location.name}</h3>
          <p>Kreditering: {location.source}</p>
        </div>
      </div>

      <button type="button" className="liveinfo" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="dot" aria-hidden="true" />
        {open ? 'Skjul liveinfo' : liveLabel}
        <span className="chev" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && <div className="card-body">{children}</div>}
    </article>
  )
}
