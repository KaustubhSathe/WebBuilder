import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

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

    const url = new URL(req.url)
    const project_id = url.searchParams.get('project_id')

    let query = supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user_id)

    if (project_id) {
      // Fetch single project
      query = query.eq('id', project_id).single()
    } else {
      // Fetch all projects
      query = query.order('updated_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Always return an array of projects
    const projects = project_id ? (data ? [data] : []) : (data || []);

    return new Response(
      JSON.stringify({ projects }),
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