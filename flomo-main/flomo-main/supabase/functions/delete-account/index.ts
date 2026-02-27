import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's JWT to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`Deleting account for user: ${userId}`);

    // Create admin client with service role key for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Delete flo_shares where user is owner or recipient
    const { error: sharesError } = await supabaseAdmin
      .from('flo_shares')
      .delete()
      .or(`owner_id.eq.${userId},shared_with_id.eq.${userId}`);

    if (sharesError) {
      console.error('Error deleting flo_shares:', sharesError);
      // Continue anyway - shares might not exist
    } else {
      console.log('Deleted flo_shares');
    }

    // Step 2: Delete flo_entries
    const { error: entriesError } = await supabaseAdmin
      .from('flo_entries')
      .delete()
      .eq('user_id', userId);

    if (entriesError) {
      console.error('Error deleting flo_entries:', entriesError);
      // Continue anyway - entries might not exist
    } else {
      console.log('Deleted flo_entries');
    }

    // Step 3: Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      // Continue anyway - profile might not exist
    } else {
      console.log('Deleted profile');
    }

    // Step 4: Delete the auth user
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({
          error: 'Failed to delete user account',
          details: deleteUserError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully deleted user account:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account deleted successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
