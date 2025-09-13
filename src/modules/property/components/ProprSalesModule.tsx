import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  FileText, 
  Camera, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

interface ProprSalesModuleProps {
  propertyId?: string;
}

interface SalesProcess {
  id: string;
  property_id: string;
  status: 'planning' | 'preparation' | 'marketing' | 'negotiation' | 'closing' | 'completed';
  current_step: number;
  total_steps: number;
  estimated_value: number;
  target_price: number;
  marketing_started: string | null;
  expected_completion: string | null;
  created_at: string;
  updated_at: string;
}

interface SalesStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  estimated_days: number;
  required_documents: string[];
  tasks: string[];
}

const salesSteps: SalesStep[] = [
  {
    id: 1,
    title: 'Forberedelse',
    description: 'Samle dokumenter og forbered eiendommen for salg',
    completed: false,
    estimated_days: 14,
    required_documents: [
      'Grunnbokutskrift',
      'Energiattest',
      'Tegninger/plantegninger', 
      'Kommunale dokumenter',
      'Forsikringspapirer'
    ],
    tasks: [
      'Gjennomføre teknisk gjennomgang',
      'Rydde og gjøre eiendommen presentabel',
      'Ta profesjonelle bilder',
      'Utarbeide salgsprospekt'
    ]
  },
  {
    id: 2,
    title: 'Verdivurdering',
    description: 'Fastsett realistisk markedsverdi og salgspris',
    completed: false,
    estimated_days: 3,
    required_documents: ['Sammenlignbare salg', 'Takstrapport (valgfritt)'],
    tasks: [
      'Analysere sammenlignbare salg',
      'Vurdere unike egenskaper',
      'Fastsette startpris og minimumspris'
    ]
  },
  {
    id: 3,
    title: 'Markedsføring',
    description: 'Publiser annonse og markedsfør eiendommen',
    completed: false,
    estimated_days: 21,
    required_documents: ['Salgsprospekt', 'Profesjonelle bilder'],
    tasks: [
      'Publisere på Finn.no og andre portaler',
      'Arrangere visninger',
      'Håndtere henvendelser fra interessenter',
      'Følge opp potensielle kjøpere'
    ]
  },
  {
    id: 4,
    title: 'Forhandling',
    description: 'Motta og håndtere bud fra interessenter',
    completed: false,
    estimated_days: 7,
    required_documents: ['Budskjema', 'Kjøpskontrakt'],
    tasks: [
      'Evaluere innkomne bud',
      'Forhandle vilkår og pris',
      'Avtale overtagelse',
      'Signere kjøpskontrakt'
    ]
  },
  {
    id: 5,
    title: 'Gjennomføring',
    description: 'Fullføre salget og overføre eiendomsretten',
    completed: false,
    estimated_days: 14,
    required_documents: ['Signert kjøpskontrakt', 'Skjøte'],
    tasks: [
      'Koordinere med advokat/eiendomsmegler',
      'Gjennomføre overtakelse',
      'Overføre eiendomsrett',
      'Motta salgsum'
    ]
  }
];

export const ProprSalesModule: React.FC<ProprSalesModuleProps> = ({ propertyId }) => {
  const { user } = useAuth();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Fetch property data
  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId && !!user?.id
  });

  // Mock sales process data (in real app, this would come from database)
  const salesProcess = {
    status: 'planning' as const,
    current_step: 1,
    total_steps: 5,
    estimated_value: property?.current_value || 4500000,
    target_price: (property?.current_value || 4500000) * 0.95,
    progress: 20
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'preparation': return 'bg-yellow-100 text-yellow-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planlegging';
      case 'preparation': return 'Forberedelse';
      case 'marketing': return 'Markedsføring';
      case 'negotiation': return 'Forhandling';
      case 'closing': return 'Gjennomføring';
      case 'completed': return 'Fullført';
      default: return 'Ukjent';
    }
  };

  if (!propertyId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Ingen eiendom valgt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Propr - Selg selv</h2>
          <p className="text-muted-foreground">
            Veiledning for å selge eiendommen din selv
          </p>
        </div>
        <Badge className={getStatusColor(salesProcess.status)}>
          {getStatusLabel(salesProcess.status)}
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Salgsprosess oversikt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Fremdrift</span>
              <span>{salesProcess.progress}% fullført</span>
            </div>
            <Progress value={salesProcess.progress} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('nb-NO', { 
                    style: 'currency', 
                    currency: 'NOK',
                    maximumFractionDigits: 0 
                  }).format(salesProcess.estimated_value)}
                </div>
                <p className="text-sm text-muted-foreground">Estimert verdi</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('nb-NO', { 
                    style: 'currency', 
                    currency: 'NOK',
                    maximumFractionDigits: 0 
                  }).format(salesProcess.target_price)}
                </div>
                <p className="text-sm text-muted-foreground">Målpris</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {salesProcess.current_step}/{salesProcess.total_steps}
                </div>
                <p className="text-sm text-muted-foreground">Steg fullført</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Salgsprosess steg
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesSteps.map((step, index) => {
              const isActive = index === salesProcess.current_step - 1;
              const isCompleted = index < salesProcess.current_step - 1;
              const isCurrent = index === salesProcess.current_step - 1;
              
              return (
                <div 
                  key={step.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : 
                    isCompleted ? 'border-green-500 bg-green-50' : 
                    'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.id}
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{step.estimated_days} dager</p>
                      <p className="text-xs text-muted-foreground">Estimert tid</p>
                    </div>
                  </div>

                  {/* Expanded step details */}
                  {selectedStep === step.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Nødvendige dokumenter:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {step.required_documents.map((doc, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Oppgaver:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {step.tasks.map((task, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {isCurrent && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="gap-2">
                            <Play className="w-4 h-4" />
                            Start dette steget
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Se sjekkliste
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtighandlinger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Ta bilder</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Lag prospekt</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Verdivurdering</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Share2 className="w-6 h-6" />
              <span className="text-sm">Del annonse</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Ressurser og hjelp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Maler og skjemaer</h4>
              <div className="space-y-1">
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Salgsprospekt mal
                </Button>
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Budskjema
                </Button>
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Kjøpskontrakt
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Veiledninger</h4>
              <div className="space-y-1">
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Hvordan ta gode bilder
                </Button>
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Arrangere visning
                </Button>
                <Button variant="link" className="p-0 h-auto justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Forhandle pris
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};