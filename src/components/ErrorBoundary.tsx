
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('Global error caught:', error, errorInfo);
    // Optional: send to logging service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold text-destructive">Noe gikk galt</h1>
          <p>Vennligst prøv å laste siden på nytt.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
