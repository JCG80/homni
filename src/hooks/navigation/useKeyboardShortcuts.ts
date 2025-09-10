import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      action: () => setIsCommandPaletteOpen(true),
      description: 'Open command palette',
    },
    {
      key: 'k',
      metaKey: true,
      action: () => setIsCommandPaletteOpen(true),
      description: 'Open command palette (Mac)',
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Go to home',
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to dashboard',
    },
  ];

  // Add role-specific shortcuts
  if (role === 'admin' || role === 'master_admin') {
    shortcuts.push(
      {
        key: 'a',
        ctrlKey: true,
        action: () => navigate('/admin'),
        description: 'Go to admin',
      },
      {
        key: 'u',
        ctrlKey: true,
        action: () => navigate('/admin/users'),
        description: 'Go to users',
      }
    );
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.isContentEditable
    ) {
      return;
    }

    const matchedShortcut = shortcuts.find(shortcut => {
      return (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.metaKey === !!shortcut.metaKey &&
        !!event.shiftKey === !!shortcut.shiftKey
      );
    });

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.action();
    }
  }, [shortcuts, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  };
}