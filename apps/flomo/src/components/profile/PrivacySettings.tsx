import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
export const PrivacySettings: React.FC = () => {
  const { profile, session, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from profile or localStorage fallback
  useEffect(() => {
    if (profile) {
      // Check if profile has is_private field (from DB)
      const profileWithPrivacy = profile as typeof profile & {
        is_private?: boolean;
      };
      if (typeof profileWithPrivacy.is_private === 'boolean') {
        setIsPrivate(profileWithPrivacy.is_private);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(`privacy_${profile.id}`);
        setIsPrivate(stored === 'true');
      }
    }
  }, [profile]);

  const handleTogglePrivacy = async () => {
    if (!session?.user || !profile) {
      return;
    }

    const newValue = !isPrivate;
    setIsSaving(true);

    try {
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ is_private: newValue })
        .eq('id', session.user.id);

      if (error) {
        throw error;
      }

      // Update local state and localStorage fallback
      setIsPrivate(newValue);
      localStorage.setItem(`privacy_${profile.id}`, String(newValue));

      // Refresh profile to get updated data
      refreshProfile();

      toast({
        title: newValue ? 'Account hidden' : 'Account visible',
        description: newValue
          ? 'Your profile is now hidden from discovery'
          : 'Your profile is now visible to others',
      });
    } catch (err) {
      console.error('Error updating privacy:', err);
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="privacy-section"
      className="rounded-xl border border-border/50 bg-card p-[var(--space-sm)] space-y-3 transition-all motion-base"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          )}
          <span className="font-semibold text-sm sm:text-base">
            Account Privacy
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all',
            isPrivate
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
              : 'bg-muted/50 text-muted-foreground'
          )}
        >
          {isPrivate ? 'Hidden' : 'Visible'}
        </div>
      </div>

      {/* Status + Action */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors',
          isPrivate
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : 'bg-muted/30 border-border/50'
        )}
      >
        {isPrivate ? (
          <EyeOff className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        ) : (
          <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isPrivate ? 'text-amber-800 dark:text-amber-200' : ''
            )}
          >
            {isPrivate ? 'Profile hidden' : 'Profile visible'}
          </p>
          <p
            className={cn(
              'text-xs truncate',
              isPrivate
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            )}
          >
            {isPrivate
              ? "Others can't discover you"
              : 'Visible in sharing options'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePrivacy}
          disabled={isSaving}
          className="min-h-[44px] sm:min-h-[36px] px-3 shrink-0"
          aria-label={
            isPrivate
              ? 'Profile is hidden. Toggle to make visible.'
              : 'Profile is visible. Toggle to hide.'
          }
          aria-pressed={isPrivate}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPrivate ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
