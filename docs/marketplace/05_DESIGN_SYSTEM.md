# Design System

## Source

Figma file `bqiaZBYTrRQv0KSChoJ3Pq` — used as visual style reference for the existing ECOFACTOR app.

All tokens are in `src/shared/styles/tokens.css`.

## Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#050807` | Page background |
| `--color-surface` | `#101714` | Cards, panels |
| `--color-surface-elevated` | `#17211d` | Elevated cards, inputs |
| `--color-accent` | `#33ff88` | Primary actions, active states |
| `--color-accent-soft` | `rgba(51,255,136,0.14)` | Accent backgrounds |
| `--color-text` | `#f4fff8` | Primary text |
| `--color-text-muted` | `#8fa098` | Secondary text, labels |
| `--color-border` | `rgba(255,255,255,0.08)` | Dividers, card borders |

## Typography (Roboto)

| Style | Size | Weight | Line height |
|---|---|---|---|
| H1 | 24px | Medium 500 | 32px |
| Subtitle1 | 16px | Medium 500 | 24px |
| Subtitle2 | 14px | Medium 500 | 20px |
| Body1 | 16px | Regular 400 | 24px |
| Body2 | 14px | Regular 400 | 20px |
| Caption | 12px | Regular 400 | 16px |
| Button | 14px | SemiBold 600 | 20px |

## Spacing

4px grid: `--space-1` (4px) through `--space-16` (64px).

## Radius

| Token | Value |
|---|---|
| `--radius-sm` | 12px |
| `--radius-md` | 18px |
| `--radius-lg` | 24px |
| `--radius-xl` | 32px |
| `--radius-full` | 9999px |

## Components

All shared components in `src/shared/ui/`:

| Component | Description |
|---|---|
| `AppShell` | Full-height mobile frame, desktop centered |
| `Header` | Sticky header with back button and title |
| `BottomNav` | Fixed bottom navigation, 5 tabs |
| `Button` | primary / secondary / ghost / outline variants |
| `Card` | Base card with optional click handler |
| `SearchInput` | Search field with clear button |
| `StatusBadge` | Colored status pill |
| `EmptyState` | Centered empty state with optional action |
| `FilterChip` | Toggle chip for quick filters |
| `StickyCTA` | Gradient sticky bottom CTA area |
| `Input` | Labeled text input with error state |
