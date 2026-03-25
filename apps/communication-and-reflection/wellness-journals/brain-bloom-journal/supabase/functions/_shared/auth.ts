import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://ocghxwwwuubgmwsxgyoy.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ2h4d3d3dXViZ213c3hneW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgzMjksImV4cCI6MjA2NTY3NDMyOX0.93cpwT3YCC5GTwhlw4YAzSBgtxbp6fGkjcfqzdKX4E0';

export interface AuthResult {
  user: User | null;
  error: string | null;
  supabase: SupabaseClient;
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} }
  });

  if (!authHeader) {
    return { user: null, error: 'Missing Authorization header', supabase };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, error: authError?.message || 'Invalid token', supabase };
  }

  console.log('Authenticated user:', user.id);
  return { user, error: null, supabase };
}
