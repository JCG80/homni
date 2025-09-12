import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  if (!import.meta.env.DEV) return null;

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
      <h3 className="font-bold text-sm mb-2">🌐 Network Status</h3>
      
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