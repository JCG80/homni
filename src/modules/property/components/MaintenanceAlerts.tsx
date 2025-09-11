import React from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MaintenanceAlert {
  id: string;
  title: string;
  propertyName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  overdue: boolean;
}

const mockAlerts: MaintenanceAlert[] = [
  {
    id: '1',
    title: 'Årlig service av ventilasjon',
    propertyName: 'Min Leilighet',
    dueDate: '2024-01-15',
    priority: 'high',
    overdue: true,
  },
  {
    id: '2',
    title: 'Skifte batterier i røykvarslere',
    propertyName: 'Min Leilighet',
    dueDate: '2024-02-01',
    priority: 'medium',
    overdue: false,
  },
  {
    id: '3',
    title: 'Kontroll av varmepumpe',
    propertyName: 'Sommerhytta',
    dueDate: '2024-02-15',
    priority: 'low',
    overdue: false,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': return 'Kritisk';
    case 'high': return 'Høy';
    case 'medium': return 'Medium';
    case 'low': return 'Lav';
    default: return priority;
  }
};

export const MaintenanceAlerts: React.FC = () => {
  const overdueAlerts = mockAlerts.filter(alert => alert.overdue);
  const upcomingAlerts = mockAlerts.filter(alert => !alert.overdue);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Vedlikeholdsvarsel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-destructive flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Forfalt ({overdueAlerts.length})
            </h4>
            {overdueAlerts.map((alert) => (
              <div key={alert.id} className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h5 className="text-sm font-medium line-clamp-1">{alert.title}</h5>
                    <Badge variant={getPriorityColor(alert.priority)} className="ml-2 shrink-0">
                      {getPriorityLabel(alert.priority)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.propertyName}</p>
                  <p className="text-xs text-destructive font-medium">
                    Forfalt: {new Date(alert.dueDate).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcomingAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Kommende ({upcomingAlerts.length})
            </h4>
            {upcomingAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h5 className="text-sm font-medium line-clamp-1">{alert.title}</h5>
                    <Badge variant={getPriorityColor(alert.priority)} className="ml-2 shrink-0">
                      {getPriorityLabel(alert.priority)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.propertyName}</p>
                  <p className="text-xs text-muted-foreground">
                    Frist: {new Date(alert.dueDate).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {mockAlerts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ingen vedlikeholdsoppgaver</p>
          </div>
        )}

        <Button variant="outline" className="w-full">
          Se alle oppgaver
        </Button>
      </CardContent>
    </Card>
  );
};