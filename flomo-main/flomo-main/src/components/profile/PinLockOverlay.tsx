import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Timer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { verifyPin, hashPin } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';

interface PinLockOverlayProps {
  children: React.ReactNode;
  onUnlock?: () => void;
}

export const PinLockOverlay: React.FC<PinLockOverlayProps> = ({
  children,
  onUnlock,
}) => {
  const { profile, user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize attempts and lockout from localStorage
  useEffect(() => {
    if (!profile) {
      return;
    }

    const storedAttempts = parseInt(
      localStorage.getItem(`pin_attempts_${profile.id}`) || '0'
    );
    setAttempts(storedAttempts);

    const lockoutUntil = parseInt(
      localStorage.getItem(`pin_lockout_until_${profile.id}`) || '0'
    );
    if (lockoutUntil > Date.now()) {
      setIsLockedOut(true);
      setLockoutTimeLeft(Math.ceil((lockoutUntil - Date.now()) / 1000));
    }
  }, [profile]);

  // Timer for lockout countdown
  useEffect(() => {
    if (!isLockedOut || lockoutTimeLeft <= 0) {
      if (lockoutTimeLeft <= 0 && isLockedOut) {
        // Lockout expired
        setIsLockedOut(false);
        setAttempts(0);
        setPin(['', '', '', '']);
        if (profile) {
          localStorage.removeItem(`pin_lockout_until_${profile.id}`);
          localStorage.setItem(`pin_attempts_${profile.id}`, '0');
        }
        // Focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
      return;
    }

    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockedOut, lockoutTimeLeft, profile]);

  // Check if PIN is required
  useEffect(() => {
    if (!profile || !user) {
      return;
    }

    const profileWithPin = profile as typeof profile & {
      pin_hash?: string | null;
    };
    const storedPinHash =
      profileWithPin.pin_hash || localStorage.getItem(`pin_hash_${profile.id}`);

    if (storedPinHash) {
      // Check if already unlocked this session
      const sessionUnlocked = sessionStorage.getItem(
        `pin_unlocked_${profile.id}`
      );
      if (sessionUnlocked === 'true') {
        setIsLocked(false);
      } else {
        setIsLocked(true);
        if (!isLockedOut) {
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
      }
    } else {
      setIsLocked(false);
    }
  }, [profile, user, isLockedOut]);

  const verifyPinAndUnlock = useCallback(
    async (enteredPin: string) => {
      if (!profile || !user || isLockedOut) {
        return;
      }

      const profileWithPin = profile as typeof profile & {
        pin_hash?: string | null;
      };
      const storedPinHash =
        profileWithPin.pin_hash ||
        localStorage.getItem(`pin_hash_${profile.id}`);

      if (!storedPinHash) {
        setIsLocked(false);
        return;
      }

      try {
        const isValid = await verifyPin(enteredPin, storedPinHash, user.id);

        if (isValid) {
          // Correct PIN
          sessionStorage.setItem(`pin_unlocked_${profile.id}`, 'true');
          setIsLocked(false);
          setPin(['', '', '', '']);
          setError('');
          setAttempts(0);

          // Clear attempts and lockout
          localStorage.removeItem(`pin_attempts_${profile.id}`);
          localStorage.removeItem(`pin_lockout_until_${profile.id}`);

          onUnlock?.();

          // Check if legacy hash upgrade is needed
          if (storedPinHash.startsWith('pin_')) {
            try {
              // Generate new secure hash
              const newHash = await hashPin(enteredPin, user.id);

              // Update profile
              await supabase
                .from('profiles')
                .update({ pin_hash: newHash })
                .eq('id', user.id);

              // Update localStorage if it was there
              if (localStorage.getItem(`pin_hash_${profile.id}`)) {
                localStorage.setItem(`pin_hash_${profile.id}`, newHash);
              }
            } catch (err) {
              console.error('Error upgrading PIN hash:', err);
            }
          }
        } else {
          // Wrong PIN
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          localStorage.setItem(
            `pin_attempts_${profile.id}`,
            String(newAttempts)
          );

          if (newAttempts >= 5) {
            // Lockout for 30 seconds
            const lockoutTime = Date.now() + 30000;
            localStorage.setItem(
              `pin_lockout_until_${profile.id}`,
              String(lockoutTime)
            );
            setIsLockedOut(true);
            setLockoutTimeLeft(30);
            setError('Too many attempts');
            setPin(['', '', '', '']);
          } else {
            setIsShaking(true);
            setError('Incorrect PIN');
            setPin(['', '', '', '']);

            setTimeout(() => {
              setIsShaking(false);
              inputRefs.current[0]?.focus();
            }, 500);
          }
        }
      } catch (err) {
        console.error('Error verifying PIN:', err);
        setError('Verification failed');
      }
    },
    [profile, user, onUnlock, attempts, isLockedOut]
  );

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    if (isLockedOut) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        verifyPinAndUnlock(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // If not locked, render children directly
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurred background content */}
      <div className="blur-lg pointer-events-none opacity-30">{children}</div>

      {/* PIN Entry Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div
          className={cn(
            'w-full max-w-sm mx-4 p-6 bg-card rounded-2xl shadow-2xl border',
            isShaking && 'animate-shake'
          )}
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Lock Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isLockedOut ? 'bg-destructive/10' : 'bg-primary/10'
              )}
            >
              {isLockedOut ? (
                <Timer className="h-8 w-8 text-destructive animate-pulse" />
              ) : (
                <Lock className="h-8 w-8 text-primary" />
              )}
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 id="pin-heading" className="text-xl font-semibold">
                {isLockedOut ? 'Locked Out' : 'Enter PIN'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLockedOut
                  ? `Too many attempts. Try again in ${lockoutTimeLeft}s`
                  : 'Enter your 4-digit PIN to access your calendar'}
              </p>
            </div>

            {/* PIN Inputs */}
            <div
              className="flex gap-3"
              role="group"
              aria-labelledby="pin-heading"
            >
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLockedOut}
                  className={cn(
                    'w-14 h-14 text-center text-2xl font-bold',
                    error &&
                      !isLockedOut &&
                      'border-destructive focus-visible:ring-destructive',
                    isLockedOut && 'opacity-50 cursor-not-allowed'
                  )}
                  autoComplete="off"
                  aria-label={`Digit ${index + 1} of 4`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className={cn(
                  'text-sm animate-fade-in',
                  isLockedOut
                    ? 'text-destructive font-semibold'
                    : 'text-destructive'
                )}
              >
                {error}
                {!isLockedOut && attempts >= 3 && (
                  <span className="block text-xs mt-1 text-muted-foreground">
                    Hint: Check your PIN in account settings
                  </span>
                )}
              </div>
            )}

            {/* Attempts indicator */}
            {!isLockedOut && attempts > 0 && attempts < 5 && (
              <p className="text-xs text-muted-foreground">
                {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check if PIN lock is enabled
export const usePinLock = () => {
  const { profile } = useAuth();

  const hasPinLock = useCallback(() => {
    if (!profile) {
      return false;
    }
    const profileWithPin = profile as typeof profile & {
      pin_hash?: string | null;
    };
    return !!(
      profileWithPin.pin_hash || localStorage.getItem(`pin_hash_${profile.id}`)
    );
  }, [profile]);

  const isUnlocked = useCallback(() => {
    if (!profile) {
      return true;
    }
    const profileWithPin = profile as typeof profile & {
      pin_hash?: string | null;
    };
    const storedPinHash =
      profileWithPin.pin_hash || localStorage.getItem(`pin_hash_${profile.id}`);
    if (!storedPinHash) {
      return true;
    }
    return sessionStorage.getItem(`pin_unlocked_${profile.id}`) === 'true';
  }, [profile]);

  const lock = useCallback(() => {
    if (profile) {
      sessionStorage.removeItem(`pin_unlocked_${profile.id}`);
    }
  }, [profile]);

  return { hasPinLock, isUnlocked, lock };
};
