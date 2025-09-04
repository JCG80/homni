import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Calculator, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Ny Eiendom',
      description: 'Registrer en ny eiendom',
      icon: Plus,
      onClick: () => navigate('/properties/new'),
      variant: 'default' as const,
    },
    {
      title: 'Last opp dokument',
      description: 'Legg til dokumenter',
      icon: Upload,
      onClick: () => navigate('/properties/documents'),
      variant: 'outline' as const,
    },
    {
      title: 'Utgiftskalkulator',
      description: 'Beregn kostnader',
      icon: Calculator,
      onClick: () => navigate('/properties/calculator'),
      variant: 'outline' as const,
    },
    {
      title: 'Innstillinger',
      description: 'Administrer preferanser',
      icon: Settings,
      onClick: () => navigate('/properties/settings'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hurtighandlinger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="w-full justify-start h-auto p-4"
            onClick={action.onClick}
          >
            <div className="flex items-center gap-3">
              <action.icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}