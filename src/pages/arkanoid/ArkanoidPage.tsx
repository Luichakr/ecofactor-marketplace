import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { ROUTES } from '../../shared/config/routes'
import './ArkanoidPage.css'

/* ──────────────────────────────────────────────────────────────
   ECOFACTOR Arkanoid — gameplay-overhaul build
   ─────────────────────────────────────────────────────────────
   Key rules (per TZ):
   - Ball never auto-launches: every new ball sits on the paddle
     until the player taps / clicks / hits Space.
   - Power-ups only apply when caught by the paddle; missed power-
     ups silently disappear below the floor.
   - Level 1 is a tutorial: the first five destroyed bricks drop
     each power-up exactly once, in a fixed order.
   - 10 levels total with escalating difficulty (see balance below).
   - Reward: 100 копійок per completed level, capped at 1000 коп
     (10 грн) per 24-hour window. After claim, a countdown ticks
     to the next eligible reward window.
   ────────────────────────────────────────────────────────────── */

type Vec = { x: number; y: number }

type Ball = { pos: Vec; vel: Vec; r: number }

type Brick = {
  x: number
  y: number
  w: number
  h: number
  hp: number
  alive: boolean
}

type PowerKind = 'wide' | 'slow' | 'multi' | 'life' | 'laser'
type Power = { x: number; y: number; vy: number; kind: PowerKind }
type Bullet = { x: number; y: number; vy: number }

type GameState =
  | 'menu'
  | 'ready'      // ball on paddle, awaiting launch
  | 'play'
  | 'between'
  | 'gameover'
  | 'won'
  | 'paused'

const LOGICAL_W = 480
const LOGICAL_H = 720

const BRICK_ROWS = 6
const BRICK_COLS = 8
const BRICK_PADDING = 4
const BRICK_OFFSET_Y = 60
const PADDLE_Y = LOGICAL_H - 36
const PADDLE_H = 12
const PADDLE_W_BASE = 100
const PADDLE_W_WIDE = 160
const BALL_R = 6

/** Power-up boxes share the app's mono palette (text on bg). The letter
 *  inside each box is the visual differentiator, not the colour. */

const POWER_LABELS: Record<PowerKind, string> = {
  wide: 'W',
  slow: 'S',
  multi: 'M',
  life: 'L',
  laser: 'X',
}

const POWER_NAMES_UA: Record<PowerKind, string> = {
  wide: 'WIDE',
  slow: 'SLOW',
  multi: 'MULTI',
  life: 'LIFE',
  laser: 'LASER',
}

// Per TZ §8 — bonus durations (ms)
const POWER_DURATION_MS: Record<PowerKind, number> = {
  wide: 30_000,
  slow: 30_000,
  multi: 10_000,
  laser: 5_000,
  life: 0,
}

const TUTORIAL_POWER_QUEUE: PowerKind[] = ['wide', 'slow', 'multi', 'laser', 'life']

const REWARD_PER_LEVEL_KOPIYKY = 100
const MAX_DAILY_REWARD_KOPIYKY = 1000
const REWARD_COOLDOWN_MS = 24 * 60 * 60 * 1000

const STORAGE_LAST_CLAIM = 'ecofactor_arkanoid_last_reward_claim_at'
const STORAGE_REWARD = 'ecofactor_arkanoid_reward_kopiyky'

// ── Level balancing per TZ §7 ────────────────────────────────
type LevelConfig = {
  /** Filled brick rows (max BRICK_ROWS). */
  rows: number
  /** Predicate: should this (row, col) be left empty for visual pattern? */
  skip?: (r: number, c: number) => boolean
  /** Function returning HP for a brick (1 / 2 / 3). */
  hp?: (r: number) => number
  /** Random chance a destroyed brick drops a power. Tutorial uses queue. */
  powerDropChance: number
  /** Ball speed multiplier on top of the base linear ramp. */
  speedMul: number
}

const LEVELS: LevelConfig[] = [
  // 1 — tutorial
  { rows: 3,                                                   powerDropChance: 1.0, speedMul: 0.78 },
  // 2-3 — gentle ramp
  { rows: 4, skip: (r, c) => (r + c) % 2 === 1,                powerDropChance: 0.22, speedMul: 0.92 },
  { rows: 4, skip: (_, c) => c === 0 || c === BRICK_COLS - 1,  powerDropChance: 0.20, speedMul: 1.00 },
  // 4-6 — 2 HP bricks appear, density grows
  { rows: 5, hp: (r) => (r === 0 ? 2 : 1),                     powerDropChance: 0.16, speedMul: 1.08 },
  { rows: 5, skip: (r, c) => c % 2 === 1 && r % 2 === 0,
              hp: (r) => (r === 0 ? 2 : 1),                    powerDropChance: 0.14, speedMul: 1.14 },
  { rows: 6, skip: (r, c) => r === 2 && c % 2 === 0,
              hp: (r) => (r <= 1 ? 2 : 1),                     powerDropChance: 0.12, speedMul: 1.20 },
  // 7-9 — dense, more 2 HP
  { rows: 6,                                                   hp: (r) => (r <= 2 ? 2 : 1), powerDropChance: 0.10, speedMul: 1.28 },
  { rows: 6, skip: (r, c) => (r + c) % 3 === 0,
              hp: (r) => (r === 0 ? 3 : r <= 2 ? 2 : 1),       powerDropChance: 0.10, speedMul: 1.34 },
  { rows: 6,                                                   hp: (r) => (r <= 1 ? 3 : r <= 3 ? 2 : 1), powerDropChance: 0.08, speedMul: 1.40 },
  // 10 — final boss
  { rows: 6, hp: (r) => (r <= 1 ? 3 : 2),                      powerDropChance: 0.06, speedMul: 1.55 },
]

function buildLevel(level: number): Brick[] {
  const cfg = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))]
  const cellW = (LOGICAL_W - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS
  const cellH = 18
  const bricks: Brick[] = []
  for (let r = 0; r < Math.min(BRICK_ROWS, cfg.rows); r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      if (cfg.skip?.(r, c)) continue
      bricks.push({
        x: BRICK_PADDING + c * (cellW + BRICK_PADDING),
        y: BRICK_OFFSET_Y + r * (cellH + BRICK_PADDING),
        w: cellW,
        h: cellH,
        hp: cfg.hp?.(r) ?? 1,
        alive: true,
      })
    }
  }
  return bricks
}

function ballBaseSpeed(level: number): number {
  const cfg = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))]
  return 240 * cfg.speedMul
}

// ── Reward helpers ───────────────────────────────────────────
function readReward(): number {
  try {
    return Number(localStorage.getItem(STORAGE_REWARD)) || 0
  } catch {
    return 0
  }
}
function writeReward(kopiyky: number) {
  try { localStorage.setItem(STORAGE_REWARD, String(kopiyky)) } catch { /* quota */ }
}
function readLastClaim(): number {
  try {
    return Number(localStorage.getItem(STORAGE_LAST_CLAIM)) || 0
  } catch {
    return 0
  }
}
function writeLastClaim(ts: number) {
  try { localStorage.setItem(STORAGE_LAST_CLAIM, String(ts)) } catch { /* quota */ }
}
function formatKopiyky(k: number): string {
  const grn = Math.floor(k / 100)
  const kop = k % 100
  if (kop === 0) return `${grn} грн`
  return `${grn},${String(kop).padStart(2, '0')} грн`
}
function formatHms(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ArkanoidPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Game state stored in refs so the loop reads fresh values without
  // triggering re-renders on every frame.
  const stateRef = useRef<GameState>('menu')
  const levelRef = useRef(1)
  const livesRef = useRef(3)
  const scoreRef = useRef(0)
  const paddleRef = useRef({ x: LOGICAL_W / 2 - PADDLE_W_BASE / 2, w: PADDLE_W_BASE, h: PADDLE_H })
  const ballsRef = useRef<Ball[]>([])
  const bricksRef = useRef<Brick[]>([])
  const powersRef = useRef<Power[]>([])
  const bulletsRef = useRef<Bullet[]>([])

  // Power expiry timestamps (ms since perf-now). 0 = inactive.
  const wideUntilRef = useRef(0)
  const slowUntilRef = useRef(0)
  const multiUntilRef = useRef(0)
  const laserUntilRef = useRef(0)
  const fireCooldownRef = useRef(0)

  // Tutorial: deterministic order of power drops on level 1.
  const tutorialQueueRef = useRef<PowerKind[]>([])

  // Reward state (rendered in HUD + claim screen)
  const [reward, setReward] = useState<number>(() => readReward())
  const [lastClaim, setLastClaim] = useState<number>(() => readLastClaim())
  const [now, setNow] = useState<number>(() => Date.now())

  const rewardAvailable = Date.now() - lastClaim >= REWARD_COOLDOWN_MS
  const nextRewardAt = lastClaim + REWARD_COOLDOWN_MS
  const cooldownRemaining = Math.max(0, nextRewardAt - now)

  // Tick once per second to update countdown labels.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Used to nudge the React tree when ref-driven values change
  // (lives, score, state, active powers HUD strip).
  const [, setTick] = useState(0)
  const forceRender = useCallback(() => setTick((t) => t + 1), [])

  // ── Reset routines ────────────────────────────────────────
  const spawnBallOnPaddle = useCallback((): Ball => {
    return {
      pos: { x: paddleRef.current.x + paddleRef.current.w / 2, y: PADDLE_Y - BALL_R - 1 },
      vel: { x: 0, y: 0 },
      r: BALL_R,
    }
  }, [])

  const startLevel = useCallback((level: number) => {
    levelRef.current = level
    bricksRef.current = buildLevel(level)
    powersRef.current = []
    bulletsRef.current = []
    laserUntilRef.current = 0
    wideUntilRef.current = 0
    slowUntilRef.current = 0
    multiUntilRef.current = 0
    paddleRef.current = { x: LOGICAL_W / 2 - PADDLE_W_BASE / 2, w: PADDLE_W_BASE, h: PADDLE_H }
    ballsRef.current = [spawnBallOnPaddle()]
    tutorialQueueRef.current = level === 1 ? [...TUTORIAL_POWER_QUEUE] : []
    stateRef.current = 'ready'
    forceRender()
  }, [spawnBallOnPaddle, forceRender])

  const restart = useCallback(() => {
    scoreRef.current = 0
    livesRef.current = 3
    startLevel(1)
  }, [startLevel])

  // Player-initiated ball launch. Ball flies straight up.
  const launchBall = useCallback(() => {
    if (stateRef.current !== 'ready') return
    const speed = ballBaseSpeed(levelRef.current)
    const b = ballsRef.current[0]
    if (!b) return
    b.vel = { x: 0, y: -speed }
    stateRef.current = 'play'
    forceRender()
  }, [forceRender])

  // ── Game loop ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas!.getBoundingClientRect()
      canvas!.width = Math.floor(rect.width * dpr)
      canvas!.height = Math.floor(rect.height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    let raf = 0

    /** Pull the app theme colours from CSS variables every frame —
     *  cheap and keeps the canvas in sync with light/dark mode without
     *  re-instantiating the loop. */
    function readPalette() {
      const root = getComputedStyle(document.documentElement)
      const bg = root.getPropertyValue('--color-bg').trim() || '#ffffff'
      const fg = root.getPropertyValue('--color-text').trim() || '#000000'
      const muted = root.getPropertyValue('--color-text-muted').trim() || '#8a8a8a'
      const surface = root.getPropertyValue('--color-surface-elevated').trim() || '#f5f5f5'
      const border = root.getPropertyValue('--color-border').trim() || '#e8e8e8'
      return { bg, fg, muted, surface, border }
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const rect = canvas!.getBoundingClientRect()
      const scaleX = rect.width / LOGICAL_W
      const scaleY = rect.height / LOGICAL_H
      const pal = readPalette()

      ctx!.fillStyle = pal.bg
      ctx!.fillRect(0, 0, rect.width, rect.height)

      const tx = (x: number) => x * scaleX
      const ty = (y: number) => y * scaleY

      const st = stateRef.current
      if (st === 'ready') {
        // Glue the ball to the paddle's centre so movement feels alive.
        const ball = ballsRef.current[0]
        if (ball) {
          ball.pos.x = paddleRef.current.x + paddleRef.current.w / 2
          ball.pos.y = PADDLE_Y - BALL_R - 1
        }
      } else if (st === 'play') {
        updateGame(dt, rect.width / scaleX, rect.height / scaleY)
      }

      // Bricks — 1 HP filled with surface tone, 2 HP filled solid fg,
      // 3 HP filled fg with a clear inner border. Matches the app's
      // monochrome aesthetic.
      ctx!.strokeStyle = pal.border
      ctx!.lineWidth = 1
      for (const b of bricksRef.current) {
        if (!b.alive) continue
        ctx!.fillStyle = b.hp >= 2 ? pal.fg : pal.surface
        ctx!.fillRect(tx(b.x), ty(b.y), tx(b.w) - tx(0), ty(b.h) - ty(0))
        ctx!.strokeRect(tx(b.x) + 0.5, ty(b.y) + 0.5, tx(b.w) - tx(0) - 1, ty(b.h) - ty(0) - 1)
        if (b.hp >= 3) {
          // Double-stroke marker for hardest tier.
          ctx!.strokeStyle = pal.bg
          ctx!.strokeRect(tx(b.x) + 3, ty(b.y) + 3, tx(b.w) - tx(0) - 6, ty(b.h) - ty(0) - 6)
          ctx!.strokeStyle = pal.border
        }
      }

      // Paddle + ball + bullets all use the foreground colour.
      ctx!.fillStyle = pal.fg
      ctx!.fillRect(tx(paddleRef.current.x), ty(PADDLE_Y), tx(paddleRef.current.w) - tx(0), ty(paddleRef.current.h) - ty(0))

      for (const ball of ballsRef.current) {
        ctx!.beginPath()
        ctx!.arc(tx(ball.pos.x), ty(ball.pos.y), Math.max(tx(ball.r) - tx(0), 3), 0, Math.PI * 2)
        ctx!.fill()
      }

      for (const bu of bulletsRef.current) {
        ctx!.fillRect(tx(bu.x) - 1, ty(bu.y), 2, ty(8) - ty(0))
      }

      // Power-up boxes: filled with fg, letter painted in bg — like a
      // negative-space label. Distinguishable by letter, not by hue.
      for (const p of powersRef.current) {
        const size = 18
        ctx!.fillStyle = pal.fg
        ctx!.fillRect(tx(p.x) - (tx(size) - tx(0)) / 2, ty(p.y), tx(size) - tx(0), ty(size) - ty(0))
        ctx!.fillStyle = pal.bg
        ctx!.font = `bold ${Math.floor(ty(12) - ty(0))}px -apple-system, sans-serif`
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(POWER_LABELS[p.kind], tx(p.x), ty(p.y + size / 2))
      }

      raf = requestAnimationFrame(frame)
    }

    function updateGame(dt: number, w: number, h: number) {
      const level = levelRef.current
      const slowFactor = slowUntilRef.current > performance.now() ? 0.6 : 1
      const dtAdj = dt * slowFactor

      // Update balls
      const balls = ballsRef.current
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i]
        ball.pos.x += ball.vel.x * dtAdj
        ball.pos.y += ball.vel.y * dtAdj

        // Walls
        if (ball.pos.x - ball.r < 0) { ball.pos.x = ball.r; ball.vel.x = Math.abs(ball.vel.x) }
        if (ball.pos.x + ball.r > w) { ball.pos.x = w - ball.r; ball.vel.x = -Math.abs(ball.vel.x) }
        if (ball.pos.y - ball.r < 0) { ball.pos.y = ball.r; ball.vel.y = Math.abs(ball.vel.y) }

        // Lost ball
        if (ball.pos.y - ball.r > h) {
          balls.splice(i, 1)
          continue
        }

        // Paddle collision
        const paddle = paddleRef.current
        if (
          ball.vel.y > 0 &&
          ball.pos.y + ball.r >= PADDLE_Y &&
          ball.pos.y - ball.r <= PADDLE_Y + paddle.h &&
          ball.pos.x >= paddle.x &&
          ball.pos.x <= paddle.x + paddle.w
        ) {
          ball.pos.y = PADDLE_Y - ball.r
          const t = (ball.pos.x - paddle.x) / paddle.w
          const angle = (t - 0.5) * 2 * (Math.PI / 3) - Math.PI / 2
          const speed = ballBaseSpeed(level)
          ball.vel.x = Math.cos(angle) * speed
          ball.vel.y = Math.sin(angle) * speed
        }

        // Brick collision
        for (const b of bricksRef.current) {
          if (!b.alive) continue
          if (
            ball.pos.x + ball.r >= b.x &&
            ball.pos.x - ball.r <= b.x + b.w &&
            ball.pos.y + ball.r >= b.y &&
            ball.pos.y - ball.r <= b.y + b.h
          ) {
            const overlapL = ball.pos.x + ball.r - b.x
            const overlapR = b.x + b.w - (ball.pos.x - ball.r)
            const overlapT = ball.pos.y + ball.r - b.y
            const overlapB = b.y + b.h - (ball.pos.y - ball.r)
            const min = Math.min(overlapL, overlapR, overlapT, overlapB)
            if (min === overlapL || min === overlapR) ball.vel.x = -ball.vel.x
            else ball.vel.y = -ball.vel.y

            b.hp -= 1
            if (b.hp <= 0) {
              b.alive = false
              scoreRef.current += 10
              maybeDropPower(b)
            }
            break
          }
        }
      }

      // No balls left → lose a life
      if (balls.length === 0) {
        livesRef.current -= 1
        if (livesRef.current <= 0) {
          stateRef.current = 'gameover'
          forceRender()
          return
        }
        // Reset paddle width if a wide power was active.
        if (wideUntilRef.current) {
          paddleRef.current.w = PADDLE_W_BASE
          wideUntilRef.current = 0
        }
        ballsRef.current = [spawnBallOnPaddle()]
        stateRef.current = 'ready'
        forceRender()
        return
      }

      // All bricks broken → next level or win + accrue reward.
      if (bricksRef.current.every((b) => !b.alive)) {
        scoreRef.current += 100
        accrueReward()
        if (level >= LEVELS.length) {
          stateRef.current = 'won'
          forceRender()
          return
        }
        stateRef.current = 'between'
        forceRender()
        return
      }

      // Update powers — apply ONLY when caught by paddle.
      const paddle = paddleRef.current
      const powSize = 18
      for (let i = powersRef.current.length - 1; i >= 0; i--) {
        const p = powersRef.current[i]
        p.y += p.vy * dt
        const overPaddle =
          p.y + powSize >= PADDLE_Y &&
          p.y <= PADDLE_Y + paddle.h &&
          p.x >= paddle.x &&
          p.x <= paddle.x + paddle.w
        if (overPaddle) {
          applyPower(p.kind)
          powersRef.current.splice(i, 1)
          continue
        }
        if (p.y > LOGICAL_H + 30) {
          // Missed — silently disappear, NO effect.
          powersRef.current.splice(i, 1)
        }
      }

      // Update bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const bu = bulletsRef.current[i]
        bu.y -= 480 * dt
        if (bu.y < -10) {
          bulletsRef.current.splice(i, 1)
          continue
        }
        for (const b of bricksRef.current) {
          if (!b.alive) continue
          if (bu.x >= b.x && bu.x <= b.x + b.w && bu.y >= b.y && bu.y <= b.y + b.h) {
            b.hp -= 1
            if (b.hp <= 0) {
              b.alive = false
              scoreRef.current += 10
            }
            bulletsRef.current.splice(i, 1)
            break
          }
        }
      }

      // Laser auto-fire
      if (laserUntilRef.current > performance.now()) {
        fireCooldownRef.current -= dt
        if (fireCooldownRef.current <= 0) {
          fireCooldownRef.current = 0.18
          const y = PADDLE_Y - 8
          bulletsRef.current.push({ x: paddle.x + 8, y, vy: 0 })
          bulletsRef.current.push({ x: paddle.x + paddle.w - 8, y, vy: 0 })
        }
      } else if (laserUntilRef.current && laserUntilRef.current < performance.now()) {
        laserUntilRef.current = 0
      }

      // Expire other timed powers
      const ts = performance.now()
      if (wideUntilRef.current && wideUntilRef.current < ts) {
        paddleRef.current.w = PADDLE_W_BASE
        wideUntilRef.current = 0
      }
      if (slowUntilRef.current && slowUntilRef.current < ts) {
        slowUntilRef.current = 0
      }
      if (multiUntilRef.current && multiUntilRef.current < ts) {
        // Multi has worn off — keep just one ball (the fastest one).
        if (ballsRef.current.length > 1) ballsRef.current = ballsRef.current.slice(0, 1)
        multiUntilRef.current = 0
      }
    }

    function maybeDropPower(b: Brick) {
      const level = levelRef.current
      // Tutorial level guarantees the queued power-up appears on the
      // first five destroyed bricks, in order.
      if (level === 1 && tutorialQueueRef.current.length > 0) {
        const kind = tutorialQueueRef.current.shift()!
        powersRef.current.push({ x: b.x + b.w / 2, y: b.y + b.h, vy: 70, kind })
        return
      }
      const cfg = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))]
      if (Math.random() < cfg.powerDropChance) {
        const kinds: PowerKind[] = ['wide', 'slow', 'multi', 'life', 'laser']
        const kind = kinds[Math.floor(Math.random() * kinds.length)]
        powersRef.current.push({ x: b.x + b.w / 2, y: b.y + b.h, vy: 90, kind })
      }
    }

    function applyPower(kind: PowerKind) {
      const now = performance.now()
      if (kind === 'wide') {
        paddleRef.current.w = PADDLE_W_WIDE
        wideUntilRef.current = now + POWER_DURATION_MS.wide
      } else if (kind === 'slow') {
        slowUntilRef.current = now + POWER_DURATION_MS.slow
      } else if (kind === 'multi') {
        const newBalls: Ball[] = []
        for (const b of ballsRef.current) {
          const speed = Math.hypot(b.vel.x, b.vel.y) || ballBaseSpeed(levelRef.current)
          const angles = [-25, 25]
          for (const deg of angles) {
            const a = Math.atan2(b.vel.y || -1, b.vel.x) + (deg * Math.PI) / 180
            newBalls.push({
              pos: { ...b.pos },
              vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
              r: b.r,
            })
          }
        }
        ballsRef.current.push(...newBalls)
        multiUntilRef.current = now + POWER_DURATION_MS.multi
      } else if (kind === 'life') {
        livesRef.current += 1
      } else if (kind === 'laser') {
        laserUntilRef.current = now + POWER_DURATION_MS.laser
        fireCooldownRef.current = 0
      }
      forceRender()
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [spawnBallOnPaddle, forceRender])

  // ── Input ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function pointerToPaddle(clientX: number) {
      const rect = canvas!.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * LOGICAL_W
      const half = paddleRef.current.w / 2
      paddleRef.current.x = Math.max(0, Math.min(LOGICAL_W - paddleRef.current.w, x - half))
    }

    function onPointerMove(e: PointerEvent) {
      const st = stateRef.current
      if (st !== 'play' && st !== 'ready') return
      pointerToPaddle(e.clientX)
    }
    function onTouchMove(e: TouchEvent) {
      const st = stateRef.current
      if (st !== 'play' && st !== 'ready') return
      e.preventDefault()
      const t = e.touches[0]
      if (t) pointerToPaddle(t.clientX)
    }
    function onPointerDown() {
      if (stateRef.current === 'ready') launchBall()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        if (stateRef.current === 'ready') {
          launchBall()
          e.preventDefault()
          return
        }
      }
      const st = stateRef.current
      if (st !== 'play' && st !== 'ready') return
      const step = 32
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        paddleRef.current.x = Math.max(0, paddleRef.current.x - step)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        paddleRef.current.x = Math.min(LOGICAL_W - paddleRef.current.w, paddleRef.current.x + step)
      }
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [launchBall])

  // ── Reward accrual & claim ───────────────────────────────
  function accrueReward() {
    // Only accrue if the current 24-h window is still pending claim.
    if (!rewardAvailable) return
    const next = Math.min(MAX_DAILY_REWARD_KOPIYKY, readReward() + REWARD_PER_LEVEL_KOPIYKY)
    writeReward(next)
    setReward(next)
  }

  function claimReward() {
    if (!rewardAvailable || reward === 0) return
    writeLastClaim(Date.now())
    writeReward(0)
    setLastClaim(Date.now())
    setReward(0)
  }

  // ── Derived UI state ─────────────────────────────────────
  const state = stateRef.current
  const level = levelRef.current
  const lives = livesRef.current
  const score = scoreRef.current

  const activePowers: Array<{ kind: PowerKind; remaining: number }> = (() => {
    const t = performance.now()
    const out: Array<{ kind: PowerKind; remaining: number }> = []
    if (wideUntilRef.current > t) out.push({ kind: 'wide',  remaining: wideUntilRef.current - t })
    if (slowUntilRef.current > t) out.push({ kind: 'slow',  remaining: slowUntilRef.current - t })
    if (multiUntilRef.current > t) out.push({ kind: 'multi', remaining: multiUntilRef.current - t })
    if (laserUntilRef.current > t) out.push({ kind: 'laser', remaining: laserUntilRef.current - t })
    return out
  })()

  return (
    <>
      <Header title="АРКАНОЇД" showBack />
      <ScreenContainer withTopInset={false}>
        <div className="arkanoid">
          <div className="arkanoid__hud">
            <div className="arkanoid__hud-cell">
              <span className="arkanoid__hud-label">РІВЕНЬ</span>
              <span className="arkanoid__hud-value">{String(level).padStart(2, '0')}/10</span>
            </div>
            <div className="arkanoid__hud-cell">
              <span className="arkanoid__hud-label">ЖИТТЯ</span>
              <span className="arkanoid__hud-value">
                {'●'.repeat(Math.max(0, lives))}{'○'.repeat(Math.max(0, 3 - lives))}
              </span>
            </div>
            <div className="arkanoid__hud-cell">
              <span className="arkanoid__hud-label">ВИНАГОРОДА</span>
              <span className="arkanoid__hud-value">{formatKopiyky(reward)}</span>
            </div>
          </div>

          {/* Active power-ups strip */}
          {activePowers.length > 0 && (
            <div className="arkanoid__powers">
              {activePowers.map((p) => (
                <span key={p.kind} className="arkanoid__power-chip">
                  <span className="arkanoid__power-chip-letter">{POWER_LABELS[p.kind]}</span>
                  {POWER_NAMES_UA[p.kind]} · {Math.ceil(p.remaining / 1000)}s
                </span>
              ))}
            </div>
          )}

          <div className="arkanoid__canvas-wrap">
            <canvas ref={canvasRef} className="arkanoid__canvas" />

            {state === 'ready' && (
              <div className="arkanoid__hint-overlay" onClick={launchBall}>
                <span>Торкніться, щоб запустити кулю</span>
              </div>
            )}

            {state === 'menu' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">АРКАНОЇД</h2>
                <p className="arkanoid__sub">10 рівнів · 5 бонусів · до 10 ₴ нагороди на добу</p>
                <ul className="arkanoid__legend">
                  <li><b>W</b> · Ширша платформа</li>
                  <li><b>S</b> · Сповільнення</li>
                  <li><b>M</b> · Три кулі</li>
                  <li><b>X</b> · Лазер</li>
                  <li><b>L</b> · Додаткове життя</li>
                </ul>
                {rewardAvailable ? (
                  <p className="arkanoid__reward-status arkanoid__reward-status--avail">
                    Винагорода доступна сьогодні
                  </p>
                ) : (
                  <p className="arkanoid__reward-status">
                    Наступна винагорода через {formatHms(cooldownRemaining)}
                  </p>
                )}
                <Button variant="primary" size="lg" fullWidth onClick={restart}>
                  СТАРТ
                </Button>
              </div>
            )}

            {state === 'between' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">РІВЕНЬ {level}</h2>
                <p className="arkanoid__sub">Пройдено! +100 до рахунку · +1 ₴ до винагороди</p>
                <Button variant="primary" size="lg" fullWidth onClick={() => startLevel(level + 1)}>
                  ДАЛІ
                </Button>
              </div>
            )}

            {state === 'gameover' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">ГРА ЗАВЕРШЕНА</h2>
                <p className="arkanoid__sub">Рахунок: {score} · Рівень {level}</p>
                <RewardCta
                  reward={reward}
                  available={rewardAvailable}
                  cooldown={cooldownRemaining}
                  onClaim={claimReward}
                />
                <Button variant="primary" size="lg" fullWidth onClick={restart}>
                  ЩЕ РАЗ
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
                  На головну
                </Button>
              </div>
            )}

            {state === 'won' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">ПЕРЕМОГА</h2>
                <p className="arkanoid__sub">10 рівнів пройдено · Фінальний рахунок: {score}</p>
                <RewardCta
                  reward={reward}
                  available={rewardAvailable}
                  cooldown={cooldownRemaining}
                  onClaim={claimReward}
                />
                <Button variant="primary" size="lg" fullWidth onClick={restart}>
                  ЩЕ РАЗ
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
                  На головну
                </Button>
              </div>
            )}
          </div>

          <p className="arkanoid__hint">
            Рухай платформу пальцем / мишкою / стрілками. Тап або Space — запустити кулю.
          </p>
        </div>
      </ScreenContainer>
    </>
  )
}

function RewardCta({
  reward,
  available,
  cooldown,
  onClaim,
}: {
  reward: number
  available: boolean
  cooldown: number
  onClaim: () => void
}) {
  if (available && reward > 0) {
    return (
      <Button variant="outline" size="lg" fullWidth onClick={onClaim}>
        ЗАБРАТИ {formatKopiyky(reward)}
      </Button>
    )
  }
  if (!available) {
    return (
      <p className="arkanoid__reward-status">
        Сьогодні винагороду вже отримано · {formatHms(cooldown)} до наступної
      </p>
    )
  }
  return null
}
