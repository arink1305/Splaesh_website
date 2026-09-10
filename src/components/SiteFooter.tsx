const SOURCES: Array<[string, string, string]> = [
  ['Locationforecast 2.0', 'https://api.met.no/weatherapi/locationforecast/2.0/documentation', 'Værvarsel'],
  ['Oceanforecast 2.0', 'https://api.met.no/weatherapi/oceanforecast/2.0/documentation', 'Sjøtemperatur og bølger'],
  ['MET Alerts 2.0', 'https://api.met.no/weatherapi/metalerts/2.0/documentation', 'Farevarsler'],
  ['Victoria WMS', 'https://public-victoria.met.no/', 'Værkartlag'],
  ['Open-Meteo', 'https://open-meteo.com/', 'UV-indeks'],
]

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/brand/logo.png" alt="" className="footer-logo" />
          <span className="footer-word">Splæsh</span>
          <p>
            Badeforhold for hele Norge — vanntemperatur, bølger, UV og farevarsler satt sammen til
            én badescore du kan stole på før du hopper uti.
          </p>
        </div>

        <nav className="footer-col">
          <h2>Datakilder</h2>
          <ul>
            {SOURCES.map(([name, href, what]) => (
              <li key={name}>
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {name}
                </a>
                <span>{what}</span>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col">
          <h2>Om</h2>
          <ul>
            <li>
              <a
                href="https://github.com/arink1305/splaesh"
                target="_blank"
                rel="noreferrer noopener"
              >
                Splæsh på GitHub
              </a>
              <span>Android-appen dette er portet fra</span>
            </li>
            <li>
              <a href="https://www.met.no/" target="_blank" rel="noreferrer noopener">
                Meteorologisk institutt
              </a>
              <span>Leverer vær-, sjø- og varseldata</span>
            </li>
            <li>
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer noopener"
              >
                OpenStreetMap
              </a>
              <span>Bakgrunnskart via CARTO</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>
          Splæsh er en web-port av en Android-app laget som gruppeprosjekt i IN2000 ved
          Universitetet i Oslo.
        </p>
        <p>
          Kartdata © OpenStreetMap-bidragsytere © CARTO · Værdata © Meteorologisk institutt (CC BY
          4.0)
        </p>
      </div>
    </footer>
  )
}
