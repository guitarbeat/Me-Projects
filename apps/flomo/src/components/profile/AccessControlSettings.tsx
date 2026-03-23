import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { hashPin } from '@/lib/security';

export const AccessControlSettings: React.FC = () => {
  const {
    profile,
    session,
    refreshProfile,
  } = useAuth();
  const { toast } = useToast();

  // Combined access code state
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Setup form state
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if the PIN-based access code is set.
  useEffect(() => {
    if (profile) {
      const profileWithPin = profile as typeof profile & {
        pin_hash?: string | null;
      };
      const hasPinSet = !!profileWithPin.pin_hash;

      // Check localStorage fallback for PIN
      let localPinSet = false;
      if (!hasPinSet) {
        const storedPinHash = localStorage.getItem(`pin_hash_${profile.id}`);
        localPinSet = !!storedPinHash;
      }

      setIsEnabled(hasPinSet || localPinSet);
    }
  }, [profile]);

  // PIN input handlers
  const handlePinChange = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value;

    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    setError('');

    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }

    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        if (!isConfirm && pinStep === 'enter') {
          setPinStep('confirm');
          setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
        } else if (isConfirm && pinStep === 'confirm') {
          const originalPin = pin.join('');
          if (fullPin === originalPin) {
            handleSaveAccessCode(fullPin);
          } else {
            setError('PINs do not match');
            setConfirmPin(['', '', '', '']);
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
          }
        }
      }
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    isConfirm: boolean = false
  ) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmInputRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  // Save the PIN-based access code.
  const handleSaveAccessCode = async (pinValue: string) => {
    if (!session?.user || !profile) {
      return;
    }

    setIsSettingUp(true);
    try {
      // Use secure hash with user ID as salt
      const pinHash = await hashPin(pinValue, session.user.id);

      // Save PIN to database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ pin_hash: pinHash })
        .eq('id', session.user.id);

      if (dbError) {
        throw dbError;
      }

      // Save PIN to localStorage backup
      localStorage.setItem(`pin_hash_${profile.id}`, pinHash);

      setIsEnabled(true);
      setShowSetupForm(false);
      setPinStep('enter');
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      refreshProfile();

      toast({
        title: 'Access code set',
        description: 'Your calendar is now protected',
      });
    } catch (err) {
      console.error('Error saving access code:', err);
      setError('Failed to save access code');
      toast({
        title: 'Error',
        description: 'Failed to set access code',
        variant: 'destructive',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  // Remove the PIN-based access code.
  const handleRemoveAccessCode = async () => {
    if (!session?.user || !profile) {
      return;
    }

    setIsRemoving(true);
    try {
      // Remove PIN from database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ pin_hash: null })
        .eq('id', session.user.id);

      if (dbError) {
        throw dbError;
      }

      // Remove PIN from localStorage
      localStorage.removeItem(`pin_hash_${profile.id}`);
      localStorage.removeItem(`pin_unlocked_${profile.id}`);

      setIsEnabled(false);
      refreshProfile();

      toast({
        title: 'Access code removed',
        description: 'Your calendar is no longer protected',
      });
    } catch (err) {
      console.error('Error removing access code:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove access code',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  const handleStartSetup = () => {
    setShowSetupForm(true);
    setPinStep('enter');
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setError('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleCancelSetup = () => {
    setShowSetupForm(false);
    setPinStep('enter');
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setError('');
  };

  const handleToggle = () => {
    if (isEnabled) {
      setShowRemoveDialog(true);
    } else {
      handleStartSetup();
    }
  };

  const renderPinInputs = (pinValues: string[], isConfirm: boolean = false) => {
    const refs = isConfirm ? confirmInputRefs : inputRefs;

    return (
      <div className="flex gap-2 justify-center">
        {pinValues.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
            onKeyDown={(e) => handlePinKeyDown(index, e, isConfirm)}
            className="w-12 h-12 text-center text-xl font-bold"
            autoComplete="off"
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        id="access-control-section"
        className="rounded-xl border border-border/50 bg-card p-[var(--space-sm)] space-y-4 transition-all motion-base"
      >
        {/* Header with Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">
              Access Code
            </span>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isSettingUp || isRemoving}
            className={cn(
              'relative w-12 h-7 rounded-full transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isEnabled
                ? 'bg-green-500 dark:bg-green-600'
                : 'bg-muted-foreground/30'
            )}
            aria-label={
              isEnabled ? 'Disable access code' : 'Enable access code'
            }
          >
            <div
              className={cn(
                'absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Status Display */}
        {!showSetupForm && (
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              isEnabled
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                : 'bg-muted/30 border-border/50'
            )}
          >
            {isEnabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Protected
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    4-digit code required to access
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-[10px] font-medium text-green-700 dark:text-green-300">
                  <Check className="h-3 w-3" />
                  On
                </div>
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">No access code</p>
                  <p className="text-xs text-muted-foreground">
                    Tap toggle to set a 4-digit code
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Setup Form */}
        {showSetupForm && (
          <div className="space-y-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
            {pinStep === 'enter' && (
              <div className="space-y-3">
                <p className="text-sm text-center font-medium">
                  Enter a 4-digit access code
                </p>
                {renderPinInputs(pin)}
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-center animate-shake">
                    {error}
                  </p>
                )}
              </div>
            )}

            {pinStep === 'confirm' && (
              <div className="space-y-3">
                <p className="text-sm text-center font-medium">
                  Confirm your access code
                </p>
                {renderPinInputs(confirmPin, true)}
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-center animate-shake">
                    {error}
                  </p>
                )}
                {isSettingUp && (
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSetup}
              className="w-full min-h-[44px]"
              disabled={isSettingUp}
            >
              Cancel
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              This code protects your calendar and account sign-in
            </p>
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="w-[90vw] sm:w-full max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-amber-500" />
              Remove Access Code?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This will remove protection from your calendar and allow sign-in
              without a code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
              disabled={isRemoving}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAccessCode}
              disabled={isRemoving}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] bg-amber-500 text-white hover:bg-amber-600"
            >
              {isRemoving ? 'Removing...' : 'Yes, Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
