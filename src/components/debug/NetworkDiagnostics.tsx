import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface NetworkStatus {
  supabaseConnection: 'checking' | 'connected' | 'failed';
  corsStatus: 'checking' | 'ok' | 'blocked';
  apiEndpoints: Record<string, 'checking' | 'ok' | 'failed'>;
  authStatus: 'checking' | 'authenticated' | 'anonymous' | 'error';
}

export function NetworkDiagnostics() {
  const [status, setStatus] = useState<NetworkStatus>({
    supabaseConnection: 'checking',
    corsStatus: 'checking',
    apiEndpoints: {},
    authStatus: 'checking'
  });
  
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('debug-network-visible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('debug-network-visible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'debug-network-visible') {
        setIsVisible(e.newValue !== 'false');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const runDiagnostics = async () => {
      // Test Supabase connection
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        setStatus(prev => ({
          ...prev,
          supabaseConnection: error ? 'failed' : 'connected'
        }));
      } catch (err) {
        setStatus(prev => ({ ...prev, supabaseConnection: 'failed' }));
      }

      // Test auth status
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setStatus(prev => ({
          ...prev,
          authStatus: session ? 'authenticated' : 'anonymous'
        }));
      } catch (err) {
        setStatus(prev => ({ ...prev, authStatus: 'error' }));
      }

      // Test CORS (simple fetch)
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
          method: 'HEAD',
          headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY }
        });
        setStatus(prev => ({
          ...prev,
          corsStatus: response.ok ? 'ok' : 'blocked'
        }));
      } catch (err) {
        setStatus(prev => ({ ...prev, corsStatus: 'blocked' }));
      }
    };

    runDiagnostics();
  }, []);

  if (!import.meta.env.DEV || !isVisible) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking': return '⏳';
      case 'connected':
      case 'ok':
      case 'authenticated': return '✅';
      case 'failed':
      case 'blocked':
      case 'error': return '❌';
      case 'anonymous': return '👤';
      default: return '❓';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm p-4 bg-background border rounded-lg shadow-lg text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🌐 Network Status</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Close network diagnostics"
        >
          <X size={12} />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Supabase:</span>
          <span>{getStatusIcon(status.supabaseConnection)} {status.supabaseConnection}</span>
        </div>
        
        <div className="flex justify-between">
          <span>CORS:</span>
          <span>{getStatusIcon(status.corsStatus)} {status.corsStatus}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Auth:</span>
          <span>{getStatusIcon(status.authStatus)} {status.authStatus}</span>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Env: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'} URL | {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'} Key
        </div>
      </div>
    </div>
  );
}