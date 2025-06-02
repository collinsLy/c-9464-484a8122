
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

// Only register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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

// Simple app initialization
function initializeApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    
    // Simple fallback UI
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; padding: 20px; text-align: center;">
        <div>
          <h1>Loading Error</h1>
          <p>Unable to load the application.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #F2FF44; color: #000; border: none; border-radius: 5px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize immediately
initializeApp();
