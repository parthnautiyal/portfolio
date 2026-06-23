import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
          <div className="max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                <HiOutlineExclamationCircle className="text-red-600 dark:text-red-400" size={48} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
                  <summary className="cursor-pointer text-xs font-medium text-red-900 dark:text-red-300">
                    Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto text-[0.65rem] text-red-800 dark:text-red-400">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full border border-slate-900 bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Refresh Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
