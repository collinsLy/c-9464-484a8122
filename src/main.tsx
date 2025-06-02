// Viewport height fix for mobile devices
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial value
setVH();

// Update on resize and orientation change
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', () => {
  setTimeout(setVH, 100);
});


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CacheManager } from './lib/cache-utils'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add error handling for the root render
function initializeApp() {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);

    // Check if this is a cache-related error
    const isCacheError = error.message.includes('SyntaxError') || 
                        error.message.includes('Unexpected token') ||
                        error.message.includes('ChunkLoadError');

    if (isCacheError) {
      console.warn('Cache-related error detected, clearing cache...');
      try {
        CacheManager.emergencyReset();
      } catch (cacheError) {
        console.error('Failed to clear cache:', cacheError);
        window.location.reload();
      }
      return;
    }

    // Fallback if React fails to mount
    document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; padding: 20px; text-align: center;">
      <div>
        <h1>Loading Error</h1>
        <p>Unable to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #F2FF44; color: #000; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
  }
}

// Initialize the app
initializeApp();