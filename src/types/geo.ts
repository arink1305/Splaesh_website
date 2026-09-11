export interface PhotonProperties {
  name?: string
  countrycode?: string
  osm_key?: string
  osm_value?: string
  county?: string
  state?: string
  city?: string
  district?: string
}

export interface PhotonFeature {
  geometry?: { coordinates?: number[] }
  properties?: PhotonProperties
}

export interface PhotonResponse {
  features?: PhotonFeature[]
}

export interface GeoPlace {
  name: string
  region: string
  kind: string
  latitude: number
  longitude: number
}
