import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

interface RouterDiagnosticInfo {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  userAgent: string;
  origin: string;
  href: string;
  routerMode: string;
  timestamp: string;
}

export function RouterDiagnostics() {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [info, setInfo] = useState<RouterDiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const searchParamsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      searchParamsObj[key] = value;
    });

    setInfo({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      params,
      searchParams: searchParamsObj,
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      origin: window.location.origin,
      href: window.location.href,
      routerMode: import.meta.env.VITE_ROUTER_MODE || 'browser',
      timestamp: new Date().toLocaleTimeString()
    });
  }, [location, params, searchParams]);

  // Only show in development
  if (!import.meta.env.DEV) return null;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-14 right-2 z-[9998] bg-blue-600/80 text-white px-2 py-1 rounded text-xs opacity-60 hover:opacity-100"
        title="Show router diagnostics"
      >
        🛣️
      </button>
    );
  }

  return (
    <div className="fixed bottom-14 right-2 z-[9998] bg-blue-900/95 text-white p-3 rounded-lg text-xs max-w-sm shadow-lg max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <strong>Router Diagnostics</strong>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-blue-200 hover:text-white ml-2"
        >
          ✕
        </button>
      </div>
      
      {info && (
        <div className="space-y-2">
          <div className="border-b border-blue-400 pb-1 mb-2">
            <strong>Location</strong>
          </div>
          <div><span className="text-blue-200">pathname:</span> {info.pathname}</div>
          <div><span className="text-blue-200">search:</span> {info.search || 'none'}</div>
          <div><span className="text-blue-200">hash:</span> {info.hash || 'none'}</div>
          
          <div className="border-b border-blue-400 pb-1 mb-2 mt-3">
            <strong>Parameters</strong>
          </div>
          <div><span className="text-blue-200">params:</span> {JSON.stringify(info.params)}</div>
          <div><span className="text-blue-200">searchParams:</span> {JSON.stringify(info.searchParams)}</div>
          
          <div className="border-b border-blue-400 pb-1 mb-2 mt-3">
            <strong>Environment</strong>
          </div>
          <div><span className="text-blue-200">mode:</span> {info.routerMode}</div>
          <div><span className="text-blue-200">origin:</span> {info.origin}</div>
          <div><span className="text-blue-200">updated:</span> {info.timestamp}</div>
          
          {info.state && (
            <>
              <div className="border-b border-blue-400 pb-1 mb-2 mt-3">
                <strong>State</strong>
              </div>
              <div className="break-all">{JSON.stringify(info.state, null, 2)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}