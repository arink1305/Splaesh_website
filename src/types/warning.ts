export type Ring = Array<[number, number]>

export interface Warning {
  event: string
  severity: string
  area: string
  coordinates: Ring[]
  description: string
}

export interface MetAlertFeature {
  properties?: {
    event?: string
    description?: string
    area?: string
    awareness_level?: string
  }
  geometry?: {
    type?: string
    coordinates?: unknown
  }
}

export interface MetAlertsResponse {
  features?: MetAlertFeature[]
}
