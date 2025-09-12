import React, { useState, useEffect, useMemo } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search, Hash, ArrowRight, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation-consolidated';
import { useNavigationContext } from '@/hooks/useNavigationContext';
import { UserRole } from '@/modules/auth/normalizeRole';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { preferences } = useNavigationContext();
  const [search, setSearch] = useState('');

  // Get all available navigation items
  const navigationItems = useMemo(() => {
    if (!role) return [];
    return getNavigation(role as UserRole);
  }, [role]);

  // Combine navigation with recent items
  const allItems = useMemo(() => {
    const recent = preferences.navigationHistory.slice(0, 5).map(path => ({
      id: `recent-${path}`,
      title: `Recent: ${path.split('/').pop() || 'Home'}`,
      subtitle: path,
      href: path,
      group: 'Recent',
      icon: Clock,
    }));

    const quick = preferences.quickAccessRoutes.map(path => ({
      id: `quick-${path}`,
      title: `Quick: ${path.split('/').pop() || 'Home'}`,
      subtitle: path,
      href: path,
      group: 'Quick Access',
      icon: Star,
    }));

    const nav = navigationItems.map(item => ({
      id: `nav-${item.href}`,
      title: item.title,
      subtitle: item.href,
      href: item.href,
      group: 'Navigation',
      icon: item.icon || Hash,
    }));

    return [...recent, ...quick, ...nav];
  }, [navigationItems, preferences]);

  const handleSelect = (href: string) => {
    navigate(href);
    onOpenChange(false);
    setSearch('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <CommandPrimitive className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandPrimitive.Empty>
            
            {/* Group items by category */}
            {['Recent', 'Quick Access', 'Navigation'].map(group => {
              const items = allItems.filter(item => item.group === group);
              if (!items.length) return null;

              return (
                <CommandPrimitive.Group key={group} heading={group}>
                  {items.map((item) => (
                    <CommandPrimitive.Item
                      key={item.id}
                      value={`${item.title} ${item.subtitle}`}
                      onSelect={() => handleSelect(item.href)}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </span>
                      </div>
                      <ArrowRight className="ml-2 h-3 w-3 opacity-50" />
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              );
            })}
          </CommandPrimitive.List>
          
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span>Press ⌘K to toggle</span>
            <span>Use ↑↓ to navigate</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;