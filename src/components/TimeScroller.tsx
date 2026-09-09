import { useEffect, useRef } from 'react'
import {
  dayOffsetOf,
  formatDayLabel,
  formatHour,
  hourOf,
  timeIndexFor,
} from '../lib/timeSteps'
import { modelNotice } from '../lib/wmsLayers'

interface TimeScrollerProps {
  baseTime: number
  selectedTimeIndex: number
  onTimeChange: (index: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

export default function TimeScroller({
  baseTime,
  selectedTimeIndex,
  onTimeChange,
}: TimeScrollerProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const dayOffset = dayOffsetOf(selectedTimeIndex)
  const hour = hourOf(selectedTimeIndex)

  useEffect(() => {
    const strip = stripRef.current
    const active = strip?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (strip && active) {
      strip.scrollTo({
        left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [selectedTimeIndex])

  return (
    <div className="scroller">
      <div className="scroller-head">
        <button
          type="button"
          className="arrow"
          disabled={dayOffset === 0}
          aria-label="Forrige dag"
          onClick={() => onTimeChange(timeIndexFor(dayOffset - 1, hour))}
        >
          ‹
        </button>

        <div className="scroller-title">
          <strong>{formatDayLabel(baseTime, selectedTimeIndex)}</strong>
          <span className={selectedTimeIndex > 60 ? 'model long' : 'model'}>
            {modelNotice(selectedTimeIndex)}
          </span>
        </div>

        <button
          type="button"
          className="arrow"
          disabled={dayOffset === 9}
          aria-label="Neste dag"
          onClick={() => onTimeChange(timeIndexFor(dayOffset + 1, hour))}
        >
          ›
        </button>
      </div>

      <div className="hours" ref={stripRef}>
        {HOURS.map((value) => (
          <button
            key={value}
            type="button"
            className="hour"
            aria-pressed={value === hour}
            onClick={() => onTimeChange(timeIndexFor(dayOffset, value))}
          >
            {formatHour(value)}
          </button>
        ))}
      </div>
    </div>
  )
}
