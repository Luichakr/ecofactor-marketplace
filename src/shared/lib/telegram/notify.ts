/**
 * Fire-and-forget Telegram notification for demo orders.
 *
 * SECURITY: the bot token is a secret and MUST NOT be committed. It is read
 * from the `VITE_TELEGRAM_BOT_TOKEN` env var (put it in a gitignored `.env`,
 * or a CI secret for the Pages build). Without it, notifications are silently
 * skipped — the order still goes through.
 *
 * Note: any token shipped to the browser is ultimately visible in the built
 * bundle. For production, route this through a backend/serverless proxy that
 * holds the token server-side. This client-side call is for the demo only.
 */
const TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined
// Chat id is not secret — safe as a default; override via env if needed.
const CHAT_ID = (import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined) ?? '436984255'

export function notifyTelegram(text: string): void {
  if (!TOKEN) return
  try {
    void fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    }).catch(() => {})
  } catch {
    /* never block checkout on a notification failure */
  }
}
