
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Download = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (!deferredPrompt && !isIOS) {
      // Fallback for browsers that don't support install prompt
      alert('To install this app:\n\n1. Open your browser menu\n2. Look for "Install app" or "Add to Home Screen"\n3. Follow the prompts');
      return;
    }

    if (isIOS) {
      // iOS-specific instructions
      alert('To install this app on iOS:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Get Started Today
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Install our app and experience seamless trading. Available as a Progressive Web App for all devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handlePWAInstall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cursor-pointer"
              disabled={!isInstallable && !isIOS}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" 
                alt="Download on App Store" 
                className={`h-14 ${(!isInstallable && !isIOS) ? 'opacity-50' : 'opacity-100'}`}
              />
            </motion.button>
            <motion.button
              onClick={handlePWAInstall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cursor-pointer"
              disabled={!isInstallable && !isIOS}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className={`h-14 ${(!isInstallable && !isIOS) ? 'opacity-50' : 'opacity-100'}`}
              />
            </motion.button>
          </div>
          {(isInstallable || isIOS) && (
            <p className="text-sm text-white/50 mt-4">
              Click either button above to install the app on your device
            </p>
          )}
          {window.matchMedia('(display-mode: standalone)').matches && (
            <p className="text-sm text-green-400 mt-4">
              ✓ App already installed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
