import { getEnv } from './env';
import { log } from './logger';

export type EnvReport = { ok: boolean; missing: string[]; mode: string; logLevel: string };

export function validateEnvironment(): EnvReport {
  const e = getEnv();
  const missing: string[] = [];
  if (!e.SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!e.SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');

  const report: EnvReport = { ok: missing.length === 0, missing, mode: e.MODE, logLevel: e.LOG_LEVEL };
  if (report.ok) log.info('[ENV] OK', report);
  else log.warn('[ENV] Missing config', report);
  return report;
}