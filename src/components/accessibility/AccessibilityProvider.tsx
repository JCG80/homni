import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  focusVisible: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  focusVisible: true,
  screenReaderOptimized: false,
};

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [liveRegion, setLiveRegion] = useState<HTMLDivElement | null>(null);

  // Initialize accessibility settings from system preferences and localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('homni-accessibility-settings');
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };

    const initialSettings = {
      ...DEFAULT_SETTINGS,
      ...systemPreferences,
      ...(savedSettings ? JSON.parse(savedSettings) : {}),
    };

    setSettings(initialSettings);
    applyAccessibilitySettings(initialSettings);
  }, []);

  // Create live region for screen reader announcements
  useEffect(() => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = 'accessibility-live-region';
    document.body.appendChild(region);
    setLiveRegion(region);

    return () => {
      if (document.body.contains(region)) {
        document.body.removeChild(region);
      }
    };
  }, []);

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0s');
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
      root.style.removeProperty('--animation-duration');
    }

    // Apply high contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
    root.classList.add(`font-size-${newSettings.fontSize}`);

    // Apply focus visible
    if (newSettings.focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }

    // Apply screen reader optimization
    if (newSettings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  };

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    applyAccessibilitySettings(newSettings);
    localStorage.setItem('homni-accessibility-settings', JSON.stringify(newSettings));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
        liveRegion.setAttribute('aria-live', 'polite');
      }, 1000);
    }
  };

  // Listen for system preference changes
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      updateSettings({ reducedMotion: e.matches });
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      updateSettings({ highContrast: e.matches });
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};