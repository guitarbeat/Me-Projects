import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

export const LegacyPasswordUpgradeDialog: React.FC = () => {
  const { user, profile, setCustomPassword, signOut } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isOpen = !!user && !!profile && !profile.has_custom_password;
  const displayName = profile?.display_name || profile?.username || 'your account';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsSaving(false);
    setIsSigningOut(false);
  }, [isOpen]);

  const handleSavePassword = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirmation = confirmPassword.trim();

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const result = await setCustomPassword(trimmedPassword);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Password upgraded',
        description: 'Your account now uses a full password.',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out.');
      setIsSigningOut(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={() => undefined}>
      <AlertDialogContent className="w-[95vw] sm:w-full max-w-md space-y-4">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <KeyRound className="h-4 w-4 text-primary" />
                Upgrade Your Password
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {displayName} is still using the older username-based fallback
                password. Set a full password now to keep using this calendar.
              </AlertDialogDescription>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your PIN lock stays separate. This only upgrades your account sign-in
            password.
          </p>
        </AlertDialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSavePassword();
          }}
        >
          <div className="space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a new password"
              autoComplete="new-password"
              disabled={isSaving || isSigningOut}
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              disabled={isSaving || isSigningOut}
            />

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              disabled={isSaving}
              isLoading={isSigningOut}
            >
              Sign Out
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isSigningOut}>
              Save Password
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
