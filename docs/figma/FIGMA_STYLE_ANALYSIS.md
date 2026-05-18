# Figma Style Analysis

Source: Figma file `bqiaZBYTrRQv0KSChoJ3Pq`
Nodes analyzed: 789:7372, 789:16068, 789:26586, 789:17078, 789:26773, 789:32263, 789:32700, 789:32339, 789:38722, 789:32741, 789:26774, 789:26776, 789:32679, 789:32263

**Important:** Figma contains screens of the existing ECOFACTOR app, not Marketplace screens.

## Observations

| Area | Observation from Figma | Marketplace usage |
|---|---|---|
| Colors | Dark overlay backgrounds in navigation screens; green/dark theme overall | `--color-bg: #050807`, `--color-surface: #101714`, accent `#33ff88` |
| Typography | Font family: Roboto. Scale: H1=24/32, Subtitle=16/24, Body=16/24, Caption=12/16, Button=14/20 SemiBold | Applied in `tokens.css` |
| Cards | Rounded corners, subtle borders, dark backgrounds | `--radius-md: 18px`, border `rgba(255,255,255,0.08)` |
| Buttons | Rounded pill shape, prominent primary action | `border-radius: 9999px`, green primary variant |
| Navigation | Bottom tab bar with 5 items, active item uses accent color | BottomNav component with 5 tabs |
| Spacing | ~16px standard padding, 8px/12px gaps | `--space-4: 16px` primary, `--space-3: 12px` gaps |
| Icons | 24×24 custom icon set (car, filter, user, share, direction arrows) | SVG icons in components |
| Empty states | Centered icon + text pattern | EmptyState component |
| Status badges | Pill badges with accent colors | StatusBadge component |

## Navigation screen (789:38722)

Dark semi-transparent overlay panel on map background:
- Background: dark overlay `rgba(0,0,0,0.7)` approx
- White bold text for main instruction
- Yellow/amber badges for road numbers — not used in Marketplace
- Rounded top corners on the overlay panel

## Icons (789:32339, 789:32741)

App uses a custom 24×24 icon set including:
- car, filter (solid + outline), user (solid + outline), share
- station, heart, map, bell, balance, search, settings
- direction arrows (for navigation feature, not Marketplace)

Marketplace uses simplified SVG icons embedded directly in components.
