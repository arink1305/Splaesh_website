export interface UvResponse {
  latitude: number
  longitude: number
  timezone: string
  utc_offset_seconds?: number
  hourly?: { time: string[]; uv_index: number[] }
  daily?: { time: string[]; uv_index_max: number[] }
}
