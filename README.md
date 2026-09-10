# Splæsh web

Web-port av Splæsh-Android-appen. Samme datakjede, samme badescore, skrevet i React + TypeScript.

Kotlin-kilden det er portet fra ligger i `arink1305/splaesh`. Stiene i tabellen under er relative til det repoet.

## Hva som er portet

| Kotlin | TypeScript |
|---|---|
| `utils/BathingScore.kt` | `src/lib/bathingScore.ts` |
| `utils/ForecastAggregator.kt` | `src/lib/forecastAggregator.ts` |
| `utils/WarningSeverityResolver.kt` + `ui/components/WarningComponents.kt` | `src/lib/warningSeverity.ts` |
| `utils/FarevarselPolygon.kt` | `src/lib/polygon.ts` |
| `RecommendationsRepository.haversineKm` | `src/lib/haversine.ts` |
| `api/*.kt` (Retrofit) | `src/api/met.ts`, `src/api/uv.ts` |
| `data/WarningsRepository.kt` | `src/api/met.ts` (`fetchWarnings`) |
| `data/HomeRepository.kt` | `src/data/placeData.ts` |
| `data/RecommendationsRepository.kt` | `src/data/recommendations.ts` |
| `data/LocationRepository.kt` | `src/data/locations.ts` |
| Favoritter i SharedPreferences | `src/state/favorites.ts` (localStorage) |
| `app_settings` i SharedPreferences | `src/state/settings.ts` (localStorage) |
| `ui/navigation/AppNavigation.kt` | `src/App.tsx` (topplinje i stedet for NavigationBar) |
| `ui/components/MapSearchOverlay.kt` | `src/lib/search.ts` + `src/components/SearchBar.tsx` |
| `ui/favorites/FavoritesScreen.kt` + ViewModel | `src/screens/FavoritesScreen.tsx` + `src/hooks/useLocationDetails.ts` |
| `ui/recommendations/RecommendationsScreen.kt` + ViewModel | `src/screens/RecommendationsScreen.tsx` + `src/hooks/useRecommendations.ts` |
| `RecommendationPlaceCard.formatDistanceKm` | `src/lib/format.ts` |
| `ui/settings/SettingsScreen.kt` | `src/screens/SettingsScreen.tsx` |
| `UserLocationRepository` | `src/hooks/useUserPosition.ts` (`navigator.geolocation`) |
| `app/src/main/assets/badeplasser.json` | `src/data/badeplasser.json` (uendret) |
| `ui/components/InteractiveVictoriaMap.kt` | `src/lib/wmsLayers.ts` + `src/components/MapView.tsx` |
| `HomesScreenViewModel` sine `timeSteps` | `src/lib/timeSteps.ts` |
| `ui/components/TimeScroller.kt` | `src/components/TimeScroller.tsx` |
| Mapbox Maps SDK for Android | MapLibre GL JS |
| `PointAnnotation` med badepin-ikoner | GeoJSON-kilde + symbol-lag (`src/lib/geojson.ts`) |
| `WarningMapLayer` sine polygoner | GeoJSON-kilde + fill/line-lag |
| `UserLocationPuck` | MapLibre `GeolocateControl` |

`app/src/test/` er portet til Vitest i `src/**/*.test.ts`. Forventede verdier er utledet fra Kotlin-kilden for hånd, ikke fra en kjøring av Kotlin-testene.

## Kartet

`src/components/MapView.tsx` bruker MapLibre GL JS. Basiskartet er CARTO Positron (lyst) og Dark Matter (mørkt), som ikke krever noen nøkkel — derfor trenger web-versjonen ingen Mapbox-token.

- Victoria WMS ligger som tre raster-lag. URL-mønsteret er portet uendret fra Kotlin, inkludert `{bbox-epsg-3857}`, og lagene bytter fra MEPS til ECMWF etter time 60 på samme måte som i appen.
- Farevarsler tegnes som fill- og line-lag fra MET Alerts, med `fill-opacity` 0.4 som i Compose-versjonen.
- Badeplassene er ett symbol-lag med de samme badepin-ikonene, nedskalert til 128 px. Fargen kommer fra `resolveWarningSeverityForLocation`, så en badeplass inni et gult varselpolygon får gul pin. De samme tre pinnene brukes som tegnforklaring under kartet.
- Tidsskyveren dekker 240 timer fra neste hele UTC-time, og viser hvilken modell timen kommer fra.

`optimizeDeps.exclude: ['maplibre-gl']` i `vite.config.ts` er nødvendig. Uten den blir MapLibre sin worker liggende halvlastet i Vites dep-cache i utvikling, og da laster ingen GeoJSON-kilder — kartet viser basiskartet, men verken pins eller polygoner.

## Design

Paletten, formene og skjermoppsettet følger Android-appen: teal `#03778A` lyst og `#78D7E2` mørkt, bakgrunn `#F3F6F8` / `#0E1114`, kort med 28 px radius, ikonfliser på 14 px, og segmentkontroller og brikker som piller. Typografien er Inter, som ligger nærmest Material-standarden appen brukte.

Navigasjonen ligger i en klebrig topplinje i full bredde, med logo og «Splæsh» til venstre og de fire destinasjonene til høyre — Android-appen hadde dem i en NavigationBar nederst, som passer dårlig på en nettside. Hjem åpner med en hero: overskrift, søk og en bølget overgang ned mot kartet. Nederst ligger en sidefot med datakilder og kreditering.

### Animasjoner

Holdt diskrete og raske, og alle er slått av under `prefers-reduced-motion`:

- skjermbytte fader inn med 8 px forskyvning
- kort løftes 2 px ved hover
- badescoren teller opp fra 0, og ringen rundt fylles i takt (`@property --ring` med CSS-overgang)
- puls på «live»-prikken i heroen
- skimmer mens bilder og data lastes

Regnestykket bak opptellingen ligger i `src/lib/animation.ts` og er testet; selve `requestAnimationFrame`-løkka i `useCountUp` er tynn med vilje.

## Søk

`src/lib/search.ts` er en port av søkefiltreringen i `MapSearchOverlay`: samme `normalizeForSearch` (småbokstaver, æ→ae, ø→o, å→a, NFD-dekomponering og fjerning av kombinasjonstegn), samme delstrengsmatch, samme sortering på navnelengde og samme grense på seks forslag. Så «sorenga» finner «Sørenga Sjøbad».

Geocoder-halvdelen av det Kotlin-søket er ikke portert — den lente seg på Android sin `Geocoder` for å slå opp byer og områder. Web-søket dekker de 61 badeplassene.

## Skjermene

Fire skjermer, som de fire destinasjonene i `AppNavigation`: Favoritter, Hjem, Anbefalinger og Innstillinger.

- **Favoritter** har samme «pending removal»-oppførsel som i appen: å fjerne en favoritt markerer den, og selve fjerningen skjer først når du forlater fanen.
- **Anbefalinger** bruker `navigator.geolocation` og radiusvalgene 2, 5, 10 og 20 km, og sorterer på badescore med avstand som andrenøkkel.
- **Innstillinger** lagrer tema og badescore-profil i localStorage, slik `app_settings` gjorde med SharedPreferences.

Temaet er én bryter for hele siden. Android-appen hadde en egen mørk-modus bare for kartet; her styrer samme valg både sidepaletten og MapLibre-stilen. Første besøk følger `prefers-color-scheme`, deretter husker den valget ditt.

Favorittkortene henter data gjennom `getPlaceData`, som tar første tidssteg i varselet. Kotlin-versjonen leter opp tidssteget nærmest nå — i praksis det samme, siden MET legger inneværende time først.

## Hva som ikke er portet ennå

- Trykk hvor som helst i kartet for punktvarsel (`onMapPointClick` i Kotlin).
- Filtermenyen (`HomeFilterMenu`).
- Stedssøk via geocoder — bare badeplassnavn er søkbare.
- Stedsnavn fra Android sin `Geocoder`. Navnet kommer fra `badeplasser.json` i stedet.

## Kjøre lokalt

```bash
npm install
npm run dev
```

`npm test` kjører enhetstestene, `npm run build` bygger til `dist/`.

## MET-proxyen

`api.met.no` krever en `User-Agent` som identifiserer klienten. Den headeren kan ikke settes fra nettleseren, så kallene til MET går gjennom en proxy på `/api/met`:

- I utvikling: `server.proxy` i `vite.config.ts`.
- I produksjon: edge-funksjonen i `api/met/[...path].ts`, som også cacher svarene i ti minutter.

Begge leser `MET_USER_AGENT` fra miljøet. Kopier `.env.example` til `.env` og sett inn din egen kontaktadresse.

Open-Meteo (UV) og Victoria WMS kalles direkte fra nettleseren og trenger ingen proxy — begge sender CORS-headere selv.

## Deploy

Prosjektet er satt opp for Vercel: `dist/` som statisk output og `api/` som edge-funksjoner. Sett `MET_USER_AGENT` som miljøvariabel i prosjektinnstillingene.

Ren GitHub Pages fungerer ikke alene, siden proxyen trenger et sted å kjøre. Alternativet er å legge proxyen som en Cloudflare Worker og peke `MET_BASE_URL` i `src/api/client.ts` dit.

## Bilder

Logo, favoritt-banneret og kartlag-ikonet er hentet fra Android-repoet (`assets/readme/logo.png` og `app/src/main/res/drawable/`) og ligger i `public/brand/`. Logoen er beskåret til ikonet og skalert ned; banneret er konvertert til JPEG.

Hver badeplass har en `image`-URL i `badeplasser.json` som peker på en ekstern vert. Rundt en tredel av dem er døde eller har hotlink-sperre, så `PlaceImage` skjuler seg selv ved feil og etter 15 sekunder uten svar — det er aldri et ødelagt bildeikon i panelet.

## Datakilder

Meteorologisk institutt (Locationforecast 2.0, Oceanforecast 2.0, MET Alerts 2.0, Victoria WMS), Open-Meteo (UV). Bakgrunnskart © OpenStreetMap-bidragsytere © CARTO.
