
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SystemModule } from '../../types/systemTypes';

interface ModuleDetailsPanelProps {
  selectedNode: SystemModule | null;
}

export const ModuleDetailsPanel = ({ selectedNode }: ModuleDetailsPanelProps) => {
  return (
    <Card className="h-[600px] overflow-auto">
      <CardHeader>
        <CardTitle>
          {selectedNode ? selectedNode.name : 'Moduldetaljer'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedNode ? (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">ID</h3>
              <p>{selectedNode.id}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Beskrivelse</h3>
              <p>{selectedNode.description}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge variant={selectedNode.is_active ? 'default' : 'outline'}>
                {selectedNode.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>

            {/* Only show dependencies if they exist */}
            {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Avhengigheter</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNode.dependencies.map((dep, idx) => (
                    <Badge key={idx} variant="outline">{dep}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {selectedNode.route && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Navigasjon</h3>
                <p>{selectedNode.route}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Velg en modul fra kartet for å se detaljer
          </p>
        )}
      </CardContent>
    </Card>
  );
};
