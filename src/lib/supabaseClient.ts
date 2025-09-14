import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getEnv } from '@/utils/env';
import { log } from '@/utils/logger';

let _client: SupabaseClient | null = null;

/**
 * Lazy factory. Throws with a clear message if env is missing.
 * Callers can catch and show a guest/degraded banner instead.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const env = getEnv();
  
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    log.warn('[Supabase] Missing env; running in guest/degraded mode');
    throw new Error('Supabase env missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  
  _client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
  });
  
  return _client;
}

// Legacy export for backward compatibility
export const supabase = getSupabase();