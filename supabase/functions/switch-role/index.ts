import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { new_mode } = await req.json();
    if (!['personal', 'professional'].includes(new_mode)) {
      return new Response(JSON.stringify({ error: 'Ugyldig modus' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Mangler autentisering' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Ugyldig token' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user profile to check allowed modes
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('user_id', user.id)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: 'Finner ikke brukerprofil' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const allowed = (profile.metadata?.allowed_modes as string[]) || ['personal'];
    if (!allowed.includes(new_mode)) {
      return new Response(JSON.stringify({ error: 'Ingen tilgang til denne modusen' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update user profile metadata
    const updatedMetadata = {
      ...profile.metadata,
      active_mode: new_mode,
      last_mode_switch: new Date().toISOString()
    };

    const { error: updateErr } = await supabase
      .from('user_profiles')
      .update({ metadata: updatedMetadata })
      .eq('user_id', user.id);

    if (updateErr) throw updateErr;

    // Attempt audit insert (ignore if table doesn't exist)
    const { error: auditErr } = await supabase.from('role_switch_audit').insert({ user_id: user.id, new_mode });
    if (auditErr) {
      console.warn('role_switch_audit insert skipped:', auditErr.message);
    }

    return new Response(JSON.stringify({ success: true, new_mode }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('switch-role error:', e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || 'Ukjent feil' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});