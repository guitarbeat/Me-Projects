import { memo, useEffect, useState } from 'react';
import { Database, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseHealthCheck = memo(() => {
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      // Use a lightweight query against the public view so the check works
      // before authentication and does not depend on private table access.
      const { error } = await supabase
        .from('public_profiles')
        .select('count', { count: 'exact' });

      if (error) {
        console.error('Supabase Health Check Failed:', error);
        // Check for specific error codes or status indicating missing table
        // 42P01: undefined_table (Postgres)
        // 404: Not Found (PostgREST often returns this for missing tables)
        // PGRST301: PostgREST specific (often not found)
        if (
          error.code === '42P01' ||
          error.code === 'PGRST301' ||
          error.code === '404' ||
          error.message?.includes('404')
        ) {
          setError(
            'Database tables are missing. Please run "npm run db:push" to set up your database.'
          );
        } else {
          // Generic fallback
          setError(`Database connection issue: ${error.message}`);
        }
      }
    };

    checkConnection();
  }, []);

  if (!error || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-3 px-4 text-sm font-medium shadow-lg animate-fade-in flex items-center justify-center gap-2"
      role="alert"
    >
      <Database className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

SupabaseHealthCheck.displayName = 'SupabaseHealthCheck';
