import React, { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';

export function DebugToggle() {
  const [isOpen, setIsOpen] = useState(false);

  if (!import.meta.env.DEV) return null;

  const togglePanel = (panel: string) => {
    const currentState = localStorage.getItem(`debug-${panel}-visible`) !== 'false';
    localStorage.setItem(`debug-${panel}-visible`, String(!currentState));
    // Force re-render by dispatching a storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: `debug-${panel}-visible`,
      newValue: String(!currentState)
    }));
  };

  const showAllPanels = () => {
    ['app', 'network', 'router'].forEach(panel => {
      localStorage.setItem(`debug-${panel}-visible`, 'true');
      window.dispatchEvent(new StorageEvent('storage', {
        key: `debug-${panel}-visible`,
        newValue: 'true'
      }));
    });
  };

  const hideAllPanels = () => {
    ['app', 'network', 'router'].forEach(panel => {
      localStorage.setItem(`debug-${panel}-visible`, 'false');
      window.dispatchEvent(new StorageEvent('storage', {
        key: `debug-${panel}-visible`,
        newValue: 'false'
      }));
    });
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2 bg-background border rounded-lg shadow-lg hover:bg-muted transition-colors"
        aria-label="Toggle debug panels"
      >
        <Bug size={16} />
      </button>

      {/* Control panel */}
      {isOpen && (
        <div className="fixed top-16 left-4 z-[60] p-3 bg-background border rounded-lg shadow-lg text-xs font-mono space-y-2">
          <div className="font-bold text-sm mb-2">Debug Controls</div>
          
          <div className="space-y-1">
            <button
              onClick={() => togglePanel('router')}
              className="block w-full text-left px-2 py-1 bg-muted hover:bg-accent rounded transition-colors"
            >
              Toggle Router Debug
            </button>
            <button
              onClick={() => togglePanel('app')}
              className="block w-full text-left px-2 py-1 bg-muted hover:bg-accent rounded transition-colors"
            >
              Toggle App Diagnostics
            </button>
            <button
              onClick={() => togglePanel('network')}
              className="block w-full text-left px-2 py-1 bg-muted hover:bg-accent rounded transition-colors"
            >
              Toggle Network Status
            </button>
          </div>
          
          <div className="border-t pt-2 space-y-1">
            <button
              onClick={showAllPanels}
              className="block w-full text-left px-2 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded transition-colors"
            >
              Show All
            </button>
            <button
              onClick={hideAllPanels}
              className="block w-full text-left px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded transition-colors"
            >
              Hide All
            </button>
          </div>
        </div>
      )}
    </>
  );
}