# Security Checklist

## Frontend security rules

- [ ] Do not store auth tokens in `localStorage` or `sessionStorage`
- [ ] Do not read or print `.env` files
- [ ] Do not commit `.env` files (use `.gitignore`)
- [ ] Do not hardcode API keys, passwords, or secrets in source code
- [ ] Do not expose internal API endpoints in client-side code

## WebView bridge security

- [ ] Validate all messages received from the native side
- [ ] Do not blindly execute code from native messages
- [ ] Do not expose sensitive user data in WebView events
- [ ] Use `isInsideWebView()` before making native calls

## Dependencies

- [ ] Do not add dependencies without clear justification
- [ ] Prefer zero-dependency solutions for simple tasks
- [ ] Audit new dependencies before adding them
- [ ] **Known issue (Stage 0.3):** esbuild ≤0.24.2 (via Vite ≤6.4.1) — moderate severity GHSA-67mh-4wv8-2f99 — development server only, not a production runtime vulnerability. Upgrade to Vite 8 deferred to pre-production stage.

## Claude Code safety

- [ ] Do not use `dangerously-skip-permissions`
- [ ] Do not run `git reset --hard` or `git push --force` without user consent
- [ ] Do not delete files without user consent
- [ ] Deny rules in `.claude/settings.json` protect sensitive paths

## Production checklist (future stages)

- [ ] HTTPS only
- [ ] CSP headers
- [ ] No console.log with sensitive data
- [ ] No debug information in production build
