
/**
 * Cache management utilities for Vertex Trading Platform
 */

// Current app version - bump this on each deployment
const APP_VERSION = '1.0.5';
const VERSION_KEY = 'vertex_app_version';

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

  /**
   * Check if app version has changed and clear cache if needed
   */
  static checkVersionAndClearCache(): boolean {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      
      if (storedVersion && storedVersion !== APP_VERSION) {
        console.log(`Version changed from ${storedVersion} to ${APP_VERSION}, clearing cache...`);
        this.emergencyReset();
        return true;
      } else if (!storedVersion) {
        // First time visit
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        console.log(`App version ${APP_VERSION} initialized`);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking version:', error);
      return false;
    }
  }

  /**
   * Update stored version after successful cache clear
   */
  static updateStoredVersion(): void {
    try {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      console.log(`Version updated to ${APP_VERSION}`);
    } catch (error) {
      console.error('Error updating version:', error);
    }
  }

  /**
   * Auto-detect cache issues based on common error patterns
   */
  static detectAdvancedCacheIssues(): boolean {
    try {
      // Check for common cache-related errors in console
      const hasConsoleErrors = window.console && console.error;
      
      // Check if any script tags contain HTML instead of JS
      const scripts = document.querySelectorAll('script[src]');
      const hasHtmlInScripts = Array.from(scripts).some(script => {
        const src = script.getAttribute('src');
        return src && src.includes('.js') && script.innerHTML.includes('<!DOCTYPE');
      });

      // Check for missing or corrupted chunks
      const hasChunkErrors = document.querySelectorAll('script[src*="chunk"]').length === 0;

      return hasHtmlInScripts || hasChunkErrors || this.detectCacheIssues();
    } catch {
      return false;
    }
  }
}

// Make cache utilities globally available for debugging
declare global {
  interface Window {
    clearVertexCache: () => Promise<void>;
    emergencyReset: () => Promise<void>;
  }
}

window.clearVertexCache = CacheManager.clearAllCaches;
window.emergencyReset = CacheManager.emergencyReset;
