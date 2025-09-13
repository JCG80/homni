import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Home, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Shortcut {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  keyboard?: string;
}

export const UserShortcuts: React.FC = () => {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    {
      title: 'Send forespørsel',
      description: 'Få tilbud fra tjenesteyterne',
      icon: Plus,
      action: () => navigate('/'),
      variant: 'default',
      keyboard: 'Ctrl+N'
    },
    {
      title: 'Mine eiendommer',
      description: 'Administrer dine eiendommer',
      icon: Home,
      action: () => navigate('/properties'),
      variant: 'outline'
    },
    {
      title: 'Mine forespørsler',
      description: 'Se status på forespørsler',
      icon: MessageSquare,
      action: () => navigate('/leads'),
      variant: 'outline'
    },
    {
      title: 'Innstillinger',
      description: 'Administrer kontoen din',
      icon: Settings,
      action: () => navigate('/profile'),
      variant: 'ghost'
    },
    {
      title: 'Hjelp',
      description: 'FAQ og support',
      icon: HelpCircle,
      action: () => navigate('/help'),
      variant: 'ghost'
    }
  ];

  // Quick keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [navigate]);

  return (
    <div className="space-y-4">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.slice(0, 4).map((shortcut) => (
          <Button
            key={shortcut.title}
            variant={shortcut.variant}
            className="h-auto p-3 justify-start"
            onClick={shortcut.action}
          >
            <div className="flex items-center gap-2 w-full">
              <shortcut.icon className="w-4 h-4 flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="font-medium text-sm">{shortcut.title}</div>
                <div className="text-xs opacity-75">{shortcut.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Additional Actions */}
      <div className="space-y-2">
        {shortcuts.slice(4).map((shortcut) => (
          <Button
            key={shortcut.title}
            variant={shortcut.variant}
            size="sm"
            className="w-full justify-between h-auto p-2"
            onClick={shortcut.action}
          >
            <div className="flex items-center gap-2">
              <shortcut.icon className="w-4 h-4" />
              <span className="text-sm">{shortcut.title}</span>
            </div>
            <ArrowRight className="w-3 h-3" />
          </Button>
        ))}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>Tips: Bruk Ctrl+N for ny forespørsel</span>
        </div>
      </div>
    </div>
  );
};