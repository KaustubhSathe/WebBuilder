import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT token and get user_id
    const token = authHeader.replace('Bearer ', '')
    let user_id: string
    try {
      // Create Supabase client first to verify the token
      const supabase = createClient(
        Deno.env.get('PROJECT_URL') ?? '',
        Deno.env.get('PROJECT_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          db: {
            schema: 'public'
          }
        }
      )

      // Verify the token using Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) throw new Error('Invalid token')
      user_id = user.id

    } catch (_) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public'
        }
      }
    )

    const { name, description } = await req.json()

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          owner_id: user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ])
      .select('id, name, description, owner_id, created_at, updated_at, thumbnail')
      .single()

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ project }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 