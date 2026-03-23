import React, { useState } from 'react';
import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export const PasswordSettings: React.FC = () => {
  const { profile, setCustomPassword } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hasPassword = profile?.has_custom_password ?? false;

  const handleSavePassword = async () => {
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError('Passwords do not match');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const result = await setCustomPassword(trimmedPassword);

      if (result.error) {
        throw result.error;
      }

      setPassword('');
      setConfirmPassword('');

      toast({
        title: hasPassword ? 'Password updated' : 'Password saved',
        description: hasPassword
          ? 'Your login password has been updated.'
          : 'Your account now uses a full password instead of the legacy fallback.',
      });
    } catch (err) {
      console.error('Error saving password:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="password-section"
      className="rounded-xl border border-border/50 bg-card p-[var(--space-sm)] space-y-4 transition-all motion-base"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="font-semibold text-sm sm:text-base">
            Account Password
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all',
            hasPassword
              ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
          )}
        >
          {hasPassword ? 'Protected' : 'Upgrade Needed'}
        </div>
      </div>

      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors',
          hasPassword
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
        )}
      >
        {hasPassword ? (
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              hasPassword
                ? 'text-green-800 dark:text-green-200'
                : 'text-amber-800 dark:text-amber-200'
            )}
          >
            {hasPassword ? 'Full password enabled' : 'Legacy login detected'}
          </p>
          <p
            className={cn(
              'text-xs',
              hasPassword
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {hasPassword
              ? 'Update it here any time.'
              : 'Set a full password to move off the username-based fallback.'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={hasPassword ? 'New password' : 'Create a password'}
          className="min-h-[44px] sm:min-h-[40px]"
          autoComplete="new-password"
        />
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="min-h-[44px] sm:min-h-[40px]"
          autoComplete="new-password"
        />

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <Button
          onClick={handleSavePassword}
          isLoading={isSaving}
          className="w-full min-h-[44px] sm:min-h-[40px]"
        >
          {hasPassword ? 'Update Password' : 'Set Password'}
        </Button>
      </div>
    </div>
  );
};
