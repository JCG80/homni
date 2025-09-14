import { getEnv } from './env';

type Level = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
const order: Level[] = ['silent','error','warn','info','debug','trace'];

type Sink = (lvl: Exclude<Level,'silent'>, args: any[]) => void;
let externalSink: Sink | null = null; // e.g. Sentry senere

export function setLogSink(sink: Sink | null) { externalSink = sink; }

function useConsoleDev(lvl: Exclude<Level,'silent'>, args: any[]) {
  if (console.groupCollapsed && (lvl === 'debug' || lvl === 'trace' || lvl === 'info')) {
    console.groupCollapsed(`[${lvl.toUpperCase()}]`);
    // @ts-ignore
    console[lvl](...args);
    console.groupEnd();
  } else {
    // @ts-ignore
    console[lvl](`[${lvl.toUpperCase()}]`, ...args);
  }
}

let inst: any = null;
export const log: any = new Proxy({}, {
  get(_t, prop: string) {
    if (!inst) {
      const { LOG_LEVEL, DEV } = getEnv();
      const threshold = order.indexOf(LOG_LEVEL as Level);
      inst = {
        error: (...a: any[]) => { useConsoleDev('error', a); externalSink?.('error', a); },
        warn:  (...a: any[]) => { if (threshold >= 1) { DEV ? useConsoleDev('warn', a) : console.warn('[WARN]', ...a); externalSink?.('warn', a); } },
        info:  (...a: any[]) => { if (threshold >= 3) { DEV ? useConsoleDev('info', a) : console.info('[INFO]', ...a); externalSink?.('info', a); } },
        debug: (...a: any[]) => { if (threshold >= 4) { DEV ? useConsoleDev('debug', a) : console.debug('[DEBUG]', ...a); externalSink?.('debug', a); } },
        trace: (...a: any[]) => { if (threshold >= 5) { DEV ? useConsoleDev('trace', a) : console.debug('[TRACE]', ...a); externalSink?.('trace', a); } },
        level: LOG_LEVEL,
      };
    }
    return inst[prop];
  }
});

// Backward compatibility - export logger object that matches old interface
export const logger = {
  debug: (...args: any[]) => log.debug(...args),
  info: (...args: any[]) => log.info(...args), 
  warn: (...args: any[]) => log.warn(...args),
  error: (...args: any[]) => log.error(...args),
  time: (label: string) => console.time(label),
  timeEnd: (label: string) => console.timeEnd(label),
  trackUserAction: (action: string, context?: any) => log.info(`User action: ${action}`, context),
  trackApiCall: (endpoint: string, method: string, duration: number, status: number) => 
    log.info(`API call: ${method} ${endpoint}`, { method, endpoint, duration, status })
};