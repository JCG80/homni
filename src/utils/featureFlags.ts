import { getEnv } from './env';
import { log } from './logger';

export type Flags = Record<string, boolean>;

let cached: Flags | null = null;

export async function loadFlags(): Promise<Flags> {
  if (cached) return cached;
  const env = getEnv();
  const fromEnv: Flags = Object.fromEntries(
    Object.entries(env.FLAGS).map(([k,v]) => [k, v === '1'])
  );

  // Remote config (valgfritt): Hvis du har URL i env
  const remoteUrl = (globalThis as any).HOMNI_REMOTE_FLAGS_URL || null;
  if (!remoteUrl) return (cached = fromEnv);

  try {
    const res = await fetch(remoteUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('Remote flags HTTP ' + res.status);
    const json = await res.json();
    cached = { ...fromEnv, ...json };
    return cached;
  } catch (e) {
    log.warn('[FLAGS] Remote fetch feilet, bruker env-flags', e);
    return (cached = fromEnv);
  }
}