import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/user';

export interface LocalUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthContextType {
  user: LocalUser | null;
  profile: UserProfile | null;
  session: Session | null;
  signIn: (
    username: string,
    password?: string
  ) => Promise<{ error: Error | null; needsPassword?: boolean }>;
  signUp: (
    username: string,
    displayName: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signInOrSignUp: (
    username: string,
    displayName: string,
    password?: string
  ) => Promise<{ error: Error | null; needsPassword?: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  setCustomPassword: (newPassword: string) => Promise<{ error: Error | null }>;
  removeCustomPassword: () => Promise<{ error: Error | null }>;
  loading: boolean;
  refreshProfile: () => void;
  updateFromLocalUser: (localUser: LocalUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const validateUsername = (username: string): string | null => {
  const cleaned = username.trim().toLowerCase();
  if (!cleaned) {
    return 'Username is required';
  }
  if (cleaned.length < 2) {
    return 'Username must be at least 2 characters';
  }
  if (cleaned.length > 50) {
    return 'Username must be less than 50 characters';
  }
  if (!/^[a-z0-9_-]+$/.test(cleaned)) {
    return 'Username can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const buildLocalUser = (profile: UserProfile): LocalUser => ({
    id: profile.id,
    username: profile.username || '',
    displayName: profile.display_name || profile.username || '',
    avatarUrl: profile.avatar_url ?? null,
  });

  const buildLegacyPassword = (username: string): string =>
    `flo_${username}_pass`;

  const ensureProfileRecord = async ({
    authUser,
    username,
    displayName,
    hasCustomPassword,
  }: {
    authUser: User;
    username?: string;
    displayName?: string;
    hasCustomPassword?: boolean;
  }): Promise<Error | null> => {
    const metadata = authUser.user_metadata ?? {};
    const normalizedUsername =
      username ||
      (typeof metadata.username === 'string'
        ? metadata.username.trim().toLowerCase()
        : '');

    if (!normalizedUsername) {
      return new Error('Unable to sync profile without a username');
    }

    const resolvedDisplayName =
      displayName ||
      (typeof metadata.display_name === 'string' && metadata.display_name.trim()) ||
      (typeof metadata.first_name === 'string' && metadata.first_name.trim()) ||
      normalizedUsername;

    const profilePatch: Database['public']['Tables']['profiles']['Insert'] = {
      id: authUser.id,
      email: authUser.email ?? null,
      username: normalizedUsername,
      display_name: resolvedDisplayName,
      first_name: resolvedDisplayName,
    };

    if (typeof hasCustomPassword === 'boolean') {
      profilePatch.has_custom_password = hasCustomPassword;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(profilePatch, { onConflict: 'id' });

    return error ? new Error(error.message) : null;
  };

  const loadProfileForUser = async (
    authUser: User
  ): Promise<UserProfile | null> => {
    let profileData = await fetchProfile(authUser.id);

    if (!profileData) {
      const syncError = await ensureProfileRecord({ authUser });
      if (syncError) {
        console.error('Error creating missing profile:', syncError);
        return null;
      }

      profileData = await fetchProfile(authUser.id);
    }

    return profileData;
  };

  const findPublicProfileByUsername = async (
    username: string
  ): Promise<{ id: string | null } | null> => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error looking up public profile:', err);
      return null;
    }
  };

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Select all profile fields including new privacy/pin fields
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, username, display_name, avatar_url, email, first_name, created_at, has_custom_password, is_private, pin_hash'
        )
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile | null;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  // Initialize auth state with optimized loading
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Faster timeout - 2.5s is enough for most connections
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          setLoading(false);
        }
      }, 2500);

      try {
        // Get initial session - this is the critical path
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error || !mounted) {
          if (mounted) {
            setLoading(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        if (initialSession?.user) {
          setSession(initialSession);
          // Fetch profile in parallel with setting loading false for perceived speed
          const profilePromise = loadProfileForUser(initialSession.user);

          // Set loading false immediately after session is confirmed
          if (mounted) {
            setLoading(false);
          }
          clearTimeout(timeoutId);

          const profileData = await profilePromise;
          if (mounted && profileData) {
            setProfile(profileData);
            setUser(buildLocalUser(profileData));
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
          clearTimeout(timeoutId);
        }
      } catch {
        if (mounted) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // Listen for auth changes
    // IMPORTANT: keep callback synchronous to avoid auth deadlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) {
        return;
      }

      setSession(newSession);

      if (newSession?.user) {
        // Defer Supabase calls outside the callback
        setTimeout(() => {
          if (!mounted) {
            return;
          }
          loadProfileForUser(newSession.user).then((profileData) => {
            if (!mounted) {
              return;
            }
            if (profileData) {
              setProfile(profileData);
              setUser(buildLocalUser(profileData));
            }
          });
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (
    username: string,
    password?: string
  ): Promise<{ error: Error | null; needsPassword?: boolean }> => {
    try {
      const validationError = validateUsername(username);
      if (validationError) {
        return { error: new Error(validationError) };
      }

      const cleaned = username.trim().toLowerCase();

      // Use the real password when provided. Otherwise fall back to the
      // legacy username-derived credential for existing accounts only.
      const email = `${cleaned}@flo.local`;
      const actualPassword = password || buildLegacyPassword(cleaned);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: actualPassword,
      });

      if (error) {
        // Supabase returns this when the account doesn't exist OR password is wrong
        if (/invalid login credentials/i.test(error.message)) {
          // If no password was provided, it might be because user has a custom password
          if (!password) {
            return {
              error: new Error('Username not found or password required'),
              needsPassword: true,
            };
          }
          return { error: new Error('Invalid password') };
        }
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    username: string,
    displayName: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const validationError = validateUsername(username);
      if (validationError) {
        return { error: new Error(validationError) };
      }

      if (password.trim().length < 8) {
        return { error: new Error('Password must be at least 8 characters') };
      }

      const cleaned = username.trim().toLowerCase();

      const email = `${cleaned}@flo.local`;
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleaned,
            display_name: displayName || cleaned,
            first_name: displayName || cleaned,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (!data.user) {
        return { error: new Error('Failed to create account') };
      }

      // If email confirmation is enabled, Supabase may not create a session.
      // We try a sign-in to get a session; if it fails, surface the auth error.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          return { error: new Error(signInError.message) };
        }
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const profileError = await ensureProfileRecord({
        authUser: currentUser || data.user,
        username: cleaned,
        displayName: displayName || cleaned,
        hasCustomPassword: true,
      });

      if (profileError) {
        return { error: profileError };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInOrSignUp = async (
    username: string,
    displayName: string,
    password?: string
  ): Promise<{ error: Error | null; needsPassword?: boolean }> => {
    try {
      const validationError = validateUsername(username);
      if (validationError) {
        return { error: new Error(validationError) };
      }

      const cleaned = username.trim().toLowerCase();
      const existingPublicProfile = await findPublicProfileByUsername(cleaned);

      // Try to sign in
      const loginResult = await signIn(username, password);

      if (!loginResult.error) {
        return { error: null };
      }

      // Existing public accounts should prompt for a password instead of
      // silently creating a duplicate auth user.
      if (existingPublicProfile) {
        if (!password && loginResult.needsPassword) {
          return { error: null, needsPassword: true };
        }

        return loginResult;
      }

      if (!password) {
        return { error: null, needsPassword: true };
      }

      // Create new accounts only after the user supplies a real password.
      const signUpResult = await signUp(username, displayName, password);
      if (
        signUpResult.error &&
        /already registered/i.test(signUpResult.error.message)
      ) {
        // Private existing accounts are hidden from public_profiles, so retry
        // sign-in with the supplied password before surfacing an error.
        return await signIn(username, password);
      }

      return signUpResult;
    } catch (err) {
      console.error('Error in signInOrSignUp:', err);
      return { error: err as Error };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        return { error: new Error('Not authenticated') };
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (response.error) {
        console.error('Delete account error:', response.error);
        return {
          error: new Error(
            response.error.message || 'Failed to delete account'
          ),
        };
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);

      return { error: null };
    } catch (err) {
      console.error('Delete account error:', err);
      return { error: err as Error };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!session?.user) {
      return;
    }

    const profileData = await loadProfileForUser(session.user);
    if (profileData) {
      setProfile(profileData);
      setUser(buildLocalUser(profileData));
    }
  };

  const setCustomPassword = async (
    newPassword: string
  ): Promise<{ error: Error | null }> => {
    try {
      if (!session?.user) {
        return { error: new Error('Not authenticated') };
      }

      if (newPassword.length < 8) {
        return { error: new Error('Password must be at least 8 characters') };
      }

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        return { error: new Error(authError.message) };
      }

      const profileError = await ensureProfileRecord({
        authUser: session.user,
        username: profile?.username || undefined,
        displayName: profile?.display_name || undefined,
        hasCustomPassword: true,
      });

      if (profileError) {
        return { error: profileError };
      }

      // Refresh profile to get updated data
      await refreshProfile();

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const removeCustomPassword = async (): Promise<{ error: Error | null }> => {
    return {
      error: new Error(
        'Removing the account password is no longer supported.'
      ),
    };
  };

  const updateFromLocalUser = (localUser: LocalUser | null): void => {
    if (localUser) {
      setUser(localUser);
    } else {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signInOrSignUp,
    signOut,
    deleteAccount,
    setCustomPassword,
    removeCustomPassword,
    loading,
    refreshProfile,
    updateFromLocalUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
