export const config = { runtime: 'edge' }

const UPSTREAM = 'https://api.met.no'

const ALLOWED_PATHS = [
  '/weatherapi/locationforecast/2.0/compact',
  '/weatherapi/oceanforecast/2.0/complete',
  '/weatherapi/metalerts/2.0/current.json',
]

const USER_AGENT =
  process.env.MET_USER_AGENT ??
  'Splaesh/1.0 (https://github.com/arink1305/splaesh; kontakt: arinkk@uio.no)'

export default async function handler(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const path = incoming.pathname.replace(/^\/api\/met/, '')

  if (!ALLOWED_PATHS.includes(path)) {
    return new Response(JSON.stringify({ error: 'Ukjent endepunkt' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstream = new URL(UPSTREAM + path)
  upstream.search = incoming.search

  const response = await fetch(upstream, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  })

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Kunne ikke hente data fra MET', status: response.status }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
