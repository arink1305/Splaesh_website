import {
  GeolocateControl,
  MapLibreMap,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type RasterTileSource,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(maplibreWorkerUrl)
import { useEffect, useRef, useState } from 'react'
import { locationsToGeoJson, warningsToGeoJson } from '../lib/geojson'
import {
  buildWmsTileUrl,
  resolveRainLayerConfig,
  resolveRequestedTime,
  resolveTempLayerConfig,
  resolveWindLayerConfig,
  type WmsLayerConfig,
} from '../lib/wmsLayers'
import { regionOfLocation } from '../lib/place'
import type { Location } from '../types/location'
import type { Warning } from '../types/warning'

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const PIN_FILES: Record<string, string> = {
  blue: 'pins/badepin3.png',
  yellow: 'pins/badepin2.png',
  red: 'pins/badepin1.png',
}

export interface MapLayerToggles {
  temp: boolean
  rain: boolean
  wind: boolean
  warnings: boolean
}

interface MapViewProps {
  locations: Location[]
  warnings: Warning[]
  selectedId: number | null
  onSelect: (id: number) => void
  dark: boolean
  layers: MapLayerToggles
  wmsTime: string
  selectedTimeIndex: number
  selectionNonce: number
  waterLabel: string
  onShowDetails: () => void
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Kunne ikke laste ${src}`))
    image.src = src
  })
}

async function ensurePinImages(map: MapLibreMap): Promise<void> {
  await Promise.all(
    Object.entries(PIN_FILES).map(async ([name, file]) => {
      if (map.hasImage(name)) return
      const image = await loadImageElement(`${import.meta.env.BASE_URL}${file}`)
      if (!map.hasImage(name)) map.addImage(name, image)
    }),
  )
}

function firstSymbolLayerId(map: MapLibreMap): string | undefined {
  return map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
}

function ensureRasterLayer(
  map: MapLibreMap,
  config: WmsLayerConfig,
  tileUrl: string,
  visible: boolean,
  beforeId: string | undefined,
): void {
  if (!map.getSource(config.sourceId)) {
    map.addSource(config.sourceId, { type: 'raster', tiles: [tileUrl], tileSize: 256 })
  }

  if (!map.getLayer(config.layerId)) {
    map.addLayer(
      {
        id: config.layerId,
        type: 'raster',
        source: config.sourceId,
        paint: { 'raster-opacity': config.opacity },
        layout: { visibility: visible ? 'visible' : 'none' },
      },
      beforeId,
    )
  }
}


const PIN_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'

const WAVE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7.5c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 0"/><path d="M2 13c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 0"/><path d="M2 18.5c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 0"/></svg>'

function buildPopupContent(location: Location, water: string, onDetails: () => void): HTMLElement {
  const root = document.createElement('div')
  root.className = 'mp'
  root.innerHTML = `
    <button type="button" class="mp-close" aria-label="Lukk">&times;</button>
    <h3 class="mp-title"></h3>
    <p class="mp-region"><span class="mp-icon">${PIN_ICON}</span><span class="mp-region-text"></span></p>
    <span class="mp-badge"><span class="mp-icon">${WAVE_ICON}</span><span class="mp-badge-text"></span></span>
    <button type="button" class="mp-cta">Se detaljer</button>
  `
  root.querySelector('.mp-title')!.textContent = location.name
  root.querySelector('.mp-region-text')!.textContent = regionOfLocation(location)
  root.querySelector('.mp-badge-text')!.textContent = water
  root.querySelector('.mp-cta')!.addEventListener('click', onDetails)
  return root
}

export default function MapView({
  locations,
  warnings,
  selectedId,
  onSelect,
  dark,
  layers,
  wmsTime,
  selectedTimeIndex,
  selectionNonce,
  waterLabel,
  onShowDetails,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<Popup | null>(null)
  const onShowDetailsRef = useRef(onShowDetails)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onSelectRef = useRef(onSelect)
  const appliedDarkRef = useRef(dark)
  const [styleEpoch, setStyleEpoch] = useState(0)
  const [ready, setReady] = useState(false)

  onSelectRef.current = onSelect
  onShowDetailsRef.current = onShowDetails

  useEffect(() => {
    if (!containerRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: dark ? DARK_STYLE : LIGHT_STYLE,
      center: [10.7, 59.9],
      zoom: 8,
      attributionControl: { compact: true },
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }),
      'top-right',
    )

    map.on('style.load', () => {
      map.resize()
      setReady(true)
      setStyleEpoch((value) => value + 1)
    })

    map.on('click', 'places', (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id
      if (typeof id === 'number') onSelectRef.current(id)
    })

    map.on('click', (event: MapLayerMouseEvent) => {
      if (!map.getLayer('places')) return
      const onPin = map.queryRenderedFeatures(event.point, { layers: ['places'] })
      if (onPin.length === 0) popupRef.current?.remove()
    })
    map.on('mouseenter', 'places', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = ''
    })

    mapRef.current = map

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || appliedDarkRef.current === dark) return
    appliedDarkRef.current = dark
    setReady(false)
    map.setStyle(dark ? DARK_STYLE : LIGHT_STYLE)
  }, [dark])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    let cancelled = false

    void (async () => {
      await ensurePinImages(map)
      if (cancelled || !mapRef.current) return

      const beforeId = firstSymbolLayerId(map)
      const requestedTime = resolveRequestedTime(wmsTime, selectedTimeIndex)

      ensureRasterLayer(
        map,
        resolveTempLayerConfig(selectedTimeIndex),
        buildWmsTileUrl(resolveTempLayerConfig(selectedTimeIndex), requestedTime),
        layers.temp,
        beforeId,
      )
      ensureRasterLayer(
        map,
        resolveRainLayerConfig(selectedTimeIndex),
        buildWmsTileUrl(resolveRainLayerConfig(selectedTimeIndex), requestedTime),
        layers.rain,
        beforeId,
      )
      ensureRasterLayer(
        map,
        resolveWindLayerConfig(selectedTimeIndex),
        buildWmsTileUrl(resolveWindLayerConfig(selectedTimeIndex), requestedTime),
        layers.wind,
        beforeId,
      )

      if (!map.getSource('warnings')) {
        map.addSource('warnings', { type: 'geojson', data: warningsToGeoJson(warnings) })
      }
      if (!map.getLayer('warnings-fill')) {
        map.addLayer({
          id: 'warnings-fill',
          type: 'fill',
          source: 'warnings',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.4 },
          layout: { visibility: layers.warnings ? 'visible' : 'none' },
        })
      }
      if (!map.getLayer('warnings-line')) {
        map.addLayer({
          id: 'warnings-line',
          type: 'line',
          source: 'warnings',
          paint: { 'line-color': ['get', 'color'], 'line-width': 1.2, 'line-opacity': 0.9 },
          layout: { visibility: layers.warnings ? 'visible' : 'none' },
        })
      }

      if (!map.getSource('places')) {
        map.addSource('places', {
          type: 'geojson',
          data: locationsToGeoJson(locations, warnings, selectedId),
        })
      }
      if (!map.getLayer('places')) {
        map.addLayer({
          id: 'places',
          type: 'symbol',
          source: 'places',
          layout: {
            'icon-image': ['get', 'pin'],
            'icon-size': ['case', ['boolean', ['get', 'selected'], false], 0.5, 0.3],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
          },
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [styleEpoch, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const places = map.getSource('places') as GeoJSONSource | undefined
    places?.setData(locationsToGeoJson(locations, warnings, selectedId))

    const warningSource = map.getSource('warnings') as GeoJSONSource | undefined
    warningSource?.setData(warningsToGeoJson(warnings))
  }, [locations, warnings, selectedId, ready, styleEpoch])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const requestedTime = resolveRequestedTime(wmsTime, selectedTimeIndex)
    const entries: Array<[WmsLayerConfig, boolean]> = [
      [resolveTempLayerConfig(selectedTimeIndex), layers.temp],
      [resolveRainLayerConfig(selectedTimeIndex), layers.rain],
      [resolveWindLayerConfig(selectedTimeIndex), layers.wind],
    ]

    for (const [config, visible] of entries) {
      const source = map.getSource(config.sourceId) as RasterTileSource | undefined
      source?.setTiles([buildWmsTileUrl(config, requestedTime)])

      if (map.getLayer(config.layerId)) {
        map.setLayoutProperty(config.layerId, 'visibility', visible ? 'visible' : 'none')
      }
    }

    for (const layerId of ['warnings-fill', 'warnings-line']) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', layers.warnings ? 'visible' : 'none')
      }
    }
  }, [wmsTime, selectedTimeIndex, layers, ready, styleEpoch])

  useEffect(() => {
    const map = mapRef.current
    if (!map || selectedId === null) return

    const target = locations.find((location) => location.id === selectedId)
    if (target) {
      map.flyTo({
        center: [target.longitude, target.latitude],
        zoom: Math.max(map.getZoom(), 10),
        padding: { top: 190, bottom: 0, left: 0, right: 0 },
      })
    }
  }, [selectedId, locations])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    popupRef.current?.remove()
    popupRef.current = null

    const target = locations.find((location) => location.id === selectedId)
    if (!target) return

    const node = buildPopupContent(target, waterLabel, () => onShowDetailsRef.current())

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom',
      offset: 40,
      maxWidth: '280px',
      focusAfterOpen: false,
      className: 'splaesh-popup',
    })
      .setLngLat([target.longitude, target.latitude])
      .setDOMContent(node)
      .addTo(map)

    node.querySelector('.mp-close')?.addEventListener('click', () => popup.remove())
    popupRef.current = popup

    return () => {
      popup.remove()
    }
  }, [selectedId, selectionNonce, locations, waterLabel, ready, styleEpoch])

  return <div className="map" ref={containerRef} />
}
