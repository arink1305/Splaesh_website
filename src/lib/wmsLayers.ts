export const MEPS_HOURS = 60
const LONG_RANGE_STEP_HOURS = 6

export interface WmsLayerConfig {
  layerId: string
  sourceId: string
  layerName: string
  opacity: number
}

export function resolveTempLayerConfig(selectedTimeIndex: number): WmsLayerConfig {
  return {
    layerId: 'wms-temp-layer',
    sourceId: 'wms-temp-source',
    layerName:
      selectedTimeIndex <= MEPS_HOURS
        ? 'air_temperature_2m_meps_det_vdiv_2_5km_calculations'
        : 'air_temperature_2m_ec_sfc_3h_calculations',
    opacity: 0.5,
  }
}

export function resolveRainLayerConfig(selectedTimeIndex: number): WmsLayerConfig {
  return {
    layerId: 'wms-rain-layer',
    sourceId: 'wms-rain-source',
    layerName:
      selectedTimeIndex <= MEPS_HOURS
        ? 'precipitation_amount_1h_meps_det_vdiv_2_5km_calculations'
        : 'precipitation_amount_6h_ec_sfc_3h_calculations',
    opacity: 0.6,
  }
}

export function resolveWindLayerConfig(selectedTimeIndex: number): WmsLayerConfig {
  return {
    layerId: 'wms-wind-layer',
    sourceId: 'wms-wind-source',
    layerName:
      selectedTimeIndex <= MEPS_HOURS
        ? 'wind_10m_vector_meps_det_vdiv_2_5km_calculations'
        : 'wind_10m_vector_ec_sfc_3h_calculations',
    opacity: 0.6,
  }
}

export function snapToLongRangeStep(wmsTime: string): string {
  const match = /T(\d{2}):/.exec(wmsTime)
  if (!match) return wmsTime

  const hour = Number.parseInt(match[1], 10)
  if (Number.isNaN(hour)) return wmsTime

  const snappedHour = Math.floor(hour / LONG_RANGE_STEP_HOURS) * LONG_RANGE_STEP_HOURS
  return wmsTime.replace(/T\d{2}:00:00Z/, `T${String(snappedHour).padStart(2, '0')}:00:00Z`)
}

export function resolveRequestedTime(wmsTime: string, selectedTimeIndex: number): string {
  return selectedTimeIndex <= MEPS_HOURS ? wmsTime : snapToLongRangeStep(wmsTime)
}

export function buildWmsTileUrl(config: WmsLayerConfig, requestedTime: string): string {
  return (
    'https://public-victoria.met.no/wms?' +
    'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE' +
    `&STYLES=&LAYERS=${config.layerName}&CRS=EPSG:3857&WIDTH=256&HEIGHT=256` +
    `&BBOX={bbox-epsg-3857}&TIME=${requestedTime}`
  )
}

export function modelNotice(selectedTimeIndex: number): string {
  return selectedTimeIndex > MEPS_HOURS ? 'ECMWF 6t' : 'MEPS 1t'
}
