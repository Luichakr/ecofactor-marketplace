import type { IncomingMessage, ServerResponse } from 'http'
import { proxy } from '../_proxy'

const BASE = process.env.EFPF_API_BASE ?? 'https://ecofactortech.com/wp-json/efpf/v1'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await proxy(req, res, {
    upstreamBase: BASE,
    authorize: (headers) => {
      const k = process.env.EFPF_API_KEY
      if (k) headers['x-efpf-api-key'] = k
    },
  })
}
