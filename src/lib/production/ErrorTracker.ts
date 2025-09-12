import { supabase } from "@/integrations/supabase/client"

export interface ErrorReport {
  error_type: string
  error_message: string
  stack_trace?: string
  user_id?: string
  session_id?: string
  user_agent?: string
  url?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  metadata?: Record<string, any>
}

class ErrorTracker {
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandlers()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        error_type: 'javascript_error',
        error_message: event.message,
        stack_trace: event.error?.stack,
        url: event.filename,
        severity: 'error',
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
          source: 'global_error_handler'
        }
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        error_type: 'unhandled_promise_rejection',
        error_message: event.reason?.message || 'Unhandled promise rejection',
        stack_trace: event.reason?.stack,
        severity: 'error',
        metadata: {
          reason: event.reason,
          source: 'unhandled_rejection'
        }
      })
    })
  }

  async trackError(errorReport: Partial<ErrorReport>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const report: ErrorReport = {
        error_type: errorReport.error_type || 'unknown',
        error_message: errorReport.error_message || 'No message provided',
        stack_trace: errorReport.stack_trace,
        user_id: user?.id,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        url: window.location.href,
        severity: errorReport.severity || 'error',
        metadata: {
          ...errorReport.metadata,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }

      await supabase.from('error_tracking').insert(report)
    } catch (insertError) {
      // Fallback: log to console if database tracking fails
      console.error('Failed to track error:', insertError)
      console.error('Original error:', errorReport)
    }
  }

  // React Error Boundary helper
  trackReactError(error: Error, errorInfo: any) {
    this.trackError({
      error_type: 'react_error',
      error_message: error.message,
      stack_trace: error.stack,
      severity: 'error',
      metadata: {
        componentStack: errorInfo.componentStack,
        source: 'react_error_boundary'
      }
    })
  }

  // API Error helper
  trackAPIError(endpoint: string, status: number, message: string) {
    this.trackError({
      error_type: 'api_error',
      error_message: `API Error: ${status} - ${message}`,
      severity: status >= 500 ? 'error' : 'warning',
      metadata: {
        endpoint,
        status_code: status,
        source: 'api_call'
      }
    })
  }

  // Custom error tracking
  trackCustomError(type: string, message: string, severity: ErrorReport['severity'] = 'error', metadata?: Record<string, any>) {
    this.trackError({
      error_type: type,
      error_message: message,
      severity,
      metadata: {
        ...metadata,
        source: 'custom_tracking'
      }
    })
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker()