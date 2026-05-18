# Mobile WebView Review Skill

Use this skill to review whether a screen is ready for mobile WebView usage.

## Checklist

- [ ] `viewport-fit=cover` in index.html
- [ ] `env(safe-area-inset-top)` applied to header
- [ ] `env(safe-area-inset-bottom)` applied to bottom nav
- [ ] Touch targets are minimum 44px height
- [ ] No hover-only UX
- [ ] Bottom navigation does not overlap content (content has bottom padding)
- [ ] Loading state exists for async operations
- [ ] Empty state exists for empty lists
- [ ] External links are controlled (no unexpected navigation)
- [ ] No auth tokens in localStorage
- [ ] Native bridge logic is isolated in `src/shared/lib/webview/`
- [ ] `isInsideWebView()` used before native calls
