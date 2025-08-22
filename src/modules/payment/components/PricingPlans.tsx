import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Users } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  recommended?: boolean;
  icon: React.ComponentType<any>;
  stripePriceId: string;
}

interface PricingPlansProps {
  onSelectPlan: (priceId: string) => void;
  isLoading?: boolean;
  selectedPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  isLoading = false,
  selectedPlan
}) => {
  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      interval: 'month',
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 1 property',
        'Basic property management',
        'Essential documentation',
        'Email support',
        'Mobile access'
      ],
      icon: Users,
      stripePriceId: 'free'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      interval: 'month',
      description: 'Best for property professionals',
      features: [
        'Up to 10 properties',
        'Advanced property analytics',
        'Document management system',
        'Priority support',
        'Mobile & desktop access',
        'Lead generation tools',
        'Market insights',
        'Custom reports'
      ],
      recommended: true,
      icon: Zap,
      stripePriceId: 'price_professional_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
      description: 'For large organizations and teams',
      features: [
        'Unlimited properties',
        'Advanced analytics & AI insights',
        'White-label solution',
        'Dedicated account manager',
        'API access',
        'Custom integrations',
        'Team collaboration tools',
        'Enterprise security',
        'SLA guarantee'
      ],
      icon: Crown,
      stripePriceId: 'price_enterprise_monthly'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {plans.map((plan) => {
        const IconComponent = plan.icon;
        const isSelected = selectedPlan === plan.stripePriceId;
        const isFree = plan.price === 0;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative ${plan.recommended ? 'ring-2 ring-primary shadow-lg' : ''} ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
            } warm-card hover-lift`}
          >
            {plan.recommended && (
              <Badge 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1"
              >
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">
                  {isFree ? 'Free' : `€${plan.price}`}
                </span>
                {!isFree && (
                  <span className="text-muted-foreground">/{plan.interval}</span>
                )}
              </div>
              
              <p className="text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button
                  onClick={() => onSelectPlan(plan.stripePriceId)}
                  disabled={isLoading || isSelected}
                  className="w-full warm-button"
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {isLoading && selectedPlan === plan.stripePriceId && (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  )}
                  {isFree ? 'Get Started Free' : 
                   isSelected ? 'Selected' : 
                   `Choose ${plan.name}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};