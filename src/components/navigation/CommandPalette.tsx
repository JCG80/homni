/**
 * Command Palette for Quick Navigation
 * Enhanced keyboard-driven navigation experience
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Clock, 
  Star, 
  Hash,
  Zap,
  User,
  Building,
  Settings,
  FileText
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/navigation/useKeyboardShortcuts';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useQuickActions } from '@/hooks/navigation/useQuickActions';
import { useAuth } from '@/modules/auth/hooks';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  href?: string;
  action?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  category: 'navigation' | 'actions' | 'recent' | 'suggestions';
  shortcut?: string;
  badge?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { quickActions } = useQuickActions();
  const { 
    quickSuggestions, 
    contextualSuggestions, 
    navigationHistory,
    navigateWithPreload 
  } = useSmartNavigation();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build command items from different sources
  const allCommands = useMemo((): CommandItem[] => {
    const commands: CommandItem[] = [];

    // Navigation suggestions
    [...quickSuggestions, ...contextualSuggestions].forEach(suggestion => {
      commands.push({
        id: `nav-${suggestion.href}`,
        title: suggestion.title,
        description: suggestion.description,
        href: suggestion.href,
        icon: suggestion.icon,
        category: 'navigation',
        badge: 'Naviger'
      });
    });

    // Quick actions
    quickActions.forEach(action => {
      commands.push({
        id: `action-${action.id}`,
        title: action.title,
        description: action.description,
        href: action.href,
        icon: action.icon,
        category: 'actions',
        shortcut: action.shortcut,
        badge: action.badge?.count ? `${action.badge.count}` : undefined
      });
    });

    // Recent navigation history
    navigationHistory.slice(0, 5).forEach((path, index) => {
      const title = getPageTitle(path);
      commands.push({
        id: `recent-${path}`,
        title,
        description: `Nylig besøkt • ${path}`,
        href: path,
        icon: Clock,
        category: 'recent'
      });
    });

    // Common system actions
    if (role === 'admin' || role === 'master_admin') {
      commands.push(
        {
          id: 'admin-users',
          title: 'Administrer brukere',
          description: 'Håndter brukerkontoer og rettigheter',
          href: '/admin/users',
          icon: User,
          category: 'navigation'
        },
        {
          id: 'admin-settings',
          title: 'Systeminnstillinger',
          description: 'Konfigurer systemparametere',
          href: '/admin/settings',
          icon: Settings,
          category: 'navigation'
        }
      );
    }

    return commands;
  }, [quickSuggestions, contextualSuggestions, quickActions, navigationHistory, role]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;

    const lowercaseQuery = query.toLowerCase();
    return allCommands.filter(command => 
      command.title.toLowerCase().includes(lowercaseQuery) ||
      command.description?.toLowerCase().includes(lowercaseQuery) ||
      command.href?.toLowerCase().includes(lowercaseQuery)
    );
  }, [allCommands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });

    return groups;
  }, [filteredCommands]);

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex]);

  const executeCommand = useCallback(async (command: CommandItem) => {
    onOpenChange(false);
    setQuery('');

    if (command.action) {
      command.action();
    } else if (command.href) {
      await navigateWithPreload(command.href);
    }
  }, [onOpenChange, navigateWithPreload]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return Hash;
      case 'actions': return Zap;
      case 'recent': return Clock;
      case 'suggestions': return Star;
      default: return ArrowRight;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigasjon';
      case 'actions': return 'Handlinger';
      case 'recent': return 'Nylig besøkt';
      case 'suggestions': return 'Forslag';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Kommando palette</DialogTitle>
          <DialogDescription>
            Naviger raskt gjennom applikasjonen
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk etter sider, handlinger..."
            className="border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground"
            autoFocus
          />
          <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-3">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
            <span>å avbryte</span>
          </div>
        </div>

        {/* Commands List */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ingen resultater funnet</p>
                <p className="text-sm">Prøv et annet søkeord</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedCommands).map(([category, commands], categoryIndex) => {
                  const CategoryIcon = getCategoryIcon(category);
                  
                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                        <CategoryIcon className="h-3 w-3" />
                        <span>{getCategoryTitle(category)}</span>
                      </div>

                      {/* Commands in Category */}
                      <div className="space-y-1">
                        {commands.map((command, index) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <motion.div
                              key={command.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start h-auto p-3 text-left",
                                  "hover:bg-accent focus:bg-accent",
                                  isSelected && "bg-accent"
                                )}
                                onClick={() => executeCommand(command)}
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  {/* Icon */}
                                  {command.icon && (
                                    <command.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  )}
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm truncate">
                                        {command.title}
                                      </span>
                                      
                                      <div className="flex items-center space-x-2">
                                        {command.badge && (
                                          <Badge variant="secondary" className="text-xs">
                                            {command.badge}
                                          </Badge>
                                        )}
                                        
                                        {command.shortcut && (
                                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                            {command.shortcut}
                                          </kbd>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {command.description && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {command.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Arrow */}
                                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-50" />
                                </div>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {categoryIndex < Object.keys(groupedCommands).length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Naviger med piltaster</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd>
                <span>naviger</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd>
                <span>velg</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get page title from path
const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    '/': 'Hjem',
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/properties': 'Eiendommer',
    '/sales': 'Salg',
    '/admin': 'Admin',
    '/admin/users': 'Brukere',
    '/admin/settings': 'Innstillinger',
    '/profile': 'Profil',
    '/settings': 'Innstillinger',
    '/help': 'Hjelp'
  };

  return titles[path] || 
    path.split('/').pop()?.replace(/-/g, ' ')?.replace(/^\w/, c => c.toUpperCase()) || 
    path;
};