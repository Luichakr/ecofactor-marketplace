# Zara References

Visual pattern library extracted from Zara mobile app/site screenshots
shared during the redesign. Used to keep ECOFACTOR Marketplace aligned
with Zara's minimal aesthetic.

## How to add new references

Each batch of screenshots from the user is saved as its own
numbered markdown file with structured notes:

- What the screenshot shows (screen, state)
- Visual patterns to extract (typography, spacing, layout)
- Behavior implied (interactions, transitions)
- File paths in our codebase that should match the pattern

If the user provides actual image files (PNG), drop them next
to the markdown as `01a.png`, `01b.png`, etc. and reference them
in the markdown. Otherwise the text descriptions are the source
of truth.

## Index

- [01 — Catalog & Menu](01-catalog-and-menu.md) — view modes, top tabs, menu list, filters
- [02 — Product card detail](02-product-card.md) — hero image, sticky CTA, color swatches, accordions, related rows

## Open questions

- Custom Zara serif font — currently using system serif (Times New Roman, Georgia).
  If the user provides a custom font file or specifies a webfont (e.g. Cormorant),
  swap `--font-family-serif` in `src/shared/styles/tokens.css`.
- Real product photography — currently products use Unsplash URLs (some 404).
  Future: replace with curated marketplace-friendly stock or skeleton silhouettes.
