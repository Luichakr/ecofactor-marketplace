# Figma Tokens

Extracted from Figma file `bqiaZBYTrRQv0KSChoJ3Pq`.

Applied in: `src/shared/styles/tokens.css`

## Colors

| Token | Hex | Source |
|---|---|---|
| `--color-bg` | `#050807` | Dark app background (derived from navigation screen overlay) |
| `--color-surface` | `#101714` | Card/panel surface |
| `--color-surface-elevated` | `#17211d` | Elevated elements, inputs |
| `--color-accent` | `#33ff88` | ECOFACTOR green — primary accent |
| `--color-text` | `#f4fff8` | Primary text (warm white with green tint) |
| `--color-text-muted` | `#8fa098` | Secondary text |
| `--color-border` | `rgba(255,255,255,0.08)` | Subtle borders |
| Neutral gray-40 | `#61646b` | From Figma CSS variable `--neutral/gray-40` |

## Typography

| Style | Size | Weight | Line height | Letter spacing | Font |
|---|---|---|---|---|---|
| Header 1 | 24px | 500 Medium | 32px | 0% | Roboto |
| Subtitle 1 | 16px | 500 Medium | 24px | 0% | Roboto |
| Subtitle 2 | 14px | 500 Medium | 20px | 0.1% | Roboto |
| Body 1 | 16px | 400 Regular | 24px | 0.5% | Roboto |
| Body 2 | 14px | 400 Regular | 20px | 0.25% | Roboto |
| Caption | 12px | 400 Regular | 16px | 0.4% | Roboto |
| Button | 14px | 600 SemiBold | 20px | 0.4% | Roboto |

Source node: `789:32263` (Typography section)

## Radius

Derived from visual inspection:
- Small buttons/chips: 12px (`--radius-sm`)
- Cards: 18px (`--radius-md`)
- Large cards: 24px (`--radius-lg`)
- Pill buttons: 9999px (`--radius-full`)

## Shadows

Applied from app navigation screen analysis:
- Soft: `0 8px 32px rgba(0,0,0,0.32)`
- Elevated: `0 18px 60px rgba(0,0,0,0.40)`
