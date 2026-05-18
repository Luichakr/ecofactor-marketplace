# ECOFACTOR UI Review Skill

Use this skill to review whether UI matches ECOFACTOR Marketplace style.

## Visual rules

- Dark theme (`--color-bg: #050807`, `--color-surface: #101714`)
- ECOFACTOR green accent (`--color-accent: #33ff88`)
- Large rounded cards (`--radius-md: 18px`, `--radius-lg: 24px`)
- Soft shadows
- Mobile app feeling — no admin panel look
- Big readable typography — Roboto
- Bottom navigation with accent color for active item
- Sticky CTA for product detail and landing screens
- Ukrainian UI text by default

## Avoid

- Copying unrelated existing app screens as Marketplace screens
- Generic Bootstrap look
- Desktop-first layout
- Tiny controls (under 44px)
- Too much text on first screen
- Hover-only interactions
- Hardcoded colors outside tokens.css

## Design tokens

All colors, spacing, radius, shadow values live in:
`src/shared/styles/tokens.css`

Never hardcode hex values outside that file.
