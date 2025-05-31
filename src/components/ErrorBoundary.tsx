
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to a service like Sentry here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background text-white p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-white/70">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent/80"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
