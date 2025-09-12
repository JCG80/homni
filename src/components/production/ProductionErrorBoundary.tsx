import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorTracker } from '@/lib/production/ErrorTracker'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  pageName?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error in production monitoring
    errorTracker.trackReactError(error, errorInfo)
    
    logger.error('Production Error Boundary caught an error', { error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback: Fallback } = this.props

      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Noe gikk galt
              </h1>
              <p className="text-muted-foreground">
                Vi beklager, men det oppstod en uventet feil. Feilen er automatisk rapportert til vårt team.
              </p>
              
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Feil-ID: {this.state.errorId}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Prøv igjen
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Gå til forsiden
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Teknisk informasjon (kun i utvikling)
                </summary>
                <pre className="mt-2 p-2 bg-muted text-xs overflow-auto rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}