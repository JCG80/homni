import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'csv'
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')

    // Build query with filters
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leads', details: leadsError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'ID', 'Name', 'Email', 'Phone', 'Address', 'Zip Code', 
        'Category', 'Status', 'Priority', 'Estimated Value', 
        'Source', 'Created At', 'Updated At'
      ]
      
      const csvRows = leads.map(lead => [
        lead.id,
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.address || '',
        lead.zip_code || '',
        lead.category || '',
        lead.status || '',
        lead.priority || '',
        lead.estimated_value || 0,
        lead.source || '',
        lead.created_at,
        lead.updated_at
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
      
      return new Response(csvContent, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } else {
      // Return JSON format
      const filename = `leads-export-${new Date().toISOString().split('T')[0]}.json`
      
      return new Response(JSON.stringify(leads, null, 2), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})