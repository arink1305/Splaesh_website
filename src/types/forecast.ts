export interface InstantDetails {
  air_temperature?: number
  wind_speed?: number
  wind_from_direction?: number
}

export interface NextHoursDetails {
  precipitation_amount?: number
  air_temperature_max?: number
  air_temperature_min?: number
}

export interface NextHours {
  summary?: { symbol_code?: string }
  details?: NextHoursDetails
}

export interface TimeSeries {
  time: string
  data: {
    instant: { details: InstantDetails }
    next_1_hours?: NextHours
    next_6_hours?: NextHours
    next_12_hours?: NextHours
  }
}

export interface ForecastResponse {
  type: string
  geometry: { type: string; coordinates: number[] }
  properties: {
    meta: { updated_at: string; units: Record<string, string | undefined> }
    timeseries: TimeSeries[]
  }
}

export interface DailyForecast {
  dateKey: string
  date: string
  tempMin: number
  tempMax: number
  precipitation: number
  windSpeed: number
  windDirection: number
  symbolCode: string | null
  uvMax: number | null
}
