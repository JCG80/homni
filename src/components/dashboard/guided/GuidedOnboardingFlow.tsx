import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Sparkles,
  User,
  Home,
  MessageSquare,
  Target,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action?: {
    label: string;
    onClick: () => void;
  };
  completed: boolean;
  optional?: boolean;
}

interface GuidedOnboardingFlowProps {
  userStats: {
    totalRequests: number;
    hasProperties: boolean;
    profileCompleted: boolean;
    isNewUser: boolean;
  };
  onStepComplete: (stepId: string) => void;
  onComplete: () => void;
}

/**
 * Interactive onboarding flow that guides new users through key actions
 */
export const GuidedOnboardingFlow: React.FC<GuidedOnboardingFlowProps> = ({
  userStats,
  onStepComplete,
  onComplete
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Komplett din profil',
      description: 'Legg til grunnleggende informasjon for bedre tilbud',
      icon: User,
      action: {
        label: 'Gå til profil',
        onClick: () => navigate('/profile')
      },
      completed: userStats.profileCompleted
    },
    {
      id: 'first-request',
      title: 'Send din første forespørsel',
      description: 'Få gratis pristilbud fra kvalifiserte tjenesteyterne',
      icon: MessageSquare,
      action: {
        label: 'Opprett forespørsel',
        onClick: () => navigate('/')
      },
      completed: userStats.totalRequests > 0
    },
    {
      id: 'property',
      title: 'Registrer en eiendom',
      description: 'Få mer presise tilbud ved å legge til eiendomsinformasjon',
      icon: Home,
      action: {
        label: 'Legg til eiendom',
        onClick: () => navigate('/properties')
      },
      completed: userStats.hasProperties,
      optional: true
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const totalSteps = onboardingSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  useEffect(() => {
    // Auto-advance to next incomplete step
    const nextIncompleteStep = onboardingSteps.findIndex(step => !step.completed);
    if (nextIncompleteStep !== -1) {
      setCurrentStep(nextIncompleteStep);
    }
  }, [userStats]);

  useEffect(() => {
    // Show celebration when all required steps are completed
    const requiredSteps = onboardingSteps.filter(step => !step.optional);
    const completedRequired = requiredSteps.filter(step => step.completed).length;
    
    if (completedRequired === requiredSteps.length && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onComplete();
      }, 3000);
    }
  }, [completedSteps]);

  const handleStepAction = (step: OnboardingStep) => {
    if (step.action) {
      step.action.onClick();
    }
  };

  const getStepStatus = (step: OnboardingStep, index: number) => {
    if (step.completed) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <Card className="p-8 text-center max-w-md">
          <CardContent className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <Gift className="w-16 h-16 text-primary mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold">Gratulerer! 🎉</h2>
            <p className="text-muted-foreground">
              Du har fullført onboardingen og er klar til å bruke Homni!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Du har låst opp alle hovedfunksjonene</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Kom i gang med Homni
          </CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{totalSteps} fullført
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {progress === 100 
              ? 'Alle steg fullført! Du er klar til å bruke Homni.' 
              : 'Fullfør stegene under for å få mest ut av Homni'
            }
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {onboardingSteps.map((step, index) => {
            const status = getStepStatus(step, index);
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  status === 'completed' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : status === 'current'
                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                    : 'bg-muted/50 border-muted'
                }`}
              >
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : status === 'current'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${
                      step.completed ? 'text-foreground line-through' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    {step.optional && (
                      <Badge variant="outline" className="text-xs">
                        Valgfritt
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    step.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Step Action */}
                {!step.completed && step.action && status === 'current' && (
                  <Button
                    size="sm"
                    onClick={() => handleStepAction(step)}
                    className="flex items-center gap-1"
                  >
                    {step.action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}

                {step.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Completion Message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Fantastisk arbeid!
              </span>
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Du har fullført alle hovedsteg og kan nå utnytte alle Homnis funksjoner.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};