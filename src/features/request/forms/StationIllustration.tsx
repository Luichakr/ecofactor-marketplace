import type { CSSProperties } from 'react'
import './StationIllustration.css'

// AW family — ECO Totem (free-standing column).
import awStand        from '../../../assets/configurator/aw/stand.png'
import awBodyBlack    from '../../../assets/configurator/aw/body_black.png'
import awBodyGrey     from '../../../assets/configurator/aw/body_grey.png'
import awBodyWhite    from '../../../assets/configurator/aw/body_white.png'
import awBodyGreen    from '../../../assets/configurator/aw/body_green.png'

// NV duet — ECO Wall (2-port).
import nvDuetBlack    from '../../../assets/configurator/nv-duet/body_black.png'
import nvDuetGrey     from '../../../assets/configurator/nv-duet/body_grey.png'
import nvDuetWhite    from '../../../assets/configurator/nv-duet/body_white.png'

// NV trio — ECO Wall extended (3-port).
import nvTrioBlack    from '../../../assets/configurator/nv-trio/body_black.png'
import nvTrioGrey     from '../../../assets/configurator/nv-trio/body_grey.png'
import nvTrioWhite    from '../../../assets/configurator/nv-trio/body_white.png'

// Connector overlays — keyed by `${family}_${type}_${slot}`.
const CONNECTOR_OVERLAYS = import.meta.glob('../../../assets/configurator/connectors/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function overlay(family: string, type: string, slot: number): string | null {
  // Vite's glob keys are relative paths — match by suffix.
  const needle = `${family}_${type}_${slot}.png`
  for (const [path, url] of Object.entries(CONNECTOR_OVERLAYS)) {
    if (path.endsWith(needle)) return url
  }
  return null
}

type Family = 'aw' | 'nv-duet' | 'nv-trio'
type Color = 'black' | 'grey' | 'white' | 'green' | 'ral'

/* Pick the body PNG matching family + color. Falls back to black if a
 * variant for the requested color doesn't exist (NV bodies have no green
 * preset; RAL custom isn't pre-rendered). */
function bodyFor(family: Family, color: Color): string {
  if (family === 'aw') {
    switch (color) {
      case 'grey':  return awBodyGrey
      case 'white': return awBodyWhite
      case 'green': return awBodyGreen
      default:      return awBodyBlack
    }
  }
  if (family === 'nv-duet') {
    switch (color) {
      case 'grey':  return nvDuetGrey
      case 'white': return nvDuetWhite
      default:      return nvDuetBlack
    }
  }
  switch (color) {
    case 'grey':  return nvTrioGrey
    case 'white': return nvTrioWhite
    default:      return nvTrioBlack
  }
}

/* Map our connector ids to the source-site's single-letter family codes.
 *  y = Type 2 (the live "Y" code), d = Type 1, f = GB/T, n = NACS, a = AC alt.
 *  Connector wattage variants share the same overlay (the visual is the
 *  socket, not the cable rating). */
function typeCodeFor(connectorId: string): string {
  if (connectorId.startsWith('type2')) return 'y'
  if (connectorId.startsWith('type1')) return 'd'
  if (connectorId.startsWith('gbt'))   return 'f'
  if (connectorId.startsWith('nacs'))  return 'n'
  return 'y'
}

type Props = {
  model: string
  color?: Color
  /** Picks the user made in the wizard — only the order matters here, we
   *  assign each pick to the next free physical slot on the station. */
  picks: Array<{ id: string; qty: number }>
  className?: string
  style?: CSSProperties
}

export function StationIllustration({ model, color = 'black', picks, className = '', style }: Props) {
  // Pick the family + slot count based on the chosen model.
  // ECO Totem -> AW family, 3 slots, stand visible.
  // ECO Wall -> NV duet (2 slots) by default; if user adds 3rd port jump to NV trio.
  // Total qty across picks determines which body for ECO Wall.
  const totalPicks = picks.reduce((s, p) => s + p.qty, 0)

  let family: Family = 'aw'
  let maxSlots = 3
  let showStand = false

  if (model === 'eco-totem') {
    family = 'aw'
    maxSlots = 3
    showStand = true
  } else if (model === 'eco-wall') {
    family = totalPicks > 2 ? 'nv-trio' : 'nv-duet'
    maxSlots = family === 'nv-trio' ? 3 : 2
  } else {
    // DC models (TOR family) — no illustrations downloaded yet; fall back
    // to the AW silhouette so the user at least sees something while the
    // DC pack is being prepared.
    family = 'aw'
    maxSlots = 3
    showStand = false
  }

  // Flatten picks into a list of overlay layers, capped at maxSlots.
  const overlays: string[] = []
  let slotIdx = 1
  for (const pick of picks) {
    const code = typeCodeFor(pick.id)
    for (let i = 0; i < pick.qty && slotIdx <= maxSlots; i++) {
      const url = overlay(family, code, slotIdx)
      if (url) overlays.push(url)
      slotIdx++
    }
  }

  return (
    <div className={`station-illust ${className}`} style={style} aria-hidden="true">
      {showStand && <img src={awStand} alt="" className="station-illust__layer" />}
      <img src={bodyFor(family, color)} alt="" className="station-illust__layer" />
      {overlays.map((src, i) => (
        <img key={i} src={src} alt="" className="station-illust__layer" />
      ))}
    </div>
  )
}
