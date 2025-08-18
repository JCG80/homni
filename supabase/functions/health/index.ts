import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  version: string
  services?: {
    database?: 'ok' | 'error'
    auth?: 'ok' | 'error'
  }
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Basic health check
    const healthResponse: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {}
    }

    // Test database connectivity
    try {
      const { error: dbError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      healthResponse.services!.database = dbError ? 'error' : 'ok'
    } catch (error) {
      console.error('Database health check failed:', error)
      healthResponse.services!.database = 'error'
    }

    // Test auth service
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      healthResponse.services!.auth = 'ok' // Auth service is available if we can call it
    } catch (error) {
      console.error('Auth health check failed:', error)
      healthResponse.services!.auth = 'error'
    }

    // Determine overall status
    const hasErrors = Object.values(healthResponse.services!).includes('error')
    const status = hasErrors ? 503 : 200
    
    if (hasErrors) {
      healthResponse.status = 'error'
      healthResponse.error = 'One or more services are unavailable'
    }

    return new Response(
      JSON.stringify(healthResponse),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorResponse: HealthResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: error.message || 'Internal server error'
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})