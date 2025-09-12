import type { EventMap } from './types';
import { logger } from '@/utils/logger';

// Lightweight, typed event bus for browser/React environments
// No external dependencies to keep bundle small

type Listener<Payload> = (payload: Payload) => void;

type ListenerMap<E extends Record<string, any>> = {
  [K in keyof E]?: Set<Listener<E[K]>>;
};

class EventBus<E extends Record<string, any>> {
  private listeners: ListenerMap<E> = {};

  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(listener);
    return () => this.off(event, listener);
  }

  once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    const onceWrapper: Listener<E[K]> = (payload) => {
      this.off(event, onceWrapper);
      listener(payload);
    };
    return this.on(event, onceWrapper);
  }

  off<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    this.listeners[event]?.delete(listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.listeners[event]?.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        // Ensure one bad subscriber doesn't break others
        logger.error(`[EventBus] Error in listener for ${String(event)}:`, {
          module: 'EventBus',
          event: String(event)
        }, err as Error);
      }
    });
  }

  clearAll(): void {
    this.listeners = {};
  }
}

export const eventBus = new EventBus<EventMap>();
export type { EventBus };
