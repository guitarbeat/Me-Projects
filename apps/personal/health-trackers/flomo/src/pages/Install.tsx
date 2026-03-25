import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { showInstallPrompt, isPWAInstalled } from '@/lib/pwa';
import {
  Download,
  Check,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InstallPage: React.FC = () => {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isPWAInstalled());

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    // Listen for install prompt availability
    const handleBeforeInstall = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if prompt is already available
    if ((window as any).deferredPrompt) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setIsInstalled(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-pink/10 via-peach/5 to-lavender/10">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold font-comfortaa gradient-text">
            Already Installed!
          </h1>
          <p className="text-muted-foreground font-quicksand">
            Flo & Tell is already installed on your device. You can find it on
            your home screen.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-coral to-rose-pink text-white font-quicksand"
          >
            Open App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-br from-rose-pink/10 via-peach/5 to-lavender/10 safe-top safe-bottom">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <img
          src="/flo.png"
          alt="Flo & Tell"
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold font-comfortaa gradient-text">
          Install Flo & Tell
        </h1>
        <p className="text-muted-foreground font-quicksand mt-2">
          Add to your home screen for the best experience
        </p>
      </div>

      {/* Benefits */}
      <div className="flex-1 space-y-4 max-w-md mx-auto w-full">
        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-pink/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-coral" />
            </div>
            <div>
              <h3 className="font-semibold font-quicksand">
                Works Like a Native App
              </h3>
              <p className="text-sm text-muted-foreground">
                Full-screen experience without browser bars
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-pink/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-pink/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-rose-pink" />
            </div>
            <div>
              <h3 className="font-semibold font-quicksand">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Access your calendar even without internet
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-pink/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-lavender/30 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-lavender" />
            </div>
            <div>
              <h3 className="font-semibold font-quicksand">Quick Access</h3>
              <p className="text-sm text-muted-foreground">
                Launch instantly from your home screen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Install Instructions */}
      <div className="mt-8 max-w-md mx-auto w-full space-y-4">
        {canInstall ? (
          /* Native install prompt available */
          <Button
            onClick={handleInstall}
            className="w-full py-6 text-lg bg-gradient-to-r from-coral to-rose-pink text-white font-quicksand font-semibold rounded-2xl shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : isIOS ? (
          /* iOS Safari instructions */
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-rose-pink/20 space-y-4">
            <h3 className="font-semibold font-quicksand text-center">
              Install on iPhone/iPad
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Tap the</span>
                  <Share className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Share button</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Scroll and tap</span>
                  <PlusSquare className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">
                    Add to Home Screen
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600">
                  3
                </div>
                <span className="text-sm">
                  Tap <span className="font-medium">Add</span> in the top right
                </span>
              </div>
            </div>
          </div>
        ) : isAndroid ? (
          /* Android Chrome instructions */
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-rose-pink/20 space-y-4">
            <h3 className="font-semibold font-quicksand text-center">
              Install on Android
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Tap the</span>
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">menu button</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">
                  2
                </div>
                <span className="text-sm">
                  Tap <span className="font-medium">Install app</span> or{' '}
                  <span className="font-medium">Add to Home screen</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">
                  3
                </div>
                <span className="text-sm">
                  Tap <span className="font-medium">Install</span> to confirm
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop instructions */
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-5 border border-rose-pink/20 space-y-4">
            <h3 className="font-semibold font-quicksand text-center">
              Install on Desktop
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Look for the install icon in your browser's address bar, or use
              the browser menu to install this app.
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full font-quicksand"
        >
          Continue in Browser
        </Button>
      </div>
    </div>
  );
};
