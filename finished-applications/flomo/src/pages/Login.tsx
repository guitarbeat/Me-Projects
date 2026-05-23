import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingUserBubbles } from '@/components/bubbles/FloatingUserBubbles';
import { Confetti } from '@/components/feedback/Confetti';
import { useExistingUsers } from '@/hooks/useExistingUsers';
import {
  Loader2,
  User,
  Sparkles,
  AlertCircle,
  Check,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 40 };
    navigator.vibrate(patterns[style]);
  }
};

// Time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

// Login Skeleton Component
const LoginSkeleton: React.FC = () => (
  <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-rose-pink/10 via-peach/5 to-lavender/10">
    {/* Logo skeleton */}
    <div className="flex flex-col items-center pt-8 pb-4 z-10">
      <div className="skeleton w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
      <div className="skeleton h-9 w-40 mt-3 rounded-xl" />
      <div className="skeleton h-5 w-32 mt-2 rounded-lg" />
    </div>

    {/* Form skeleton */}
    <div className="px-6 py-4 z-10 max-w-md mx-auto w-full space-y-4">
      <div className="skeleton h-[52px] w-full rounded-2xl" />
      <div className="skeleton h-[52px] w-full rounded-2xl" />
    </div>

    {/* Separator skeleton */}
    <div className="flex justify-center mt-2">
      <div className="skeleton h-4 w-48 rounded-lg" />
    </div>

    {/* Bubble placeholders */}
    <div className="flex-1 relative mt-8">
      <div className="absolute left-[15%] top-[20%] skeleton w-14 h-14 rounded-full opacity-40" />
      <div className="absolute right-[20%] top-[35%] skeleton w-12 h-12 rounded-full opacity-30" />
      <div className="absolute left-[30%] top-[55%] skeleton w-16 h-16 rounded-full opacity-35" />
    </div>
  </div>
);

interface LoginPageProps {
  isExiting?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isExiting = false }) => {
  const { signInOrSignUp } = useAuth();
  const { userProfiles, loading: usersLoading } = useExistingUsers();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);
  const [buttonState, setButtonState] = useState<
    'idle' | 'checking' | 'signing-in' | 'success'
  >('idle');

  const greeting = useMemo(() => getGreeting(), []);

  const isPasswordError = error.toLowerCase().includes('password');

  // Find matching user as user types
  const matchingUser = useMemo(() => {
    if (!username.trim()) {
      return null;
    }
    return userProfiles.find(
      (p) => p.username.toLowerCase() === username.trim().toLowerCase()
    );
  }, [username, userProfiles]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  // Clear error display after animation
  useEffect(() => {
    if (!showError && error) {
      const timer = setTimeout(() => setError(''), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showError, error]);

  const handleBubbleSignIn = async (usernameValue: string) => {
    setUsername(usernameValue);
    // Auto-submit for bubble sign-in
    setLoading(true);
    setButtonState('signing-in');
    try {
      const result = await signInOrSignUp(usernameValue, usernameValue);
      if (result.error) {
        setError(result.error.message);
        triggerHaptic('heavy');
        setButtonState('idle');
      } else if (result.needsPassword) {
        setShowPasswordField(true);
        setButtonState('idle');
      } else {
        setButtonState('success');
        setShowConfetti(true);
        triggerHaptic('light');
      }
    } catch {
      setError('Something went wrong');
      setButtonState('idle');
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return 'Username is required';
    } else if (value.length < 2) {
      return 'Username must be at least 2 characters';
    } else if (value.length > 50) {
      return 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        setIsUsernameValid(false);
        triggerHaptic('heavy');
        return;
      }

      // If password field is shown but empty, show error
      if (showPasswordField && !password) {
        setError('Password is required');
        triggerHaptic('heavy');
        return;
      }

      triggerHaptic('medium');
      setLoading(true);
      setButtonState('checking');
      setError('');

      try {
        // Brief "checking" state
        await new Promise((resolve) => setTimeout(resolve, 300));
        setButtonState('signing-in');

        const result = await signInOrSignUp(
          username.trim(),
          username.trim(),
          showPasswordField ? password : undefined
        );

        if (result.error) {
          setError(result.error.message);
          triggerHaptic('heavy');
          setButtonState('idle');
        } else if (result.needsPassword) {
          // User has a custom password - show password field
          setShowPasswordField(true);
          setButtonState('idle');
          setError('');
        } else {
          setButtonState('success');
          setShowConfetti(true);
          triggerHaptic('light');
        }
      } catch {
        setError('Something went wrong. Please try again.');
        triggerHaptic('heavy');
        setButtonState('idle');
      } finally {
        setLoading(false);
      }
    },
    [username, password, showPasswordField, validateUsername, signInOrSignUp]
  );

  const handleUsernameChange = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    setUsername(value);
    if (error) {
      setError('');
      setShowError(false);
    }

    if (normalizedValue !== normalizedUsername) {
      setPassword('');
      setShowPassword(false);
      setShowPasswordField(false);
    }

    // Real-time validation feedback
    if (value.length === 0) {
      setIsUsernameValid(null);
      setShowPasswordField(false);
      setPassword('');
    } else {
      const validationError = validateUsername(value);
      setIsUsernameValid(validationError === null);
    }
  };

  if (usersLoading) {
    return <LoginSkeleton />;
  }

  const getButtonContent = () => {
    // If there's a matching user, show quick sign-in option
    if (matchingUser && buttonState === 'idle') {
      return (
        <div className="flex items-center justify-center gap-2">
          <span>
            Sign in as {matchingUser.display_name || matchingUser.username}
          </span>
          <Check className="w-5 h-5" />
        </div>
      );
    }

    switch (buttonState) {
      case 'checking':
        return (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Checking...</span>
          </div>
        );
      case 'signing-in':
        return (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Signing you in...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5 validation-success" />
            <span>Success!</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <span>Continue</span>
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-rose-pink/10 via-peach/5 to-lavender/10 ${
        isExiting ? 'pointer-events-none' : ''
      }`}
      style={{
        transition: 'opacity 300ms ease-out',
        opacity: isExiting ? 0.5 : 1,
      }}
    >
      <Confetti active={showConfetti} />
      {/* Branding Section - staggered entrance */}
      <div
        className="flex flex-col items-center z-10"
        style={{
          paddingTop: 'var(--space-lg)',
          paddingBottom: 'var(--space-xs)',
          transition: isExiting
            ? 'transform 400ms ease-out, opacity 300ms ease-out'
            : undefined,
          transform: isExiting ? 'scale(0.9) translateY(-20px)' : undefined,
          opacity: isExiting ? 0 : undefined,
        }}
      >
        <img
          src="/flo.png"
          alt="Flo & Tell Logo"
          className={`transition-all duration-500 hover:scale-105 ${
            buttonState === 'success'
              ? 'scale-110 animate-pulse'
              : 'animate-logo-entrance'
          }`}
          style={{
            width: 'var(--logo-size)',
            height: 'var(--logo-size)',
            opacity: 1,
          }}
        />
        <h1
          className="font-bold font-comfortaa gradient-text animate-title-entrance"
          style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--text-3xl)' }}
        >
          Flo & Tell
        </h1>
        <p
          className="text-muted-foreground font-quicksand animate-subtitle-entrance"
          style={{
            marginTop: 'var(--space-2xs)',
            fontSize: 'var(--text-base)',
          }}
        >
          {greeting} ✨
        </p>
      </div>

      {/* Form Section - slides up after branding */}
      <div
        className="z-10 w-full smooth-resize animate-form-entrance"
        style={{
          paddingInline: 'var(--container-padding)',
          paddingBlock: 'var(--space-xs)',
          maxWidth: 'min(90%, 40rem)',
          marginInline: 'auto',
          transition: isExiting
            ? 'transform 350ms ease-out, opacity 250ms ease-out'
            : undefined,
          transform: isExiting ? 'translateY(30px)' : undefined,
          opacity: isExiting ? 0 : undefined,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="smooth-resize"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
          noValidate
        >
          {/* Error Display with Animation */}
          <div
            className={`transition-all duration-200 overflow-hidden ${
              showError ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div
              id="login-error"
              role="alert"
              className={`bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-3 ${showError ? 'error-shake' : ''}`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 font-quicksand text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>

          {/* Username Input with Validation Feedback */}
          <div className="relative group">
            <User
              className={`absolute left-[clamp(0.75rem,2vw,1rem)] top-1/2 transform -translate-y-1/2 z-10 transition-colors duration-200 ${
                matchingUser
                  ? 'text-green-500'
                  : isUsernameValid === true
                    ? 'text-green-500'
                    : isUsernameValid === false
                      ? 'text-red-500'
                      : 'text-muted-foreground group-focus-within:text-coral'
              }`}
              style={{
                width: 'clamp(1rem, 2vw, 1.25rem)',
                height: 'clamp(1rem, 2vw, 1.25rem)',
              }}
            />
            <Input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`border-2 transition-all duration-300 touch-manipulation font-quicksand placeholder:text-muted-foreground backdrop-blur-sm bg-background/80 hover:bg-background/90 focus:bg-background shadow-lg hover:shadow-xl focus:shadow-2xl focus:animate-breathing input-focus-ready input-placeholder-fade empty-input-focus ${
                matchingUser
                  ? 'border-green-400 dark:border-green-500 focus:border-green-500 success-glow'
                  : isUsernameValid === true
                    ? 'border-green-400 dark:border-green-500 focus:border-green-500 success-glow'
                    : isUsernameValid === false
                      ? 'border-red-400 dark:border-red-500 focus:border-red-500 attention-wobble'
                      : 'border-rose-pink/30 dark:border-rose-pink/20 focus:border-coral dark:focus:border-coral'
              }`}
              style={{
                paddingLeft: 'clamp(2.75rem, 6vw, 3rem)',
                paddingRight: 'clamp(2.75rem, 6vw, 3rem)',
                minHeight: 'var(--input-height)',
                borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'var(--text-base)',
              }}
              placeholder="Enter your username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              disabled={loading}
              aria-invalid={isUsernameValid === false}
              aria-describedby={`username-count ${error && !isPasswordError ? 'login-error' : ''}`.trim()}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 z-10 flex items-center"
              style={{
                right: 'clamp(0.75rem, 2vw, 1rem)',
                gap: 'var(--space-2xs)',
              }}
            >
              {(isUsernameValid === true || matchingUser) && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                  style={{
                    width: 'clamp(1rem, 2vw, 1.25rem)',
                    height: 'clamp(1rem, 2vw, 1.25rem)',
                  }}
                >
                  <path
                    d="M5 13l4 4L19 7"
                    className="validation-success"
                    style={{ strokeDasharray: 24, strokeDashoffset: 0 }}
                  />
                </svg>
              )}
              <span
                id="username-count"
                className={`font-quicksand tabular-nums transition-all duration-300 ${
                  isUsernameValid === true || matchingUser
                    ? 'opacity-0 w-0'
                    : 'opacity-60'
                } ${username.length > 40 ? 'text-amber-500' : ''} ${username.length >= 50 ? 'text-red-500' : ''}`}
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {username.length > 0 ? `${username.length}/50` : ''}
              </span>
            </div>
          </div>

          {/* Password Input - conditionally shown */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showPasswordField ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="relative group">
              <Lock
                className="absolute top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-coral transition-colors duration-200"
                style={{
                  left: 'clamp(0.75rem, 2vw, 1rem)',
                  width: 'clamp(1rem, 2vw, 1.25rem)',
                  height: 'clamp(1rem, 2vw, 1.25rem)',
                }}
              />
              <Input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 transition-all duration-300 touch-manipulation font-quicksand placeholder:text-muted-foreground backdrop-blur-sm bg-background/80 hover:bg-background/90 focus:bg-background shadow-lg hover:shadow-xl focus:shadow-2xl border-rose-pink/30 dark:border-rose-pink/20 focus:border-coral dark:focus:border-coral"
                style={{
                  paddingLeft: 'clamp(2.75rem, 6vw, 3rem)',
                  paddingRight: 'clamp(3rem, 7vw, 3.5rem)',
                  minHeight: 'var(--input-height)',
                  borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                  fontSize: 'var(--text-base)',
                }}
                placeholder="Enter or create a password"
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={isPasswordError}
                aria-describedby={isPasswordError ? 'login-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral"
                style={{ right: 'clamp(0.75rem, 2vw, 1rem)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="password-input"
              >
                {showPassword ? (
                  <EyeOff
                    style={{
                      width: 'clamp(1rem, 2vw, 1.25rem)',
                      height: 'clamp(1rem, 2vw, 1.25rem)',
                    }}
                  />
                ) : (
                  <Eye
                    style={{
                      width: 'clamp(1rem, 2vw, 1.25rem)',
                      height: 'clamp(1rem, 2vw, 1.25rem)',
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* New user hint */}
          {!matchingUser && username.length >= 2 && !showPasswordField && (
            <p className="text-xs text-muted-foreground text-center animate-fade-in">
              New here? Enter a username to get started, then choose a password.
            </p>
          )}

          {/* Matching user hint */}
          {matchingUser && buttonState === 'idle' && !showPasswordField && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center animate-fade-in">
              Welcome back! Press Continue or tap your bubble below.
            </p>
          )}

          {/* Password required hint */}
          {showPasswordField && (
            <p className="text-xs text-muted-foreground text-center animate-fade-in">
              Use a password to continue. New accounts create it here; existing accounts enter it here.
            </p>
          )}

          {/* Submit Button with Progressive States */}
          <Button
            type="submit"
            className={`w-full font-quicksand font-semibold shadow-xl transition-all duration-500 transform touch-manipulation relative overflow-hidden group ${
              buttonState === 'success'
                ? 'bg-green-500 hover:bg-green-500'
                : matchingUser && buttonState === 'idle'
                  ? 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/50'
                  : 'bg-gradient-to-r from-coral via-rose-pink to-coral hover:from-rose-pink hover:via-coral hover:to-rose-pink hover:shadow-coral/50 hover:scale-[1.02] active:scale-[0.98]'
            } text-white`}
            style={{
              minHeight: 'var(--button-height)',
              borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
              fontSize: 'var(--text-base)',
              padding: 'var(--space-xs) var(--space-sm)',
            }}
            disabled={loading || buttonState === 'success'}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {getButtonContent()}
          </Button>
        </form>

        {/* Empty State Hint */}
        {userProfiles.length === 0 && (
          <p className="text-center text-sm text-muted-foreground font-quicksand mt-4 animate-hint-entrance">
            <span className="gentle-breathe inline-block">
              First time here? Enter a username to get started, then choose a password.
            </span>
          </p>
        )}
      </div>

      {/* Separator - appears after form */}
      {userProfiles.length > 0 && (
        <p className="text-center text-sm text-muted-foreground font-quicksand z-10 animate-separator-entrance">
          — or tap your bubble to sign in —
        </p>
      )}

      {/* Floating Bubbles */}
      <FloatingUserBubbles
        userProfiles={userProfiles}
        onAutofill={handleBubbleSignIn}
      />
    </div>
  );
};

