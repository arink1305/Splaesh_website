export const MET_PROXY_URL = '/api/met'
export const MET_DIRECT_URL = 'https://api.met.no'

let proxyWorks: boolean | null = null

export function metProxyStatus(): boolean | null {
  return proxyWorks
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`)
  }
  return (await response.json()) as T
}

export async function getMetJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (proxyWorks !== false) {
    try {
      const result = await getJson<T>(`${MET_PROXY_URL}${path}`, signal)
      proxyWorks = true
      return result
    } catch (error) {
      if (signal?.aborted) throw error
      proxyWorks = false
    }
  }

  return getJson<T>(`${MET_DIRECT_URL}${path}`, signal)
}
