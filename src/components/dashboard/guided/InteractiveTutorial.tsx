import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  Lightbulb,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InteractiveTutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onDismiss: () => void;
  autoPlay?: boolean;
}

/**
 * Interactive tutorial system with guided tours and contextual help
 */
export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  tutorialId,
  steps,
  isActive,
  onComplete,
  onDismiss,
  autoPlay = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    // Highlight target element
    const step = steps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.classList.add('tutorial-highlight');
      }
    }

    return () => {
      // Clean up highlighting
      if (highlightedElement) {
        highlightedElement.style.zIndex = '';
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
          onComplete();
        }
      }, 4000); // Auto-advance every 4 seconds
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, isActive, onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(autoPlay);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: '50%', left: '50%' };

    const rect = highlightedElement.getBoundingClientRect();
    const step = steps[currentStep];
    
    switch (step.position) {
      case 'top':
        return { 
          top: rect.top - 10, 
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return { 
          top: rect.bottom + 10, 
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return { 
          top: rect.top + rect.height / 2, 
          left: rect.left - 10,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return { 
          top: rect.top + rect.height / 2, 
          left: rect.right + 10,
          transform: 'translate(0, -50%)'
        };
      default:
        return { 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-1000 transition-opacity"
        style={{ zIndex: 1000 }}
      />

      {/* Tutorial Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-1001 max-w-sm"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: tooltipPosition.transform,
            zIndex: 1001
          }}
        >
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {currentStep + 1}/{steps.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData.content}
                </p>

                {/* Step Action */}
                {currentStepData.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={currentStepData.action.onClick}
                    className="w-full"
                  >
                    {currentStepData.action.label}
                  </Button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                {/* Play Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="h-6 w-6 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRestart}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNext}
                    className="h-6 w-6 p-0"
                  >
                    {currentStep === steps.length - 1 ? (
                      'Ferdig'
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="fixed bottom-4 right-4 z-1001">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
        </Card>
      </div>

      <style>{`
        .tutorial-highlight {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 4px !important;
        }
      `}</style>
    </>
  );
};