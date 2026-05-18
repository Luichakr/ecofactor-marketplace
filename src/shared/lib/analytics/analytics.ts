/**
 * Analytics — thin facade over PostHog.
 *
 * - Init is gated by VITE_POSTHOG_KEY. If absent (e.g. local dev w/o key)
 *   every call here is a noop so we never throw or pollute the console.
 * - PostHog autocapture handles clicks/inputs/page-load by default; we add
 *   explicit `track()` calls only where the event meaning isn't obvious
 *   from the DOM (e.g. "user filtered by price").
 * - Identify is wired to the ECOFACTOR WebView userId when available.
 */

import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

let initialized = false

export function initAnalytics(): void {
  if (initialized) return
  if (!KEY) return

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // we drive page views ourselves on route change
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: false,
      maskTextSelector: '[data-private]',
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug(false)
    },
  })

  initialized = true
}

export function isEnabled(): boolean {
  return initialized
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!initialized) return
  posthog.capture(event, props)
}

export function trackPageView(path: string, props?: Record<string, unknown>): void {
  if (!initialized) return
  posthog.capture('$pageview', { $current_url: window.location.origin + path, path, ...props })
}

export function identify(userId: string, props?: Record<string, unknown>): void {
  if (!initialized || !userId) return
  posthog.identify(userId, props)
}

export function resetUser(): void {
  if (!initialized) return
  posthog.reset()
}

export function setSuperProps(props: Record<string, unknown>): void {
  if (!initialized) return
  posthog.register(props)
}
