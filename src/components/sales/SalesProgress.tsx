import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';

interface SalesProject {
  id: string;
  propertyAddress: string;
  currentStep: number;
  totalSteps: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: string;
  estimatedCompletion?: string;
}

interface SalesProgressProps {
  project: SalesProject;
  currentStep: number;
  totalSteps: number;
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'completed' | 'current' | 'upcoming' | 'overdue';
  description: string;
}

export function SalesProgress({ project, currentStep, totalSteps }: SalesProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Dokumenter samlet',
      targetDate: '2024-01-25',
      status: 'completed',
      description: 'Alle nødvendige dokumenter er samlet og verifisert'
    },
    {
      id: '2', 
      title: 'Fotografering fullført',
      targetDate: '2024-01-30',
      status: 'completed',
      description: 'Profesjonelle bilder tatt og redigert'
    },
    {
      id: '3',
      title: 'Pris fastsatt',
      targetDate: '2024-02-05',
      status: 'current',
      description: 'Utgangspris og akseptpris bestemt basert på markedsanalyse'
    },
    {
      id: '4',
      title: 'Markedsføring startet',
      targetDate: '2024-02-10',
      status: 'upcoming',
      description: 'Annonse publisert og markedsføringskampanje igangsatt'
    },
    {
      id: '5',
      title: 'Visninger gjennomført',
      targetDate: '2024-02-20',
      status: 'upcoming',
      description: 'Åpne hus og private visninger arrangert'
    },
    {
      id: '6',
      title: 'Tilbud mottatt',
      targetDate: '2024-02-25',
      status: 'upcoming',
      description: 'Seriøse tilbud mottatt og vurdert'
    }
  ];

  const getMilestoneStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Fullført</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800">Pågår</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Kommende</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Forsinket</Badge>;
    }
  };

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const milestoneProgress = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salgsprosess</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <p className="text-xs text-muted-foreground">
              Trinn {currentStep} av {totalSteps}
            </p>
            <Progress value={progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milepæler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(milestoneProgress)}% fullført
            </p>
            <Progress value={milestoneProgress} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prosjektoversikt</CardTitle>
              <CardDescription>Status og nøkkelinformasjon</CardDescription>
            </div>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status === 'active' ? 'Aktiv' : 
               project.status === 'draft' ? 'Utkast' : 
               project.status === 'completed' ? 'Fullført' : 'Pauset'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Startet</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString('no-NO')}
                </p>
              </div>
            </div>
            
            {project.estimatedCompletion && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Estimert ferdig</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.estimatedCompletion).toLocaleDateString('no-NO')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milepæler og deadlines</CardTitle>
          <CardDescription>
            Viktige datoer og hendelser i salgsprosessen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'current' ? 'bg-blue-500' :
                    milestone.status === 'overdue' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{milestone.title}</h4>
                    {getMilestoneStatusBadge(milestone.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {milestone.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Måldato: {new Date(milestone.targetDate).toLocaleDateString('no-NO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ytelse og statistikk</CardTitle>
          <CardDescription>
            Sammenligning med lignende salg og markedstrender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tid brukt</p>
              <p className="text-2xl font-bold">18 dager</p>
              <p className="text-xs text-muted-foreground">
                Gjennomsnitt: 45 dager
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fremgang vs. plan</p>
              <p className="text-2xl font-bold text-green-600">+12%</p>
              <p className="text-xs text-muted-foreground">
                Foran skjema
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kostnadsbesparelse</p>
              <p className="text-2xl font-bold">~45,000 kr</p>
              <p className="text-xs text-muted-foreground">
                vs. megler
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}