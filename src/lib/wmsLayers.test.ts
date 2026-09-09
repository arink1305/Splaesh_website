import { describe, expect, it } from 'vitest'
import {
  MEPS_HOURS,
  buildWmsTileUrl,
  modelNotice,
  resolveRainLayerConfig,
  resolveRequestedTime,
  resolveTempLayerConfig,
  resolveWindLayerConfig,
  snapToLongRangeStep,
} from './wmsLayers'

describe('layer configs', () => {
  it('uses the MEPS layers up to and including hour 60', () => {
    expect(resolveTempLayerConfig(0).layerName).toContain('meps_det')
    expect(resolveTempLayerConfig(MEPS_HOURS).layerName).toContain('meps_det')
    expect(resolveRainLayerConfig(MEPS_HOURS).layerName).toBe(
      'precipitation_amount_1h_meps_det_vdiv_2_5km_calculations',
    )
    expect(resolveWindLayerConfig(MEPS_HOURS).layerName).toContain('meps_det')
  })

  it('switches to the ECMWF layers past hour 60', () => {
    expect(resolveTempLayerConfig(61).layerName).toBe('air_temperature_2m_ec_sfc_3h_calculations')
    expect(resolveRainLayerConfig(61).layerName).toBe(
      'precipitation_amount_6h_ec_sfc_3h_calculations',
    )
    expect(resolveWindLayerConfig(61).layerName).toBe('wind_10m_vector_ec_sfc_3h_calculations')
  })

  it('keeps source and layer ids stable across the model switch', () => {
    expect(resolveTempLayerConfig(0).sourceId).toBe(resolveTempLayerConfig(200).sourceId)
    expect(resolveTempLayerConfig(0).layerId).toBe(resolveTempLayerConfig(200).layerId)
  })

  it('keeps the opacities from the Android app', () => {
    expect(resolveTempLayerConfig(0).opacity).toBe(0.5)
    expect(resolveRainLayerConfig(0).opacity).toBe(0.6)
    expect(resolveWindLayerConfig(0).opacity).toBe(0.6)
  })
})

describe('snapToLongRangeStep', () => {
  it('snaps down to a six hour step', () => {
    expect(snapToLongRangeStep('2026-09-12T14:00:00Z')).toBe('2026-09-12T12:00:00Z')
    expect(snapToLongRangeStep('2026-09-12T05:00:00Z')).toBe('2026-09-12T00:00:00Z')
    expect(snapToLongRangeStep('2026-09-12T23:00:00Z')).toBe('2026-09-12T18:00:00Z')
  })

  it('leaves an already snapped time alone', () => {
    expect(snapToLongRangeStep('2026-09-12T18:00:00Z')).toBe('2026-09-12T18:00:00Z')
  })

  it('returns the input when it does not look like a step', () => {
    expect(snapToLongRangeStep('ikke en tid')).toBe('ikke en tid')
  })
})

describe('resolveRequestedTime', () => {
  it('passes the hourly time through inside the MEPS window', () => {
    expect(resolveRequestedTime('2026-09-12T14:00:00Z', MEPS_HOURS)).toBe('2026-09-12T14:00:00Z')
  })

  it('snaps outside the MEPS window', () => {
    expect(resolveRequestedTime('2026-09-12T14:00:00Z', 61)).toBe('2026-09-12T12:00:00Z')
  })
})

describe('buildWmsTileUrl', () => {
  it('keeps the bbox placeholder so the map can fill it in', () => {
    const url = buildWmsTileUrl(resolveTempLayerConfig(0), '2026-09-12T14:00:00Z')

    expect(url).toContain('BBOX={bbox-epsg-3857}')
    expect(url).toContain('CRS=EPSG:3857')
    expect(url).toContain('LAYERS=air_temperature_2m_meps_det_vdiv_2_5km_calculations')
    expect(url).toContain('TIME=2026-09-12T14:00:00Z')
  })
})

describe('modelNotice', () => {
  it('names the model behind the selected hour', () => {
    expect(modelNotice(0)).toBe('MEPS 1t')
    expect(modelNotice(MEPS_HOURS)).toBe('MEPS 1t')
    expect(modelNotice(61)).toBe('ECMWF 6t')
  })
})
