#!/usr/bin/env ts-node

/**
 * Seed Auth Users (creates auth.users with passwords) and ensure user_profiles
 * Ensures admin@test.local / Test1234! works + other standard test users
 */

import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kkazhcihooovsuwravhs.supabase.co';
const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const PASSWORD = 'Test1234!';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

type CanonicalRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

const USERS: Array<{
  email: string;
  role: CanonicalRole;
  display_name: string;
  company_name?: string;
}> = [
  { email: 'guest@homni.test', role: 'guest', display_name: 'Guest User' },
  { email: 'user@test.local', role: 'user', display_name: 'Test User' },
  { email: 'company@test.local', role: 'company', display_name: 'Test Company', company_name: 'Test Company AS' },
  { email: 'content@test.local', role: 'content_editor', display_name: 'Content Editor' },
  { email: 'admin@test.local', role: 'admin', display_name: 'Admin User' },
  { email: 'master-admin@test.local', role: 'master_admin', display_name: 'Master Admin' },
];

async function findUserByEmail(email: string) {
  // There is no direct getUserByEmail in v2, so list + filter (sufficient for small dev seeds)
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function upsertAuthUser(email: string, role: CanonicalRole) {
  // Try create first
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role, test_user: true },
  });

  if (!createErr && created.user) {
    return created.user.id;
  }

  // If already exists, update password and metadata
  if (createErr && (createErr as any).status === 422) {
    const existing = await findUserByEmail(email);
    if (!existing) throw new Error(`User exists but could not be retrieved: ${email}`);

    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      user_metadata: { ...(existing.user_metadata || {}), role, test_user: true },
    });
    if (updateErr) throw updateErr;
    return existing.id;
  }

  throw createErr;
}

async function ensureUserProfile(userId: string, role: CanonicalRole, companyId?: string | null) {
  // Prefer using the RPC to normalize roles and maintain timestamps
  const { data, error } = await supabase.rpc('ensure_user_profile', {
    p_user_id: userId,
    p_role: role,
    p_company_id: companyId || null,
  });
  if (error) throw error;
  return data;
}

async function ensureCompanyProfile(userId: string, name: string) {
  // Check if a company profile already exists for this user
  const { data: existing } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
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

async function seedAuthUsers() {
  console.log('🌱 Seeding auth users (with passwords) ...\n');

  for (const u of USERS) {
    try {
      console.log(`→ Ensuring auth user: ${u.email} (${u.role})`);
      const userId = await upsertAuthUser(u.email, u.role);

      let companyId: string | undefined;
      if (u.role === 'company' && u.company_name) {
        companyId = await ensureCompanyProfile(userId, u.company_name);
      }

      await ensureUserProfile(userId, u.role, companyId);
      console.log(`✅ Ready: ${u.email} (${u.role}) — id: ${userId}`);
    } catch (e) {
      console.error(`❌ Failed for ${u.email}:`, e);
    }
  }

  console.log('\n🎉 Auth user seeding completed');
}

if (require.main === module) {
  seedAuthUsers().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seedAuthUsers;
