/**
 * PHASE 1B: Module Onboarding Component
 * Guides new users through module selection and setup
 * Part of Ultimate Master 2.0 implementation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from '@/modules/auth/hooks/useAuthState';
import { moduleRegistry } from '@/modules/system/ModuleRegistry';
import { getOptionalModulesForRole, toggleUserModule } from '@/modules/system/ModuleInitializer';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';
import { useModuleAwareDashboard } from '@/hooks/useModuleAwareDashboard';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Rocket, 
  Settings, 
  BarChart3,
  FileText,
  Users,
  Building,
  Home
} from 'lucide-react';

interface ModuleOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const MODULE_ICONS = {
  'lead_management': BarChart3,
  'property_management': Home,
  'content_management': FileText,
  'user_management': Users,
  'company_management': Building,
  'analytics': BarChart3,
  'system_management': Settings,
  'default': Rocket
};

export const ModuleOnboarding: React.FC<ModuleOnboardingProps> = ({ 
  onComplete,
  onSkip 
}) => {
  const { user, role } = useAuthState();
  const { dashboardConfig } = useModuleAwareDashboard();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);

  if (!user || !role) {
    return null;
  }

  const optionalModules = getOptionalModulesForRole(role);
  const optionalModuleData = moduleRegistry.getActiveModules()
    .filter(m => optionalModules.includes(m.id))
    .slice(0, 6); // Limit to 6 for better UX

  const steps = [
    {
      title: 'Welcome to Homni',
      description: `Let's set up your ${role} dashboard with the modules you need.`,
      component: WelcomeStep
    },
    {
      title: 'Choose Your Modules',
      description: 'Select the optional modules you\'d like to enable.',
      component: ModuleSelectionStep
    },
    {
      title: 'Ready to Go!',
      description: 'Your dashboard is ready with your selected modules.',
      component: CompletionStep
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const handleComplete = async () => {
    setIsApplying(true);
    
    try {
      // Apply selected modules
      const promises = Array.from(selectedModules).map(moduleId =>
        toggleUserModule(user.id, moduleId, true)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount > 0) {
        toast({
          title: 'Setup Complete!',
          description: `${successCount} modules have been enabled for your account.`,
        });
      }
      
      // Navigate to dashboard
      const targetRoute = dashboardConfig?.route || '/dashboard';
      navigate(targetRoute);
      
      onComplete?.();
    } catch (error) {
      logger.error('Error applying modules:', {}, error);
      toast({
        title: 'Setup Error',
        description: 'Some modules could not be enabled. You can configure them later.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSkip = () => {
    const targetRoute = dashboardConfig?.route || '/dashboard';
    navigate(targetRoute);
    onSkip?.();
  };

  function WelcomeStep() {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Welcome to Homni!</h2>
          <p className="text-muted-foreground mt-2">
            We've set up your core modules based on your {role} role. 
            Let's customize your experience with additional modules.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={handleNext} size="lg">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleSkip}>
            Skip Setup
          </Button>
        </div>
      </div>
    );
  }

  function ModuleSelectionStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Choose Your Modules</h2>
          <p className="text-muted-foreground">
            Select the optional modules you'd like to add to your dashboard
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {optionalModuleData.map((module) => {
            const Icon = MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
            const isSelected = selectedModules.has(module.id);
            
            return (
              <Card 
                key={module.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleModuleToggle(module.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{module.name}</h3>
                        {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  function CompletionStep() {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">You're All Set!</h2>
          <p className="text-muted-foreground mt-2">
            {selectedModules.size > 0 
              ? `${selectedModules.size} additional modules will be enabled for your account.`
              : "Your core modules are ready to use."
            }
          </p>
        </div>
        
        {selectedModules.size > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Selected Modules:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from(selectedModules).map(moduleId => {
                const module = moduleRegistry.getModule(moduleId);
                return (
                  <Badge key={moduleId} variant="secondary">
                    {module?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleComplete} 
            size="lg"
            disabled={isApplying}
          >
            {isApplying ? 'Setting up...' : 'Go to Dashboard'}
            {!isApplying && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <CurrentStepComponent />
        </CardContent>
      </Card>
    </div>
  );
};