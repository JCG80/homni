import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, Navigation, CheckCircle } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';

interface TourStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'navigate' | 'click' | 'scroll';
    target: string;
  };
  condition?: () => boolean;
}

interface TourDefinition {
  id: string;
  name: string;
  description: string;
  role: string[];
  triggers: string[]; // URLs where tour can start
  steps: TourStep[];
}

const tours: TourDefinition[] = [
  {
    id: 'new-user-onboarding',
    name: 'Kom i gang med Homni',
    description: 'En rask gjennomgang av hvordan du sender din første forespørsel',
    role: ['user'],
    triggers: ['/dashboard', '/'],
    steps: [
      {
        id: 'welcome',
        title: 'Velkommen til Homni! 👋',
        description: 'La oss vise deg hvordan du enkelt kan få tilbud fra kvalifiserte leverandører',
        position: 'center'
      },
      {
        id: 'navigation',
        title: 'Navigasjon',
        description: 'Bruk menyen for å navigere mellom ulike seksjoner',
        element: 'nav, .sidebar',
        position: 'right'
      },
      {
        id: 'start-request',
        title: 'Start en forespørsel',
        description: 'Klikk her for å sende din første forespørsel til leverandører',
        element: '[href="/wizard"], [data-tour="start-request"]',
        position: 'bottom',
        action: { type: 'navigate', target: '/wizard' }
      },
      {
        id: 'complete',
        title: 'Du er klar! 🎉',
        description: 'Du kan nå sende forespørsler og motta tilbud. Lykke til!',
        position: 'center'
      }
    ]
  },
  {
    id: 'company-dashboard-tour',
    name: 'Bedriftsdashboard',
    description: 'Lær å administrere leads og tilbud som bedrift',
    role: ['company'],
    triggers: ['/dashboard/company'],
    steps: [
      {
        id: 'company-welcome',
        title: 'Bedriftsdashboard',
        description: 'Her administrerer du alle dine kundehenvendelser og tilbud',
        position: 'center'
      },
      {
        id: 'leads-section',
        title: 'Dine leads',
        description: 'Se alle potensielle kunder som har vist interesse for dine tjenester',
        element: '[data-tour="leads-section"]',
        position: 'top'
      },
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'Følg med på konverteringsrater og forretningsutvikling',
        element: '[data-tour="analytics-section"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'profile-setup-tour',
    name: 'Profil oppsett',
    description: 'Fullfør profilen din for bedre tilbud',
    role: ['user', 'company'],
    triggers: ['/account', '/profile'],
    steps: [
      {
        id: 'profile-importance',
        title: 'Hvorfor fullføre profilen?',
        description: 'En komplett profil hjelper leverandører gi deg mer presise og personlige tilbud',
        position: 'center'
      },
      {
        id: 'basic-info',
        title: 'Grunnleggende informasjon',
        description: 'Fyll inn navn, telefon og adresse for best mulig service',
        element: '[data-tour="basic-info"]',
        position: 'right'
      },
      {
        id: 'preferences',
        title: 'Preferanser',
        description: 'Velg hvilke tjenester du er interessert i og hvordan du vil bli kontaktet',
        element: '[data-tour="preferences"]',
        position: 'bottom'
      }
    ]
  }
];

interface GuidedTourProps {
  tourId?: string;
  autoStart?: boolean;
  className?: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ 
  tourId, 
  autoStart = false, 
  className 
}) => {
  const { t } = useI18n();
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);

  useEffect(() => {
    // Load completed tours from localStorage
    const stored = localStorage.getItem('completed-tours');
    if (stored) {
      try {
        setCompletedTours(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse completed tours');
      }
    }
  }, []);

  useEffect(() => {
    if (autoStart && isAuthenticated) {
      startRelevantTour();
    }
  }, [location.pathname, autoStart, isAuthenticated, role]);

  const startRelevantTour = () => {
    const currentRole = role || 'user';
    const availableTours = tours.filter(tour => 
      tour.role.includes(currentRole) && 
      tour.triggers.some(trigger => location.pathname.startsWith(trigger)) &&
      !completedTours.includes(tour.id)
    );

    if (availableTours.length > 0) {
      startTour(availableTours[0].id);
    }
  };

  const startTour = (id: string) => {
    const tour = tours.find(t => t.id === id);
    if (!tour) return;

    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);
    updateHighlight(tour.steps[0]);
  };

  const updateHighlight = (step: TourStep) => {
    if (step.element) {
      const element = document.querySelector(step.element);
      setHighlightElement(element);
      
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      setHighlightElement(null);
    }
  };

  const nextStep = () => {
    if (!currentTour) return;

    const currentStep = currentTour.steps[currentStepIndex];
    if (currentStep.action) {
      executeAction(currentStep.action);
    }

    if (currentStepIndex < currentTour.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      updateHighlight(currentTour.steps[nextIndex]);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      updateHighlight(currentTour.steps[prevIndex]);
    }
  };

  const executeAction = (action: TourStep['action']) => {
    if (!action) return;

    switch (action.type) {
      case 'navigate':
        navigate(action.target);
        break;
      case 'click':
        const element = document.querySelector(action.target);
        if (element) {
          (element as HTMLElement).click();
        }
        break;
      case 'scroll':
        const scrollElement = document.querySelector(action.target);
        if (scrollElement) {
          scrollElement.scrollIntoView({ behavior: 'smooth' });
        }
        break;
    }
  };

  const completeTour = () => {
    if (!currentTour) return;

    const newCompleted = [...completedTours, currentTour.id];
    setCompletedTours(newCompleted);
    localStorage.setItem('completed-tours', JSON.stringify(newCompleted));
    
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setHighlightElement(null);
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setHighlightElement(null);
  };

  if (!isActive || !currentTour) {
    return null;
  }

  const currentStep = currentTour.steps[currentStepIndex];
  const isLastStep = currentStepIndex === currentTour.steps.length - 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-auto" />
      
      {/* Highlight element */}
      {highlightElement && (
        <div
          className="fixed border-2 border-primary rounded-lg pointer-events-none z-50 animate-pulse"
          style={{
            top: highlightElement.getBoundingClientRect().top - 4,
            left: highlightElement.getBoundingClientRect().left - 4,
            width: highlightElement.getBoundingClientRect().width + 8,
            height: highlightElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tour card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed z-50 ${getPositionClasses(currentStep.position)} ${className}`}
        >
          <Card className="w-80 shadow-2xl bg-background border-primary/20">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {currentStepIndex + 1} av {currentTour.steps.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">{currentStep.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Tilbake
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="flex items-center gap-1"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Fullfør
                      </>
                    ) : (
                      <>
                        Neste
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

const getPositionClasses = (position: TourStep['position']): string => {
  switch (position) {
    case 'top':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'left-4 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'right-4 top-1/2 transform -translate-y-1/2';
    case 'center':
    default:
      return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  }
};

// Export a hook for programmatic tour control
export const useGuidedTour = () => {
  const [tourComponent, setTourComponent] = useState<React.ReactNode>(null);

  const startTour = (tourId: string) => {
    setTourComponent(<GuidedTour tourId={tourId} autoStart={true} />);
  };

  const stopTour = () => {
    setTourComponent(null);
  };

  return { tourComponent, startTour, stopTour };
};