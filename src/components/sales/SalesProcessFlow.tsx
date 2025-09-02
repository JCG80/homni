import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, ArrowRight, FileText, Camera, Users, Calculator } from 'lucide-react';

interface SalesStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  tasks: string[];
  documents?: string[];
  isCompleted: boolean;
  isActive: boolean;
}

interface SalesProcessFlowProps {
  currentStep: number;
  totalSteps: number;
  projectId: string;
}

export function SalesProcessFlow({ currentStep, totalSteps, projectId }: SalesProcessFlowProps) {
  const [steps] = useState<SalesStep[]>([
    {
      id: 1,
      title: 'Forberedelser',
      description: 'Samle nødvendige dokumenter og informasjon',
      icon: FileText,
      estimatedTime: '2-3 dager',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
      tasks: [
        'Samle skjøte og grunnboksutskrift',
        'Hent energimerking',
        'Skaff takst/verdsettelse',
        'Forbered teknisk tilstandsrapport'
      ],
      documents: ['Skjøte', 'Grunnboksutskrift', 'Energimerking', 'Takst']
    },
    {
      id: 2,
      title: 'Fotografering',
      description: 'Ta profesjonelle bilder av boligen',
      icon: Camera,
      estimatedTime: '1 dag',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
      tasks: [
        'Rydd og stil opp alle rom',
        'Sørg for god belysning',
        'Ta bilder av alle rom',
        'Inkluder uteareal og fasade',
        'Rediger og optimaliser bilder'
      ]
    },
    {
      id: 3,
      title: 'Prisetting',
      description: 'Bestem riktig salgspris',
      icon: Calculator,
      estimatedTime: '1-2 dager',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
      tasks: [
        'Analyser lignende solgte boliger',
        'Vurder markedstrender',
        'Konsulter takst/verdsettelse',
        'Sett utgangspris og akseptpris'
      ]
    },
    {
      id: 4,
      title: 'Markedsføring',
      description: 'Lag annonse og markedsfør boligen',
      icon: Users,
      estimatedTime: '3-5 dager',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4,
      tasks: [
        'Skriv fengslende annonsetekst',
        'Publiser på Finn.no og andre portaler',
        'Opprett sosiale medier-kampanje',
        'Forbered informasjonsmateriell'
      ]
    }
  ]);

  const activeStep = steps.find(step => step.isActive);
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salgsprosess</CardTitle>
              <CardDescription>
                Følg vår trinn-for-trinn guide for å selge boligen din
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Fullført</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={step.isActive ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {step.isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : step.isActive ? (
                    <Circle className="w-6 h-6 text-primary fill-primary/20" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <step.icon className="w-5 h-5" />
                      <span>Trinn {step.id}: {step.title}</span>
                    </CardTitle>
                    <Badge variant={step.isCompleted ? 'default' : step.isActive ? 'secondary' : 'outline'}>
                      {step.isCompleted ? 'Fullført' : step.isActive ? 'Aktiv' : 'Venter'}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {step.description} • Estimert tid: {step.estimatedTime}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {step.isActive && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Oppgaver:</h4>
                    <ul className="space-y-1">
                      {step.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center space-x-2 text-sm">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {step.documents && (
                    <div>
                      <h4 className="font-medium mb-2">Nødvendige dokumenter:</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.documents.map((doc, docIndex) => (
                          <Badge key={docIndex} variant="outline">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex space-x-2">
                    <Button>
                      Fullfør trinn
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generer dokumenter
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}