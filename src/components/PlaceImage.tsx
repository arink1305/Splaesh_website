import { useEffect, useState } from 'react'

type Status = 'loading' | 'loaded' | 'failed'

const LOAD_TIMEOUT_MS = 15000

interface PlaceImageProps {
  src: string
  alt: string
  className?: string
}

export default function PlaceImage({ src, alt, className }: PlaceImageProps) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    setStatus('loading')
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'failed' : current))
    }, LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [src])

  if (!src || status === 'failed') return null

  return (
    <figure className={className ? `place-image ${className}` : 'place-image'}>
      {status === 'loading' && <span className="place-image-skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
      />
    </figure>
  )
}
