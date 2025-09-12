import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ImportResult {
  success: number
  errors: Array<{ row: number; error: string; data?: any }>
  total: number
}

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

    const { leads, validate_only = false } = await req.json()
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid leads data. Expected non-empty array.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result: ImportResult = {
      success: 0,
      errors: [],
      total: leads.length
    }

    // Process leads in batches
    const BATCH_SIZE = 50
    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE)
      
      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 1
        const leadData = batch[j]
        
        try {
          // Validate required fields
          if (!leadData.name || !leadData.email) {
            result.errors.push({
              row: rowIndex,
              error: 'Missing required fields: name and email are required',
              data: leadData
            })
            continue
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(leadData.email)) {
            result.errors.push({
              row: rowIndex,
              error: 'Invalid email format',
              data: leadData
            })
            continue
          }

          // Map and sanitize data
          const cleanedLead = {
            name: leadData.name?.trim(),
            email: leadData.email?.toLowerCase().trim(),
            phone: leadData.phone?.trim() || null,
            address: leadData.address?.trim() || null,
            zip_code: leadData.zip_code?.trim() || leadData.zipCode?.trim() || null,
            category: leadData.category?.toLowerCase() || 'other',
            description: leadData.description?.trim() || '',
            estimated_value: parseInt(leadData.estimated_value || leadData.estimatedValue || '0') || 0,
            priority: ['low', 'medium', 'high'].includes(leadData.priority?.toLowerCase()) 
              ? leadData.priority.toLowerCase() 
              : 'medium',
            source: leadData.source?.trim() || 'bulk_import',
            status: 'new',
            metadata: {
              imported_at: new Date().toISOString(),
              imported_by: user.id,
              original_row: rowIndex
            }
          }

          if (!validate_only) {
            // Check for existing lead with same email
            const { data: existingLead } = await supabase
              .from('leads')
              .select('id')
              .eq('email', cleanedLead.email)
              .single()

            if (existingLead) {
              result.errors.push({
                row: rowIndex,
                error: 'Lead with this email already exists',
                data: leadData
              })
              continue
            }

            // Insert the lead
            const { error: insertError } = await supabase
              .from('leads')
              .insert([cleanedLead])

            if (insertError) {
              result.errors.push({
                row: rowIndex,
                error: `Database error: ${insertError.message}`,
                data: leadData
              })
              continue
            }
          }

          result.success++
          
        } catch (error) {
          result.errors.push({
            row: rowIndex,
            error: `Processing error: ${error.message}`,
            data: leadData
          })
        }
      }
    }

    // Log import activity
    if (!validate_only) {
      await supabase
        .from('import_logs')
        .insert([{
          user_id: user.id,
          total_records: result.total,
          successful_records: result.success,
          failed_records: result.errors.length,
          import_type: 'bulk_leads',
          completed_at: new Date().toISOString()
        }])
    }

    return new Response(
      JSON.stringify({
        result,
        message: validate_only 
          ? 'Validation completed' 
          : `Import completed: ${result.success} successful, ${result.errors.length} failed`
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Bulk import error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})