import React from 'react';
import { createRoot } from 'react-dom/client';

// Ultra-minimal entry point with ZERO custom dependencies
console.log('[EMERGENCY] Starting emergency minimal app...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element #root not found in DOM');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#2563eb' }}>🚑 Emergency Mode - App Works!</h1>
      <p>✅ React is loading successfully</p>
      <p>✅ DOM manipulation working</p>
      <p>✅ Basic JavaScript execution OK</p>
      <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
      <p><strong>Environment:</strong> {typeof import.meta !== 'undefined' ? 'Vite' : 'Unknown'}</p>
      <p><strong>Mode:</strong> {import.meta.env?.MODE || 'Unknown'}</p>
      
      <hr style={{ margin: '20px 0' }} />
      <p style={{ fontSize: '14px', color: '#666' }}>
        If you see this, the core React setup is working. 
        The issue is in custom imports or initialization code.
      </p>
    </div>
  );
  
  console.log('[EMERGENCY] ✅ Emergency app rendered successfully');
} catch (error) {
  console.error('[EMERGENCY] ❌ Critical failure:', error);
  
  // Fallback to pure DOM manipulation
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee2e2; color: #dc2626; font-family: Arial;">
        <h1>🔥 Critical System Failure</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong> ${error.stack || 'No stack trace'}</p>
        <p>Even React failed to initialize. This indicates a fundamental build or environment issue.</p>
      </div>
    `;
  } else {
    document.body.innerHTML = `
      <h1 style="color: red;">CRITICAL: No root element found</h1>
      <p>The HTML template is missing the root div element.</p>
    `;
  }
}