import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useQuickActions } from '@/hooks/navigation';
import { Zap, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsDropdownProps {
  className?: string;
  variant?: 'button' | 'icon';
  showShortcuts?: boolean;
}

export const QuickActionsDropdown: React.FC<QuickActionsDropdownProps> = ({
  className,
  variant = 'button',
  showShortcuts = true
}) => {
  const { quickActions, getQuickActionsByCategory } = useQuickActions();

  const actionsWithNotifications = getQuickActionsByCategory(true);
  const regularActions = getQuickActionsByCategory(false);

  if (quickActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'icon' ? 'ghost' : 'outline'}
          size={variant === 'icon' ? 'icon' : 'sm'}
          className={cn(
            'relative',
            variant === 'icon' && 'h-9 w-9',
            className
          )}
        >
          <Zap className="h-4 w-4" />
          {variant === 'button' && (
            <span className="ml-2 hidden sm:inline">Hurtighandlinger</span>
          )}
          {actionsWithNotifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {actionsWithNotifications.reduce((total, action) => 
                total + (action.badge?.count || 1), 0
              )}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Hurtighandlinger
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Actions with notifications first */}
        {actionsWithNotifications.length > 0 && (
          <>
            <DropdownMenuGroup>
              {actionsWithNotifications.map((action) => (
                <DropdownMenuItem key={action.id} asChild>
                  <Link
                    to={action.href}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{action.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {action.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <Badge
                          variant={
                            action.badge.variant === 'warning' ? 'default' :
                            action.badge.variant === 'success' ? 'secondary' :
                            action.badge.variant
                          }
                          className="h-5 text-xs"
                        >
                          {action.badge.count || 'Ny'}
                        </Badge>
                      )}
                      {showShortcuts && action.shortcut && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Keyboard className="h-3 w-3" />
                          <span>{action.shortcut}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Regular actions */}
        <DropdownMenuGroup>
          {regularActions.map((action) => (
            <DropdownMenuItem key={action.id} asChild>
              <Link
                to={action.href}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{action.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </div>
                {showShortcuts && action.shortcut && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Keyboard className="h-3 w-3" />
                    <span>{action.shortcut}</span>
                  </div>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};