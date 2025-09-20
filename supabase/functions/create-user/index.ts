import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  ubsId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables');
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, fullName, ubsId }: CreateUserRequest = await req.json();

    console.log('Creating user:', { email, fullName, ubsId });

    // Check if admin is making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error('Invalid authorization token');
    }

    // Check if requesting user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Insufficient permissions - admin role required');
    }

    // Check if UBS already has a user assigned
    const { data: existingAssignment, error: assignmentCheckError } = await supabaseAdmin
      .from('user_ubs')
      .select('id')
      .eq('ubs_id', ubsId)
      .single();

    if (assignmentCheckError && assignmentCheckError.code !== 'PGRST116') {
      throw assignmentCheckError;
    }

    if (existingAssignment) {
      throw new Error('Esta UBS já possui um usuário vinculado');
    }

    // Create the user
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (createError) {
      throw createError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', authData.user.id);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Assign user to UBS
    const { error: assignmentError } = await supabaseAdmin
      .from('user_ubs')
      .insert({
        user_id: authData.user.id,
        ubs_id: ubsId
      });

    if (assignmentError) {
      // If assignment fails, delete the created user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw assignmentError;
    }

    console.log('User assigned to UBS successfully');

    return new Response(
      JSON.stringify({ success: true, userId: authData.user.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);