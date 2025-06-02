
/**
 * Cache management utilities for Vertex Trading Platform
 */

export class CacheManager {
  /**
   * Clear all application caches
   */
  static async clearAllCaches(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  /**
   * Force refresh the application
   */
  static forceRefresh(): void {
    window.location.reload();
  }

  /**
   * Check if user is experiencing cache issues
   */
  static detectCacheIssues(): boolean {
    try {
      // Check if we're getting HTML when we expect JS
      const scripts = document.querySelectorAll('script[src]');
      return Array.from(scripts).some(script => {
        const src = script.getAttribute('src');
        return src && src.includes('.js') && script.innerHTML.includes('<!DOCTYPE');
      });
    } catch {
      return false;
    }
  }

  /**
   * Emergency cache clear and reload
   */
  static async emergencyReset(): Promise<void> {
    await this.clearAllCaches();
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Force hard reload
    window.location.href = window.location.href + '?cache_bust=' + Date.now();
  }
}

// Auto-detect and fix cache issues on load
window.addEventListener('load', () => {
  if (CacheManager.detectCacheIssues()) {
    console.warn('Cache issues detected, performing emergency reset...');
    CacheManager.emergencyReset();
  }
});

// Make cache utilities globally available for debugging
declare global {
  interface Window {
    clearVertexCache: () => Promise<void>;
    emergencyReset: () => Promise<void>;
  }
}

window.clearVertexCache = CacheManager.clearAllCaches;
window.emergencyReset = CacheManager.emergencyReset;
