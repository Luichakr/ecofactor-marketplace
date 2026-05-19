import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
     
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text)',
            background: 'var(--color-bg)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' }}>
            Щось пішло не так
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 320, lineHeight: 1.5 }}>
            Сталася непередбачена помилка. Спробуйте оновити сторінку — якщо
            проблема повториться, ми вже знаємо й працюємо над виправленням.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              border: 'none',
              padding: '12px 24px',
              fontFamily: 'inherit',
              fontSize: 13,
              letterSpacing: 1,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Оновити
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
