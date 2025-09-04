// Supabase Edge Function: seed-test-users
// Creates/repairs standard dev users including admin@test.local with password Test1234!
// Endpoint: https://kkazhcihooovsuwravhs.functions.supabase.co/seed-test-users

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SeedUser {
  email: string;
  role: 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';
  display_name: string;
  company_name?: string;
}

const USERS: SeedUser[] = [
  { email: 'guest@homni.test', role: 'guest', display_name: 'Guest User' },
  { email: 'user@test.local', role: 'user', display_name: 'Test User' },
  { email: 'company@test.local', role: 'company', display_name: 'Test Company', company_name: 'Test Company AS' },
  { email: 'content@test.local', role: 'content_editor', display_name: 'Content Editor' },
  { email: 'admin@test.local', role: 'admin', display_name: 'Admin User' },
  { email: 'master-admin@test.local', role: 'master_admin', display_name: 'Master Admin' },
];

const PASSWORD = 'Test1234!';

function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  } as Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('origin') || undefined) });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'https://kkazhcihooovsuwravhs.supabase.co';
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing service role key' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(req.headers.get('origin') || undefined) } });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const results: any[] = [];

    // Helper to find user by email
    async function findUserByEmail(email: string) {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    }

    // Ensure company profile
    async function ensureCompanyProfile(userId: string, name: string) {
      const { data: existing } = await admin
        .from('company_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (existing?.id) return existing.id as string;

      const { data, error } = await admin
        .from('company_profiles')
        .insert({
          user_id: userId,
          name,
          status: 'active',
          subscription_plan: 'free',
          modules_access: ['leads'],
          metadata: { test_user: true },
          notification_preferences: {},
          ui_preferences: {},
          feature_overrides: {},
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    }

    for (const u of USERS) {
      let userId: string | undefined;
      // Try create first
      const createRes = await admin.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: u.role, test_user: true },
      });

      if (!createRes.error && createRes.data.user) {
        userId = createRes.data.user.id;
      } else if (createRes.error && (createRes.error as any).status === 422) {
        // Already exists: update password + metadata
        const existing = await findUserByEmail(u.email);
        if (!existing) throw new Error(`User exists but not retrievable: ${u.email}`);
        const updateRes = await admin.auth.admin.updateUserById(existing.id, {
          password: PASSWORD,
          user_metadata: { ...(existing.user_metadata || {}), role: u.role, test_user: true },
        });
        if (updateRes.error) throw updateRes.error;
        userId = existing.id;
      } else if (createRes.error) {
        throw createRes.error;
      }

      if (!userId) throw new Error(`No user id for ${u.email}`);

      // Company profile where needed
      let companyId: string | undefined;
      if (u.role === 'company' && u.company_name) {
        companyId = await ensureCompanyProfile(userId, u.company_name);
      }

      // Ensure user profile via RPC to normalize role
      const { error: rpcErr } = await admin.rpc('ensure_user_profile', {
        p_user_id: userId,
        p_role: u.role,
        p_company_id: companyId || null,
      });
      if (rpcErr) throw rpcErr;

      results.push({ email: u.email, role: u.role, id: userId, companyId });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders(req.headers.get('origin') || undefined) },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(req.headers.get('origin') || undefined) },
    });
  }
});