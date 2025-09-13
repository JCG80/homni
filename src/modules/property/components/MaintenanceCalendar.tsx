import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle2, Plus, Settings } from 'lucide-react';

interface MaintenanceTask {
  id: string;
  title: string;
  property: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'overdue' | 'completed';
  category: string;
  estimatedCost?: number;
}

export const MaintenanceCalendar: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Mock maintenance data
  const tasks: MaintenanceTask[] = [
    {
      id: '1',
      title: 'Rense takrenner',
      property: 'Hovedhuset',
      dueDate: new Date(2024, 11, 15),
      priority: 'high',
      status: 'overdue',
      category: 'Utendørs',
      estimatedCost: 2500
    },
    {
      id: '2',
      title: 'Skifte luftfilter',
      property: 'Leilighet Sentrum',
      dueDate: new Date(2024, 11, 20),
      priority: 'medium',
      status: 'pending',
      category: 'Ventilasjon',
      estimatedCost: 500
    },
    {
      id: '3',
      title: 'Kontroll av røykvarslere',
      property: 'Hovedhuset',
      dueDate: new Date(2024, 11, 25),
      priority: 'high',
      status: 'pending',
      category: 'Sikkerhet',
      estimatedCost: 0
    },
    {
      id: '4',
      title: 'Vinduspussing',
      property: 'Leilighet Sentrum',
      dueDate: new Date(2025, 0, 5),
      priority: 'low',
      status: 'pending',
      category: 'Renhold',
      estimatedCost: 1200
    }
  ];

  const overdueTasks = tasks.filter(task => task.status === 'overdue');
  const upcomingTasks = tasks.filter(task => task.status === 'pending');
  const totalEstimatedCost = tasks.reduce((sum, task) => sum + (task.estimatedCost || 0), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Vedlikeholdskalender
          </h2>
          <p className="text-muted-foreground">
            Planlegg og spor vedlikeholdsoppgaver for alle eiendommer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Innstillinger
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ny oppgave
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Forsinket</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{overdueTasks.length}</div>
            <p className="text-sm text-red-700">oppgaver krever oppmerksomhet</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Kommende</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{upcomingTasks.length}</div>
            <p className="text-sm text-yellow-700">oppgaver neste 30 dager</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{tasks.length}</div>
            <p className="text-sm text-blue-700">aktive oppgaver</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💰</span>
              <span className="font-medium text-green-800">Budsjett</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {totalEstimatedCost.toLocaleString('nb-NO')} kr
            </div>
            <p className="text-sm text-green-700">estimerte kostnader</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tidsperiode</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Uke
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Måned
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('quarter')}
              >
                Kvartal
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Forsinkede oppgaver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.map((task) => (
                <div key={task.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900">{task.title}</h4>
                      <p className="text-sm text-red-700">{task.property}</p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Middels' : 'Lav'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      {getStatusIcon(task.status)}
                      <span>Forfalt {task.dueDate.toLocaleDateString('nb-NO')}</span>
                    </div>
                    {task.estimatedCost && task.estimatedCost > 0 && (
                      <span className="text-sm font-medium text-red-800">
                        {task.estimatedCost.toLocaleString('nb-NO')} kr
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Marker som utført
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300">
                      Utsett
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Kommende oppgaver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Middels' : 'Lav'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getStatusIcon(task.status)}
                    <span>Forfaller {task.dueDate.toLocaleDateString('nb-NO')}</span>
                  </div>
                  {task.estimatedCost && task.estimatedCost > 0 && (
                    <span className="text-sm font-medium">
                      {task.estimatedCost.toLocaleString('nb-NO')} kr
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    Rediger
                  </Button>
                  <Button size="sm" variant="outline">
                    Planlegg
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Smarte anbefalinger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white/50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-1">Automatiser rutiner</h4>
            <p className="text-sm text-blue-700 mb-2">
              Sett opp automatiske påminnelser for repeterende oppgaver som luftfilter og røykvarslere.
            </p>
            <Button size="sm" variant="outline" className="border-blue-300">
              Konfigurer automatisering
            </Button>
          </div>
          
          <div className="p-3 bg-white/50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-1">Sesongvedlikehold</h4>
            <p className="text-sm text-blue-700 mb-2">
              Forbered deg på vintersesongen med varmepumpe-service og tetting av vinduer.
            </p>
            <Button size="sm" variant="outline" className="border-blue-300">
              Se vintersjekkliste
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};