
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SystemModule } from '../../types/systemTypes';

interface ModuleDetailsPanelProps {
  selectedNode: SystemModule | null;
}

export const ModuleDetailsPanel = ({ selectedNode }: ModuleDetailsPanelProps) => {
  return (
    <Card className="h-[600px] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          {selectedNode ? selectedNode.name : 'Moduldetaljer'}
          {selectedNode && (
            <Badge variant={selectedNode.is_active ? 'default' : 'outline'} className="ml-2">
              {selectedNode.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          )}
        </CardTitle>
        {selectedNode && (
          <CardDescription className="text-sm text-muted-foreground">
            ID: {selectedNode.id}
          </CardDescription>
        )}
      </CardHeader>
      
      <ScrollArea className="h-[500px] px-6">
        {selectedNode ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Beskrivelse</h3>
              <p className="text-sm">{selectedNode.description || 'Ingen beskrivelse tilgjengelig'}</p>
            </div>
            
            <Separator />
            
            {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Avhengigheter</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedNode.dependencies.map((dep, idx) => (
                    <Badge key={idx} variant="secondary">{dep}</Badge>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            )}
            
            {selectedNode.route && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Navigasjon</h3>
                <code className="text-xs bg-slate-100 p-1 rounded">{selectedNode.route}</code>
                <Separator className="mt-4" />
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Systeminfo</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">Opprettet:</span>
                <span>{selectedNode.created_at ? new Date(selectedNode.created_at).toLocaleDateString() : 'Ukjent'}</span>
                
                <span className="text-muted-foreground">Sist oppdatert:</span>
                <span>{selectedNode.updated_at ? new Date(selectedNode.updated_at).toLocaleDateString() : 'Ukjent'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground italic">
              Velg en modul fra kartet for å se detaljer
            </p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
