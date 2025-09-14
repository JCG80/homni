import React from 'react';
import { createRoot } from 'react-dom/client';

// Minimal test to isolate the issue
console.log('[MINIMAL] Starting minimal app test...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🟢 Minimal App Works!</h1>
      <p>If you see this, the basic React setup is working.</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
  
  console.log('[MINIMAL] ✅ Minimal app rendered successfully');
} catch (error) {
  console.error('[MINIMAL] ❌ Even minimal app failed:', error);
  
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00;">
        <h1>Critical Error</h1>
        <p>Even the minimal app failed to load: ${error.message}</p>
      </div>
    `;
  }
}