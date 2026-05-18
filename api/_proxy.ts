/**
 * Generic upstream proxy used by per-source Vercel functions in /api.
 * Keeps Bearer / API-key secrets on the server.
 *
 * In local dev these routes are not used — Vite's dev proxy in
 * vite.config.ts handles the same paths against localhost. Both share the
 * same `/api/<source>/...` URL contract so the React code is unchanged.
 */

import type { IncomingMessage, ServerResponse } from 'http'

type Options = {
  upstreamBase: string
  /** Inject auth into the upstream request. */
  authorize?: (headers: Record<string, string>) => void
}

function getRawQueryString(req: IncomingMessage): string {
  const url = req.url ?? ''
  const idx = url.indexOf('?')
  return idx === -1 ? '' : url.slice(idx + 1)
}

function joinPath(segs: string[] | undefined): string {
  if (!segs || segs.length === 0) return ''
  return '/' + segs.map(encodeURIComponent).join('/')
}

function pickReqBody(req: IncomingMessage & { body?: unknown }): BodyInit | undefined {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') return undefined
  const body = req.body
  if (body === undefined || body === null) return undefined
  if (typeof body === 'string') return body
  return JSON.stringify(body)
}

export async function proxy(
  req: IncomingMessage & { query?: Record<string, string | string[] | undefined>; body?: unknown },
  res: ServerResponse,
  opts: Options,
): Promise<void> {
  const rawSegs = req.query?.path
  const segs = Array.isArray(rawSegs) ? rawSegs : rawSegs ? [rawSegs] : []
  const qs = getRawQueryString(req)
  const upstreamUrl = `${opts.upstreamBase}${joinPath(segs)}${qs ? `?${qs}` : ''}`

  const headers: Record<string, string> = {
    accept: (req.headers['accept'] as string | undefined) ?? 'application/json',
    'content-type': (req.headers['content-type'] as string | undefined) ?? 'application/json',
    'user-agent': (req.headers['user-agent'] as string | undefined) ?? 'EcofactorMarketplace/1.0',
  }
  opts.authorize?.(headers)

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method ?? 'GET',
      headers,
      body: pickReqBody(req),
    })

    res.statusCode = upstream.status
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      // Drop hop-by-hop headers; let Node manage these.
      if (lower === 'transfer-encoding' || lower === 'content-encoding' || lower === 'content-length' || lower === 'connection') {
        return
      }
      res.setHeader(key, value)
    })

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.end(buf)
  } catch (err) {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'upstream_unreachable', detail: String(err) }))
  }
}
