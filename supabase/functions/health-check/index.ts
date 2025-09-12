import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      connections: number
    }
    errors: {
      recent_count: number
      status: 'ok' | 'warning' | 'critical'
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the database health check function
    const { data, error } = await supabase.rpc('system_health_check')

    if (error) {
      console.error('Health check error:', error)
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          error: 'Failed to perform health check',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const healthData = data as HealthCheck

    // Determine HTTP status based on health
    const httpStatus = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503

    return new Response(
      JSON.stringify(healthData),
      {
        status: httpStatus,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (err) {
    console.error('Health check exception:', err)
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: 'Health check failed with exception',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})