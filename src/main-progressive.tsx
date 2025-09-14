import React from 'react';
import { createRoot } from 'react-dom/client';

// Progressive testing to find the exact failing import
console.log('[PROGRESSIVE] Starting progressive import test...');

let step = 0;
let error = null;

try {
  step = 1;
  console.log('[PROGRESSIVE] Step 1: Basic React ✅');
  
  step = 2;
  console.log('[PROGRESSIVE] Step 2: Testing CSS import...');
  await import('./index.css');
  console.log('[PROGRESSIVE] Step 2: CSS ✅');
  
  step = 3;
  console.log('[PROGRESSIVE] Step 3: Testing Router import...');
  const { BrowserRouter, HashRouter } = await import('react-router-dom');
  console.log('[PROGRESSIVE] Step 3: Router ✅');
  
  step = 4;
  console.log('[PROGRESSIVE] Step 4: Testing App import...');
  const AppModule = await import('./App.tsx');
  console.log('[PROGRESSIVE] Step 4: App ✅');
  
  step = 5;
  console.log('[PROGRESSIVE] Step 5: Testing AppProviders import...');
  const { AppProviders } = await import('./app/AppProviders');
  console.log('[PROGRESSIVE] Step 5: AppProviders ✅');
  
  step = 6;
  console.log('[PROGRESSIVE] Step 6: Testing Logger import (critical test)...');
  const loggerModule = await import('@/utils/logger');
  console.log('[PROGRESSIVE] Step 6: Logger ✅', loggerModule);
  
  step = 7;
  console.log('[PROGRESSIVE] Step 7: Testing Auth Context import...');
  const authModule = await import('@/modules/auth/context');
  console.log('[PROGRESSIVE] Step 7: Auth Context ✅');
  
  step = 8;
  console.log('[PROGRESSIVE] Step 8: Testing API Status import...');
  const apiModule = await import('@/services/apiStatus');
  console.log('[PROGRESSIVE] Step 8: API Status ✅');
  
  console.log('[PROGRESSIVE] 🎉 ALL IMPORTS SUCCESSFUL!');
  
  // Now try to render
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>✅ Progressive Test Passed!</h1>
      <p>All imports loaded successfully. The issue was likely fixed.</p>
      <ul>
        <li>✅ React & DOM</li>
        <li>✅ CSS Imports</li>
        <li>✅ React Router</li>
        <li>✅ App Component</li>
        <li>✅ App Providers</li>
        <li>✅ Logger (Fixed!)</li>
        <li>✅ Auth Context</li>
        <li>✅ API Status</li>
      </ul>
      <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
    </div>
  );
  
} catch (err) {
  error = err;
  console.error(`[PROGRESSIVE] ❌ Failed at step ${step}:`, err);
  
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; font-family: Arial;">
        <h1>🚨 Progressive Test Failed</h1>
        <p><strong>Failed at Step ${step}</strong></p>
        <p><strong>Error:</strong> ${err.message}</p>
        <p><strong>Stack:</strong> ${err.stack}</p>
        <hr>
        <h3>Step Reference:</h3>
        <ul>
          <li>1: Basic React</li>
          <li>2: CSS import</li>
          <li>3: React Router</li>
          <li>4: App component</li>
          <li>5: App Providers</li>
          <li>6: Logger utility (likely culprit)</li>
          <li>7: Auth Context</li>
          <li>8: API Status</li>
        </ul>
      </div>
    `;
  }
}