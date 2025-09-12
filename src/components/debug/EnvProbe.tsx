import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface EnvInfo {
  href: string;
  path: string;
  search: string;
  origin: string;
  cookiesEnabled: boolean;
  session: boolean;
  userAgent: string;
  timestamp: string;
}

export function EnvProbe() {
  const location = useLocation();
  const [info, setInfo] = useState<Partial<EnvInfo>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setInfo({
          href: window.location.href,
          path: location.pathname,
          search: location.search,
          origin: window.location.origin,
          cookiesEnabled: navigator.cookieEnabled,
          session: !!session,
          userAgent: navigator.userAgent.substring(0, 50) + '...',
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.warn('EnvProbe error:', error);
      }
    };

    updateInfo();
  }, [location]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 z-[9999] bg-black/70 text-white px-2 py-1 rounded text-xs opacity-50 hover:opacity-100"
        title="Show environment probe"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 z-[9999] bg-black/90 text-white p-3 rounded-lg text-xs max-w-sm shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <strong>Environment Probe</strong>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white ml-2"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        {Object.entries(info).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="text-gray-400 w-20 shrink-0">{key}:</span>
            <span className="break-all">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}