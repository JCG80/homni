import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify webhook source and extract lead data
    const webhookSource = req.headers.get('x-webhook-source') || 'unknown'
    const apiKey = req.headers.get('x-api-key')
    
    // Basic API key validation (you should implement proper validation)
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    
    // Map external webhook data to our lead format
    const leadData = {
      name: requestBody.name || requestBody.customerName || 'Unknown',
      email: requestBody.email || requestBody.customerEmail,
      phone: requestBody.phone || requestBody.phoneNumber,
      address: requestBody.address || requestBody.location,
      zip_code: requestBody.zipCode || requestBody.postalCode,
      category: requestBody.category || requestBody.serviceType || 'other',
      description: requestBody.description || requestBody.message || '',
      estimated_value: requestBody.estimatedValue || requestBody.budget || 0,
      priority: requestBody.priority || 'medium',
      source: webhookSource,
      status: 'new',
      metadata: {
        webhook_source: webhookSource,
        original_data: requestBody,
        received_at: new Date().toISOString()
      }
    }

    // Insert the lead into database
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: leadError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log webhook activity
    await supabase
      .from('webhook_logs')
      .insert([{
        source: webhookSource,
        lead_id: lead.id,
        payload: requestBody,
        processed_at: new Date().toISOString(),
        status: 'success'
      }])

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead created successfully'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})