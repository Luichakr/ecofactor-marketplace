# Figma Component References

These are components from the **existing ECOFACTOR app** that were used as **visual style references** for Marketplace.

They are NOT the Marketplace screens. They define the visual language.

## App Shell

From analysis of navigation and charging screens:
- Full-height dark background
- Content scrollable in the middle area
- Bottom navigation bar always visible
- Safe area insets applied top and bottom

## Header

- Sticky top
- Height ~56px
- Background matches app background (dark)
- Title: Subtitle1 style (16px Medium)
- Back button: 44px touch target, chevron left icon

## Bottom Navigation

- 5 tab items
- 72px height + safe-area-bottom
- Active item: accent color (#33ff88)
- Inactive: muted text color
- Labels: 10px, Medium weight

## Cards

- Background: `--color-surface`
- Border: `rgba(255,255,255,0.08)`
- Radius: 18px (md) or 24px (lg)
- Subtle shadow on elevated variants
- Active state: slightly lighter background + slight scale

## Buttons

From Button component in Figma (node `789:26751` etc.):
- Height: 40px (component default), 44px+ (accessible minimum)
- Shape: pill (full radius)
- Primary: green background, dark text
- Secondary: surface elevated background

## Inputs

- Background: `--color-surface-elevated`
- Border: `--color-border`
- Radius: 12px
- Height: 48px minimum
- Focus: accent border color

## Status Badges

- Pill shape
- Small font (11px)
- Colored backgrounds matching status:
  - Available/In stock: green soft
  - In transit: blue soft
  - Pre-order: amber soft
