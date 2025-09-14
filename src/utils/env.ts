import { z } from 'zod';

const EnvSchema = z.object({
  MODE: z.string().default('production'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(true),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(['silent','error','warn','info','debug','trace']).default('info'),
  FLAGS: z.record(z.string(), z.union([z.literal('0'), z.literal('1')])).default({}), // e.g. VITE_FLAG_LEADGEN="1"
});

type Env = z.infer<typeof EnvSchema>;
const SS_KEY = 'homni_env_v1';

function safeMeta() {
  return (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
}

function detectRaw() {
  const meta = safeMeta();
  const mode = (meta.MODE || process?.env?.MODE || 'production') as string;
  const dev  = Boolean(meta.DEV ?? (mode === 'development'));
  const prod = Boolean(meta.PROD ?? !dev);
  const rawLevel = String(meta.VITE_LOG_LEVEL || process?.env?.VITE_LOG_LEVEL || (prod ? 'warn' : 'info'));
  const host = (typeof window !== 'undefined' && window.location.hostname) || '';
  const sandbox = /lovable|sandbox/.test(host);

  // samla feature flags: alle VITE_FLAG_* settes inn i FLAGS
  const flags: Record<string, '0' | '1'> = {};
  for (const k of Object.keys(meta)) {
    if (k.startsWith('VITE_FLAG_')) {
      const v = String(meta[k]).trim();
      flags[k] = (v === '1' ? '1' : '0');
    }
  }

  return {
    MODE: mode,
    DEV: dev,
    PROD: prod,
    SUPABASE_URL: meta.VITE_SUPABASE_URL || process?.env?.VITE_SUPABASE_URL || (sandbox ? 'sandbox-placeholder' : undefined),
    SUPABASE_ANON_KEY: meta.VITE_SUPABASE_ANON_KEY || process?.env?.VITE_SUPABASE_ANON_KEY || (sandbox ? 'sandbox-placeholder' : undefined),
    LOG_LEVEL: rawLevel,
    FLAGS: flags,
  };
}

function fromSession(): Env | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    return EnvSchema.parse(JSON.parse(raw));
  } catch { return null; }
}

function toSession(env: Env) {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SS_KEY, JSON.stringify(env));
  } catch { /* ignore */ }
}

let cached: Env | null = null;
export const getEnv = (): Env => {
  if (cached) return cached;
  const cachedSS = fromSession();
  if (cachedSS) return (cached = cachedSS);

  const parsed = EnvSchema.parse(detectRaw());
  toSession(parsed);
  return (cached = parsed);
};