import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isCacheIssue: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isCacheIssue: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isCacheIssue = error.message.includes('Unexpected token') || 
                        error.message.includes('SyntaxError') ||
                        error.message.includes('ChunkLoadError');

    return { hasError: true, error, isCacheIssue };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // If it's a cache issue, try to clear cache automatically
    if (this.state.isCacheIssue) {
      this.clearCacheAndReload();
    }
  }

  clearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      window.location.href = window.location.href + '?cache_bust=' + Date.now();
    } catch (err) {
      console.error('Failed to clear cache:', err);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="text-center p-8 bg-black/30 backdrop-blur-lg rounded-lg border border-white/10 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              {this.state.isCacheIssue ? 'Cache Issue Detected' : 'Something went wrong'}
            </h2>

            {this.state.isCacheIssue ? (
              <div>
                <p className="text-white/70 mb-4">
                  We detected a browser cache issue. This often happens when the app updates.
                </p>
                <p className="text-white/60 text-sm mb-6">
                  Try opening the site in incognito mode or clearing your browser cache.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={this.clearCacheAndReload} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Clear Cache & Reload
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()} 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Simple Reload
                  </Button>
                </div>
                <p className="text-white/40 text-xs mt-4">
                  If issues persist, press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
                </p>
              </div>
            ) : (
              <div>
                <p className="text-white/70 mb-6">We encountered an unexpected error.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reload Page
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;