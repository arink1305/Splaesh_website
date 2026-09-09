import { BATHING_SCORE_PROFILES, type BathingScoreProfile } from '../types/bathingScore'

const PROFILE_KEYS = Object.keys(BATHING_SCORE_PROFILES) as BathingScoreProfile[]

interface SettingsScreenProps {
  dark: boolean
  onDarkChange: (dark: boolean) => void
  profile: BathingScoreProfile
  onProfileChange: (profile: BathingScoreProfile) => void
}

export default function SettingsScreen({
  dark,
  onDarkChange,
  profile,
  onProfileChange,
}: SettingsScreenProps) {
  return (
    <>
      <div className="screen-head">
        <h1>Innstillinger</h1>
        <p>Velg skjerminnstilling og tilpass appinnstillinger.</p>
      </div>

      <div className="stack settings">
        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              🗺
            </span>
            <div>
              <h3>Skjerminnstilling</h3>
              <p>Bytt mellom lys og mørk skjermvisning.</p>
            </div>
          </div>
          <div className="segmented">
            <button type="button" aria-pressed={!dark} onClick={() => onDarkChange(false)}>
              Lys
            </button>
            <button type="button" aria-pressed={dark} onClick={() => onDarkChange(true)}>
              Mørk
            </button>
          </div>
        </section>

        <section className="card info">
          <span className="eyebrow">Nåværende valg</span>
          <strong>{dark ? 'Mørk' : 'Lys'} skjerminnstilling er aktiv</strong>
          <p>Valget lagres i nettleseren og gjelder både siden og kartet.</p>
        </section>

        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              🏊
            </span>
            <div>
              <h3>Badeforhold-score</h3>
              <p>Velg hvordan appen skal vurdere badeforhold.</p>
            </div>
          </div>
          <ul className="radio-list">
            {PROFILE_KEYS.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className="radio-row"
                  aria-pressed={profile === key}
                  onClick={() => onProfileChange(key)}
                >
                  <span>
                    <strong>{BATHING_SCORE_PROFILES[key].title}</strong>
                    <span className="desc">{BATHING_SCORE_PROFILES[key].shortDescription}</span>
                  </span>
                  <span className="radio-dot" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">
            <span className="icon-tile" aria-hidden="true">
              <img src="/brand/meteorology.png" alt="" />
            </span>
            <div>
              <h3>Om dataene</h3>
              <p>
                Værvarsel, sjødata, farevarsler og kartlag kommer fra Meteorologisk institutt
                (Locationforecast 2.0, Oceanforecast 2.0, MET Alerts 2.0 og Victoria WMS). UV kommer
                fra Open-Meteo. Bakgrunnskartet er © OpenStreetMap-bidragsytere © CARTO.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
