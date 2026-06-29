/**
 * Client-side Telegram notifications (DRAFT / fallback mode only).
 *
 * SECURITY: the bot token is a secret and MUST NOT be committed. It is read
 * from the `VITE_TELEGRAM_BOT_TOKEN` env var (put it in a gitignored `.env`,
 * or a CI secret for the Pages build). Without it, notifications are silently
 * skipped — the order/listing still goes through locally.
 *
 * Any token shipped to the browser is ultimately visible in the built bundle.
 * The PRODUCTION path is the Cloudflare Worker (see `worker/`): set
 * `VITE_API_BASE` and the app routes everything through it instead, keeping the
 * token server-side. These client-side calls are the no-backend fallback.
 */
const TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined
// Chat id is not secret — safe as a default; override via env if needed.
const CHAT_ID = (import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined) ?? '436984255'

/** True when a client-side token is configured (draft mode can reach Telegram). */
export const hasTelegram = Boolean(TOKEN)

function api(method: string): string {
  return `https://api.telegram.org/bot${TOKEN}/${method}`
}

/** Fire-and-forget HTML message. Never throws, never blocks the caller. */
export function notifyTelegram(text: string): void {
  if (!TOKEN) return
  try {
    void fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    }).catch(() => {})
  } catch {
    /* never block on a notification failure */
  }
}

/** Awaitable HTML message — resolves true on a 2xx, false otherwise. */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TOKEN) return false
  try {
    const res = await fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    return res.ok
  } catch {
    return false
  }
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [head, b64] = dataUrl.split(',')
    if (!b64) return null
    const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'image/jpeg'
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type: mime })
  } catch {
    return null
  }
}

/**
 * Send one photo (data URL) with an optional HTML caption and inline buttons.
 * Used by the draft listing flow to push a submission to the manager chat.
 * `buttons` is an optional 1-row inline keyboard (e.g. Approve / Reject).
 */
export async function sendTelegramPhoto(
  dataUrl: string,
  caption?: string,
  buttons?: { text: string; url?: string; callback_data?: string }[],
): Promise<boolean> {
  if (!TOKEN) return false
  const blob = dataUrlToBlob(dataUrl)
  if (!blob) {
    // Fall back to a text-only message if the image can't be decoded.
    return caption ? sendTelegramMessage(caption) : false
  }
  try {
    const form = new FormData()
    form.append('chat_id', CHAT_ID)
    form.append('photo', blob, 'listing.jpg')
    if (caption) {
      form.append('caption', caption)
      form.append('parse_mode', 'HTML')
    }
    if (buttons?.length) {
      form.append('reply_markup', JSON.stringify({ inline_keyboard: [buttons] }))
    }
    const res = await fetch(api('sendPhoto'), { method: 'POST', body: form })
    return res.ok
  } catch {
    return false
  }
}
