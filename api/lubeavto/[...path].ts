import type { IncomingMessage, ServerResponse } from 'http'
import { proxy } from '../_proxy'

const BASE = process.env.LUBEAVTO_API_BASE ?? 'https://api-lubeavto-partner.azurewebsites.net'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await proxy(req, res, {
    upstreamBase: BASE,
    authorize: (headers) => {
      const t = process.env.LUBEAVTO_API_TOKEN
      if (!t) return
      headers['authorization'] = /^Bearer\s+/i.test(t) ? t : `Bearer ${t}`
    },
  })
}
