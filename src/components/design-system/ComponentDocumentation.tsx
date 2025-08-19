import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ComponentDocProps {
  name: string;
  description: string;
  props?: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  variants?: Array<{
    name: string;
    description: string;
  }>;
  example?: React.ReactNode;
}

export const ComponentDocumentation: React.FC<ComponentDocProps> = ({
  name,
  description,
  props = [],
  variants = [],
  example
}) => {
  return (
    <Card variant="soft" className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline">{name}</Badge>
          <span className="text-sm font-normal text-muted-foreground">Komponent</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {example && (
          <div>
            <h4 className="text-sm font-medium mb-2">Eksempel</h4>
            <div className="p-4 border rounded-md bg-background/50">
              {example}
            </div>
          </div>
        )}
        
        {props.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Props</h4>
            <div className="space-y-2">
              {props.map((prop, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <Badge variant={prop.required ? "default" : "secondary"} className="text-xs">
                    {prop.name}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-mono text-xs text-muted-foreground">{prop.type}</div>
                    <div>{prop.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {variants.length > 0 && (
          <div>
            <Separator className="my-3" />
            <h4 className="text-sm font-medium mb-2">Varianter</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {variants.map((variant, index) => (
                <div key={index} className="p-3 border rounded-md bg-background/50">
                  <div className="font-medium text-sm">{variant.name}</div>
                  <div className="text-xs text-muted-foreground">{variant.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};