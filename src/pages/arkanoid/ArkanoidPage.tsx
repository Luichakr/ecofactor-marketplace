import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { ROUTES } from '../../shared/config/routes'
import './ArkanoidPage.css'

/* ──────────────────────────────────────────────────────────────
   ECOFACTOR Arkanoid
   ──────────────────────────────────────────────────────────────
   - HTML5 Canvas
   - 10 levels, increasing brick density + ball speed
   - Power-ups drop from bricks: WIDE, SLOW, MULTI, LIFE, LASER
   - Black & white theme, matches app aesthetic
   - Touch/mouse: paddle follows finger horizontally
   - Keyboard: ← → arrows / A / D
   ────────────────────────────────────────────────────────────── */

type Vec = { x: number; y: number }

type Ball = { pos: Vec; vel: Vec; r: number }

type Brick = {
  x: number
  y: number
  w: number
  h: number
  hp: number // hit points
  alive: boolean
}

type PowerKind = 'wide' | 'slow' | 'multi' | 'life' | 'laser'
type Power = { x: number; y: number; vy: number; kind: PowerKind }

type Bullet = { x: number; y: number; vy: number }

type GameState = 'menu' | 'play' | 'between' | 'gameover' | 'won' | 'paused'

const LOGICAL_W = 480
const LOGICAL_H = 720

const BRICK_ROWS = 6
const BRICK_COLS = 8
const BRICK_PADDING = 4

const POWER_COLORS: Record<PowerKind, string> = {
  wide: '#000000',
  slow: '#000000',
  multi: '#000000',
  life: '#000000',
  laser: '#000000',
}

const POWER_LABELS: Record<PowerKind, string> = {
  wide: 'W',
  slow: 'S',
  multi: 'M',
  life: 'L',
  laser: 'X',
}

/**
 * Build a level layout: 10 levels, escalating density of bricks +
 * occasional 2-hp bricks at high levels.
 */
function buildLevel(level: number): Brick[] {
  const bricks: Brick[] = []
  // Filled rows grow with level
  const fillRows = Math.min(BRICK_ROWS, 2 + Math.floor(level * 0.5))
  const cellW = (LOGICAL_W - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS
  const cellH = 18
  const offsetY = 60

  for (let r = 0; r < fillRows; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      // Skip pattern to make levels visually distinct
      const skip = (() => {
        if (level === 1) return false
        if (level === 2) return (c + r) % 2 === 1
        if (level === 3) return c === 0 || c === BRICK_COLS - 1
        if (level === 4) return r === 1 && (c === 2 || c === 5)
        if (level === 5) return c % 2 === 1 && r % 2 === 0
        if (level === 6) return r === 2 && c % 2 === 0
        if (level === 7) return false
        if (level === 8) return (r + c) % 3 === 0
        if (level === 9) return false
        return false
      })()
      if (skip) continue
      // 2-HP bricks at level >= 5, central rows only
      const hp = level >= 5 && r === 0 ? 2 : 1
      bricks.push({
        x: BRICK_PADDING + c * (cellW + BRICK_PADDING),
        y: offsetY + r * (cellH + BRICK_PADDING),
        w: cellW,
        h: cellH,
        hp,
        alive: true,
      })
    }
  }
  return bricks
}

function ballBaseSpeed(level: number): number {
  return 240 + (level - 1) * 22 // px/sec
}

export function ArkanoidPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Game state stored in refs so the animation loop sees latest without rerenders
  const stateRef = useRef<GameState>('menu')
  const levelRef = useRef(1)
  const livesRef = useRef(3)
  const scoreRef = useRef(0)
  const paddleRef = useRef({ x: LOGICAL_W / 2 - 50, w: 100, h: 12 })
  const ballsRef = useRef<Ball[]>([])
  const bricksRef = useRef<Brick[]>([])
  const powersRef = useRef<Power[]>([])
  const bulletsRef = useRef<Bullet[]>([])
  const laserUntilRef = useRef(0)
  const wideUntilRef = useRef(0)
  const slowUntilRef = useRef(0)
  const fireCooldownRef = useRef(0)

  // Used to trigger UI re-render for HUD
  const [, setTick] = useState(0)
  const forceRender = useCallback(() => setTick((t) => t + 1), [])

  // ── Reset routines ────────────────────────────────────────
  const newBall = useCallback((level: number): Ball => {
    const speed = ballBaseSpeed(level)
    const angle = (Math.random() * 50 - 25) * (Math.PI / 180) - Math.PI / 2 // mostly up
    return {
      pos: { x: paddleRef.current.x + paddleRef.current.w / 2, y: LOGICAL_H - 60 },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      r: 6,
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
    paddleRef.current = { x: LOGICAL_W / 2 - 50, w: 100, h: 12 }
    ballsRef.current = [newBall(level)]
    stateRef.current = 'play'
    forceRender()
  }, [newBall, forceRender])

  const restart = useCallback(() => {
    scoreRef.current = 0
    livesRef.current = 3
    startLevel(1)
  }, [startLevel])

  // ── Game loop ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to its container (CSS-pixel coords)
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

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const rect = canvas!.getBoundingClientRect()
      const scaleX = rect.width / LOGICAL_W
      const scaleY = rect.height / LOGICAL_H

      ctx!.fillStyle = '#ffffff'
      ctx!.fillRect(0, 0, rect.width, rect.height)

      // Helper to translate logical coords to canvas pixels
      const tx = (x: number) => x * scaleX
      const ty = (y: number) => y * scaleY

      if (stateRef.current === 'play') {
        updateGame(dt, rect.width / scaleX, rect.height / scaleY)
      }

      // Draw bricks
      ctx!.strokeStyle = '#000000'
      ctx!.lineWidth = 1
      for (const b of bricksRef.current) {
        if (!b.alive) continue
        ctx!.fillStyle = b.hp === 2 ? '#000000' : '#f5f5f5'
        ctx!.fillRect(tx(b.x), ty(b.y), tx(b.w) - tx(0), ty(b.h) - ty(0))
        ctx!.strokeRect(tx(b.x) + 0.5, ty(b.y) + 0.5, tx(b.w) - tx(0) - 1, ty(b.h) - ty(0) - 1)
      }

      // Draw paddle
      ctx!.fillStyle = '#000000'
      const pY = LOGICAL_H - 36
      ctx!.fillRect(tx(paddleRef.current.x), ty(pY), tx(paddleRef.current.w) - tx(0), ty(paddleRef.current.h) - ty(0))

      // Draw balls
      for (const ball of ballsRef.current) {
        ctx!.beginPath()
        ctx!.arc(tx(ball.pos.x), ty(ball.pos.y), Math.max(tx(ball.r) - tx(0), 3), 0, Math.PI * 2)
        ctx!.fill()
      }

      // Draw bullets
      ctx!.fillStyle = '#000000'
      for (const bu of bulletsRef.current) {
        ctx!.fillRect(tx(bu.x) - 1, ty(bu.y), 2, ty(8) - ty(0))
      }

      // Draw powers
      for (const p of powersRef.current) {
        ctx!.fillStyle = POWER_COLORS[p.kind]
        ctx!.strokeStyle = '#000000'
        const size = 18
        ctx!.fillRect(tx(p.x) - tx(size) / 2 + tx(0) / 2, ty(p.y), tx(size) - tx(0), ty(size) - ty(0))
        ctx!.strokeRect(tx(p.x) - tx(size) / 2 + tx(0) / 2 + 0.5, ty(p.y) + 0.5, tx(size) - tx(0) - 1, ty(size) - ty(0) - 1)
        ctx!.fillStyle = '#ffffff'
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
        if (ball.pos.x - ball.r < 0) {
          ball.pos.x = ball.r
          ball.vel.x = Math.abs(ball.vel.x)
        }
        if (ball.pos.x + ball.r > w) {
          ball.pos.x = w - ball.r
          ball.vel.x = -Math.abs(ball.vel.x)
        }
        if (ball.pos.y - ball.r < 0) {
          ball.pos.y = ball.r
          ball.vel.y = Math.abs(ball.vel.y)
        }

        // Lost ball
        if (ball.pos.y - ball.r > h) {
          balls.splice(i, 1)
          continue
        }

        // Paddle collision
        const paddle = paddleRef.current
        const pY = LOGICAL_H - 36
        if (
          ball.vel.y > 0 &&
          ball.pos.y + ball.r >= pY &&
          ball.pos.y - ball.r <= pY + paddle.h &&
          ball.pos.x >= paddle.x &&
          ball.pos.x <= paddle.x + paddle.w
        ) {
          ball.pos.y = pY - ball.r
          const t = (ball.pos.x - paddle.x) / paddle.w // 0..1
          const angle = (t - 0.5) * 2 * (Math.PI / 3) - Math.PI / 2 // -60..60 degrees off vertical
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
            // Approximate side from overlap depth
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
              // Random power drop
              if (Math.random() < 0.18) {
                const kinds: PowerKind[] = ['wide', 'slow', 'multi', 'life', 'laser']
                const kind = kinds[Math.floor(Math.random() * kinds.length)]
                powersRef.current.push({ x: b.x + b.w / 2, y: b.y + b.h, vy: 90, kind })
              }
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
        ballsRef.current = [newBall(level)]
      }

      // All bricks broken → next level or win
      if (bricksRef.current.every((b) => !b.alive)) {
        scoreRef.current += 100
        if (level >= 10) {
          stateRef.current = 'won'
          forceRender()
          return
        }
        stateRef.current = 'between'
        forceRender()
        return
      }

      // Update powers
      for (let i = powersRef.current.length - 1; i >= 0; i--) {
        const p = powersRef.current[i]
        p.y += p.vy * dt
        const paddle = paddleRef.current
        const pY = LOGICAL_H - 36
        if (p.y > pY && p.x > paddle.x - 10 && p.x < paddle.x + paddle.w + 10) {
          applyPower(p.kind)
          powersRef.current.splice(i, 1)
          continue
        }
        if (p.y > LOGICAL_H + 30) powersRef.current.splice(i, 1)
      }

      // Update bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const bu = bulletsRef.current[i]
        bu.y -= 480 * dt
        if (bu.y < -10) {
          bulletsRef.current.splice(i, 1)
          continue
        }
        // Brick hit
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
          const paddle = paddleRef.current
          const y = LOGICAL_H - 36 - 8
          bulletsRef.current.push({ x: paddle.x + 8, y, vy: 0 })
          bulletsRef.current.push({ x: paddle.x + paddle.w - 8, y, vy: 0 })
        }
      }

      // Expire power timers — restore paddle width
      if (wideUntilRef.current && wideUntilRef.current < performance.now()) {
        paddleRef.current.w = 100
        wideUntilRef.current = 0
      }
    }

    function applyPower(kind: PowerKind) {
      const now = performance.now()
      if (kind === 'wide') {
        paddleRef.current.w = 160
        wideUntilRef.current = now + 10_000
      } else if (kind === 'slow') {
        slowUntilRef.current = now + 8_000
      } else if (kind === 'multi') {
        const newBalls: Ball[] = []
        for (const b of ballsRef.current) {
          const speed = Math.hypot(b.vel.x, b.vel.y)
          const angles = [-25, 25]
          for (const deg of angles) {
            const a = Math.atan2(b.vel.y, b.vel.x) + (deg * Math.PI) / 180
            newBalls.push({
              pos: { ...b.pos },
              vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
              r: b.r,
            })
          }
        }
        ballsRef.current.push(...newBalls)
      } else if (kind === 'life') {
        livesRef.current += 1
      } else if (kind === 'laser') {
        laserUntilRef.current = now + 8_000
      }
      forceRender()
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [newBall, forceRender])

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
      if (stateRef.current !== 'play') return
      pointerToPaddle(e.clientX)
    }
    function onTouchMove(e: TouchEvent) {
      if (stateRef.current !== 'play') return
      e.preventDefault()
      const t = e.touches[0]
      if (t) pointerToPaddle(t.clientX)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (stateRef.current !== 'play') return
      const step = 32
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        paddleRef.current.x = Math.max(0, paddleRef.current.x - step)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        paddleRef.current.x = Math.min(LOGICAL_W - paddleRef.current.w, paddleRef.current.x + step)
      }
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const state = stateRef.current
  const level = levelRef.current
  const lives = livesRef.current
  const score = scoreRef.current

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
              <span className="arkanoid__hud-value">{'●'.repeat(Math.max(0, lives))}{'○'.repeat(Math.max(0, 3 - lives))}</span>
            </div>
            <div className="arkanoid__hud-cell">
              <span className="arkanoid__hud-label">РАХУНОК</span>
              <span className="arkanoid__hud-value">{score}</span>
            </div>
          </div>

          <div className="arkanoid__canvas-wrap">
            <canvas ref={canvasRef} className="arkanoid__canvas" />

            {state === 'menu' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">АРКАНОЇД</h2>
                <p className="arkanoid__sub">10 рівнів · 5 бонусів · одна спроба врятувати кулю</p>
                <ul className="arkanoid__legend">
                  <li><b>W</b> · Ширша платформа</li>
                  <li><b>S</b> · Сповільнення</li>
                  <li><b>M</b> · Три кулі</li>
                  <li><b>L</b> · Додаткове життя</li>
                  <li><b>X</b> · Лазер</li>
                </ul>
                <Button variant="primary" size="lg" fullWidth onClick={restart}>
                  СТАРТ
                </Button>
              </div>
            )}

            {state === 'between' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">РІВЕНЬ {level}</h2>
                <p className="arkanoid__sub">Пройдено! +100 до рахунку</p>
                <Button variant="primary" size="lg" fullWidth onClick={() => startLevel(level + 1)}>
                  ДАЛІ
                </Button>
              </div>
            )}

            {state === 'gameover' && (
              <div className="arkanoid__overlay">
                <h2 className="arkanoid__title">ГРА ЗАВЕРШЕНА</h2>
                <p className="arkanoid__sub">Рахунок: {score} · Рівень {level}</p>
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
            Рухай платформу пальцем / мишкою / стрілками. Збивай блоки. Лови бонуси.
          </p>
        </div>
      </ScreenContainer>
    </>
  )
}
