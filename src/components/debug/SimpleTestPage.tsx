/**
 * Simple test page to verify routing is working
 */
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCurrentRole } from '@/hooks/useCurrentRole';

export const SimpleTestPage = () => {
  const { user, isAuthenticated, role: authRole } = useAuth();
  const currentRole = useCurrentRole();

  React.useEffect(() => {
    console.error('[SIMPLE TEST PAGE] Mounted!', {
      user: user?.email,
      isAuthenticated,
      authRole,
      currentRole,
      location: window.location.href
    });
  }, [user, isAuthenticated, authRole, currentRole]);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '30px' }}>
          🎉 Simple Test Page Working!
        </h1>
        
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '20px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Debug Info:</h2>
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Hash:</strong> {window.location.hash || '(none)'}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Auth Role:</strong> {authRole || 'N/A'}</p>
          <p><strong>Current Role:</strong> {currentRole || 'N/A'}</p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Test Navigation:</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.location.hash = '#/'}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};