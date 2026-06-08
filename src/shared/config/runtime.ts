/**
 * Centralised runtime flags. Read once at module load — never mutate.
 *
 * The marketplace ships with a lot of seeded demo content (fake orders,
 * default address/card, support auto-replies, etc) so it looks alive
 * during internal demos. For production / live testing we need a single
 * switch that disables all of those so real users start with empty
 * personal stores and forms behave the way they will after backend
 * integration.
 *
 * Set `VITE_DEMO_MODE=1` (or `true` / `yes` / `on`) in `.env` to opt
 * INTO demo mode. The default — and what every production build gets —
 * is plain end-user behaviour.
 */

function readBool(raw: string | boolean | undefined): boolean {
  if (raw === undefined || raw === '') return false
  if (typeof raw === 'boolean') return raw
  return /^(1|true|yes|on)$/i.test(raw.trim())
}

/** True when the build is running in our internal demo mode. Use this to
 *  gate seeded fixtures, fake auto-replies, and any "looks alive" hacks. */
export const IS_DEMO: boolean = readBool(
  (import.meta.env.VITE_DEMO_MODE as string | undefined) ?? false,
)

/** True only while `npm run dev` — Vite sets this automatically. Use for
 *  console.warn statements and verbose error UIs. */
export const IS_DEV: boolean = Boolean(import.meta.env.DEV)
