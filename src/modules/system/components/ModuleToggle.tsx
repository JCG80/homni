
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModuleToggleProps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  onToggle: (id: string, isActive: boolean) => void;
}

export const ModuleToggle = ({ 
  id, 
  name, 
  description, 
  isActive, 
  onToggle 
}: ModuleToggleProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{name}</h3>
            <Badge variant={isActive ? "default" : "outline"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch 
          checked={isActive} 
          onCheckedChange={(checked) => onToggle(id, checked)} 
        />
      </CardContent>
    </Card>
  );
};
