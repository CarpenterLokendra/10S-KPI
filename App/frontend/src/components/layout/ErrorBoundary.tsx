import React, { ReactNode } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-bg-base to-bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-surface rounded-lg border border-red-500 border-opacity-50 p-8">
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-text-secondary mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-bg-elevated rounded p-3 mb-6 max-h-48 overflow-auto">
                <p className="text-xs font-mono text-red-400 break-words whitespace-pre-wrap">
                  {this.state.error?.stack}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                flex
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                flex
                variant="secondary"
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
