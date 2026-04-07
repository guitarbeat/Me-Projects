import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseAdminRoleResult {
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Securely checks admin status via server-side `is_admin()` RPC.
 * Never stores role client-side — always re-validates from the database.
 */
export const useAdminRole = (): UseAdminRoleResult => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const checkAdmin = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (!cancelled) {
          setIsAdmin(error ? false : !!data);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    // Re-check on auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [user]);

  return { isAdmin, loading };
};
