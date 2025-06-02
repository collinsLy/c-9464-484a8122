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
   * Emergency cache clear and reload (manual only)
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
   * Check version without automatic actions
   */
  static checkVersion(): { hasChanged: boolean; oldVersion: string | null; newVersion: string } {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);

      if (!storedVersion) {
        // First time visit - just store the version
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        console.log(`App version ${APP_VERSION} initialized`);
        return { hasChanged: false, oldVersion: null, newVersion: APP_VERSION };
      }

      const hasChanged = storedVersion !== APP_VERSION;

      if (hasChanged) {
        console.log(`Version changed from ${storedVersion} to ${APP_VERSION}`);
        // Don't automatically clear cache - let user decide
      }

      return { hasChanged, oldVersion: storedVersion, newVersion: APP_VERSION };
    } catch (error) {
      console.error('Error checking version:', error);
      return { hasChanged: false, oldVersion: null, newVersion: APP_VERSION };
    }
  }

  /**
   * Update stored version after manual cache clear
   */
  static updateStoredVersion(): void {
    try {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      console.log(`Version updated to ${APP_VERSION}`);
    } catch (error) {
      console.error('Error updating version:', error);
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