/**
 * Emergency loader to test if React is working at all
 */
import React from 'react';
import { logger } from '@/utils/logger';

export const EmergencyLoader = () => {
  React.useEffect(() => {
    logger.error('[EMERGENCY] EmergencyLoader mounted!');
    logger.error('[EMERGENCY] Location:', { location: window.location.href });
    logger.error('[EMERGENCY] Router mode should be hash');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      zIndex: 9999,
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>🚨 Emergency Loader Active</h1>
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Debug Info:</h2>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>Hostname:</strong> {window.location.hostname}</p>
        <p><strong>Hash:</strong> {window.location.hash || '(none)'}</p>
        <p><strong>Pathname:</strong> {window.location.pathname}</p>
      </div>
      <p style={{ marginBottom: '20px' }}>
        If you see this, React is working but routing is broken. 
        Check the console for router configuration errors.
      </p>
      <button 
        onClick={() => window.location.hash = '#/'}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Force Hash Home
      </button>
      <button 
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};