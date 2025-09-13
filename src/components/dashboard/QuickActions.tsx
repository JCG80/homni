import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MessageSquare, Home, FileText, Settings, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Ny eiendom',
      description: 'Legg til en ny eiendom',
      action: () => navigate('/properties/new'),
      primary: true
    },
    {
      icon: MessageSquare,
      label: 'Send forespørsel',
      description: 'Be om tilbud på tjenester',
      action: () => navigate('/leads/new'),
      primary: true
    },
    {
      icon: FileText,
      label: 'Last opp dokument',
      description: 'Legg til dokumenter til eiendommer',
      action: () => navigate('/documents/upload'),
      primary: false
    },
    {
      icon: Search,
      label: 'Finn leverandører',
      description: 'Søk etter tjenesteleverandører',
      action: () => navigate('/search'),
      primary: false
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? 'default' : 'outline'}
              onClick={action.action}
              className="h-auto flex flex-col items-center gap-2 p-4"
            >
              <action.icon className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};