import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CallToActionProps {
  variant?: 'default' | 'compact';
  showFeatures?: boolean;
}

export const CallToAction = ({ variant = 'default', showFeatures = true }: CallToActionProps) => {
  const features = [
    { icon: Clock, text: 'Tar under 2 minutter' },
    { icon: Shield, text: 'Helt gratis og uforpliktende' },
    { icon: CheckCircle, text: 'Kvalitetssikrede leverandører' },
  ];

  if (variant === 'compact') {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold mb-4">Klar til å spare penger?</h3>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/#wizard">
            Start sammenligning <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <h2 className="text-3xl font-bold mb-4">
        Få tilbud på <span className="text-primary">boligtjenester</span> i dag
      </h2>
      <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
        Sammenlign priser fra kvalitetsleverandører og spar både tid og penger. 
        Tusenvis av nordmenn har allerede funnet bedre tilbud gjennom Homni.
      </p>
      
      {showFeatures && (
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="h-5 w-5 text-primary" />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/#wizard">
            Start sammenligning <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/about">
            Les mer om oss
          </Link>
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        * Ingen skjulte kostnader eller forpliktelser
      </p>
    </Card>
  );
};