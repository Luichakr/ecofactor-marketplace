# WebView Integration

## Current status (Stage 0)

WebView bridge stubs are in place but no real native integration.

## Viewport setup

`index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

## Safe area insets

Used in CSS via:
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

Applied in:
- `AppShell.css` — overall container
- `Header.css` — handles `padding-top: env(safe-area-inset-top)` for screens with a header
- `ScreenContainer.css` — `screen-container--with-top-inset` modifier (default on, disabled on pages that already have a Header)
- `BottomNav.css` — bottom navigation

**Safe-area rule:** Header owns `safe-area-top`. Pages that have a Header must pass `withTopInset={false}` to `ScreenContainer` to avoid double padding. Pages without a Header (e.g. `/marketplace`) use the default `withTopInset={true}`.

## WebView bridge

Files: `src/shared/lib/webview/webviewBridge.ts`

Functions:
- `isInsideWebView()` — detects iOS/Android WebView
- `sendWebViewEvent(event)` — sends event to native app
- `onNativeBack(callback)` — handles Android back button

## iOS WKWebView

- Bridge via `window.webkit.messageHandlers.ecofactorBridge.postMessage()`
- Status bar: use `black-translucent` + safe-area CSS

## Android WebView

- Bridge via `window.ecofactorAndroid.postMessage(json)`
- Hardware back button via postMessage from native side

## Future work

- Deep link handling (open specific product from push notification)
- Native auth token passing (for Stage 8+)
- Scroll position preservation on back navigation
- Pull-to-refresh support

## Security

- Never store auth tokens in localStorage
- Validate all messages received from native side
- Do not expose sensitive data in WebView events
