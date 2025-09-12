/**
 * Module Integration Hub - Central access point for cross-module workflows
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/utils/logger';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  Home,
  Users,
  Calendar,
  DollarSign,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { moduleManager } from '@/modules/core/ModuleManager';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';

interface IntegrationWorkflow {
  id: string;
  title: string;
  description: string;
  modules: string[];
  icon: React.ReactNode;
  category: 'property' | 'sales' | 'leads' | 'cross';
  complexity: 'simple' | 'intermediate' | 'advanced';
  estimated_time: string;
  potential_value: string;
}

export const ModuleIntegrationHub = () => {
  const { user } = useAuth();
  const [activeWorkflows, setActiveWorkflows] = useState<IntegrationWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  const workflows: IntegrationWorkflow[] = [
    {
      id: 'property-to-sale',
      title: 'Eiendom til DIY-salg',
      description: 'Konvertér din dokumenterte eiendom til et DIY-salgsprosjekt og spar på meglerhonorar',
      modules: ['Boligmappa', 'Propr'],
      icon: <Home className="h-5 w-5" />,
      category: 'cross',
      complexity: 'intermediate',
      estimated_time: '15 min',
      potential_value: '50,000 - 150,000 kr'
    },
    {
      id: 'lead-to-property',
      title: 'Lead til eiendomsregistrering',
      description: 'Konvertér innkommende eiendomslead til fullstendig eiendomsdokumentasjon',
      modules: ['Bytt', 'Boligmappa'],
      icon: <Building2 className="h-5 w-5" />,
      category: 'cross',
      complexity: 'simple',
      estimated_time: '10 min',
      potential_value: 'Økt eiendomsverdi'
    },
    {
      id: 'market-analysis',
      title: 'Komplett markedsanalyse',
      description: 'Kombiner eiendomsdata med markedsinnsikt for optimal verdivurdering',
      modules: ['Boligmappa', 'Bytt', 'Propr'],
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'cross',
      complexity: 'advanced',
      estimated_time: '20 min',
      potential_value: 'Markedsinnsikt'
    },
    {
      id: 'maintenance-to-value',
      title: 'Vedlikehold til verdiøkning',
      description: 'Planlegg vedlikehold basert på markedstrends og salgsklargjøring',
      modules: ['Boligmappa', 'Propr'],
      icon: <Calendar className="h-5 w-5" />,
      category: 'property',
      complexity: 'intermediate',
      estimated_time: '12 min',
      potential_value: '10-30% verdiøkning'
    },
    {
      id: 'lead-distribution-optimization',
      title: 'Optimalisert lead-distribusjon',
      description: 'Forbedre lead-matching basert på selskapets historiske prestasjoner',
      modules: ['Bytt'],
      icon: <Users className="h-5 w-5" />,
      category: 'leads',
      complexity: 'simple',
      estimated_time: '5 min',
      potential_value: 'Høyere konvertering'
    },
    {
      id: 'cost-benefit-analysis',
      title: 'Kostnads-nytte analyse',
      description: 'Sammenlign DIY-salg vs meglersalg basert på din eiendoms karakteristikker',
      modules: ['Propr', 'Boligmappa'],
      icon: <DollarSign className="h-5 w-5" />,
      category: 'sales',
      complexity: 'intermediate',
      estimated_time: '8 min',
      potential_value: 'Informert beslutning'
    }
  ];

  useEffect(() => {
    if (user?.id) {
      loadAvailableWorkflows();
    }
  }, [user?.id]);

  const loadAvailableWorkflows = async () => {
    try {
      setLoading(true);
      
      // Get user data to determine available workflows
      const userData = await moduleManager.initializeUserJourney(user!.id);
      
      // Filter workflows based on user's current data
      const available = workflows.filter(workflow => {
        switch (workflow.id) {
          case 'property-to-sale':
            return userData.properties.length > 0;
          case 'lead-to-property':
            return userData.active_leads.some(lead => 
              lead.category === 'property_documentation' || 
              lead.metadata?.property_details
            );
          case 'market-analysis':
            return userData.properties.length > 0 || userData.active_leads.length > 0;
          case 'maintenance-to-value':
            return userData.properties.length > 0;
          case 'cost-benefit-analysis':
            return userData.properties.length > 0;
          default:
            return true;
        }
      });
      
      setActiveWorkflows(available);
    } catch (error) {
      logger.error('Failed to load workflows:', {}, error);
      toast.error('Kunne ikke laste arbeidsflyter');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      toast.success(`Starter arbeidsflyt: ${workflows.find(w => w.id === workflowId)?.title}`);
      
      switch (workflowId) {
        case 'property-to-sale':
          // Would open property selection dialog
          break;
        case 'lead-to-property':
          // Would open lead conversion dialog
          break;
        case 'market-analysis':
          // Would open market analysis workflow
          break;
        default:
          toast.info('Arbeidsflyt kommer snart!');
      }
    } catch (error) {
      logger.error('Failed to execute workflow:', {}, error);
      toast.error('Kunne ikke starte arbeidsflyt');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'property': return <Home className="h-4 w-4" />;
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'leads': return <Users className="h-4 w-4" />;
      case 'cross': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Integrasjonshub</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Koble sammen dine eiendommer, leads og salgsprosesser for maksimal verdi. 
          Hver integrasjon er designet for å spare deg tid og penger.
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Tilgjengelige ({activeWorkflows.length})</TabsTrigger>
          <TabsTrigger value="category">Etter kategori</TabsTrigger>
          <TabsTrigger value="complexity">Etter kompleksitet</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {activeWorkflows.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen arbeidsflyter tilgjengelig</h3>
                <p className="text-muted-foreground mb-4">
                  Legg til eiendommer eller leads for å låse opp smarte integrasjoner.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">Legg til eiendom</Button>
                  <Button variant="outline">Se alle leads</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeWorkflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {workflow.icon}
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(workflow.category)}
                          </div>
                        </div>
                        <Badge className={getComplexityColor(workflow.complexity)}>
                          {workflow.complexity === 'simple' ? 'Enkelt' :
                           workflow.complexity === 'intermediate' ? 'Medium' : 'Avansert'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{workflow.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {workflow.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {workflow.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>⏱️ {workflow.estimated_time}</span>
                          <span>💰 {workflow.potential_value}</span>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => executeWorkflow(workflow.id)}
                        >
                          Start arbeidsflyt
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          {['cross', 'property', 'sales', 'leads'].map(category => {
            const categoryWorkflows = activeWorkflows.filter(w => w.category === category);
            if (categoryWorkflows.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category === 'cross' ? 'Tversgående' :
                   category === 'property' ? 'Eiendom' :
                   category === 'sales' ? 'Salg' : 'Leads'}
                  <Badge variant="secondary">{categoryWorkflows.length}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryWorkflows.map((workflow) => (
                    <Card key={workflow.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          {workflow.icon}
                          <Badge className={getComplexityColor(workflow.complexity)}>
                            {workflow.complexity === 'simple' ? 'Enkelt' :
                             workflow.complexity === 'intermediate' ? 'Medium' : 'Avansert'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-2">{workflow.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {workflow.description}
                        </p>
                        <Button size="sm" className="w-full" onClick={() => executeWorkflow(workflow.id)}>
                          Start
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="complexity" className="space-y-6">
          {['simple', 'intermediate', 'advanced'].map(complexity => {
            const complexityWorkflows = activeWorkflows.filter(w => w.complexity === complexity);
            if (complexityWorkflows.length === 0) return null;
            
            return (
              <div key={complexity}>
                <h3 className="text-lg font-semibold mb-4">
                  {complexity === 'simple' ? 'Enkle arbeidsflyter' :
                   complexity === 'intermediate' ? 'Medium kompleksitet' : 'Avanserte arbeidsflyter'}
                  <Badge variant="secondary" className="ml-2">{complexityWorkflows.length}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complexityWorkflows.map((workflow) => (
                    <Card key={workflow.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {workflow.icon}
                          <h4 className="font-medium">{workflow.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {workflow.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>⏱️ {workflow.estimated_time}</span>
                          <span>💰 {workflow.potential_value}</span>
                        </div>
                        <Button size="sm" className="w-full" onClick={() => executeWorkflow(workflow.id)}>
                          Start arbeidsflyt
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};