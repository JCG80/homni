
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSystemModules, getModuleDependencies } from '../api/systemModules';
import type { SystemModule } from '../types/systemTypes';
import { 
  SystemTreeVisualization, 
  buildTreeData, 
  TreeNodeData 
} from '../components/map/SystemTreeVisualization';
import { ModuleDetailsPanel } from '../components/map/ModuleDetailsPanel';
import { SystemMapLoading } from '../components/map/SystemMapLoading';
import { SystemMapError } from '../components/map/SystemMapError';

export const SystemMapPage = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<SystemModule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        setLoading(true);
        const modulesData = await getSystemModules();
        setModules(modulesData);
        
        // Build the tree structure
        const tree = buildTreeData(modulesData);
        setTreeData(tree);
      } catch (error) {
        console.error('Failed to load system modules:', error);
        setError('Kunne ikke laste systemmoduler. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, []);

  // Handle node click in the tree
  const handleNodeClick = (nodeData: any) => {
    if (nodeData.data.attributes && nodeData.data.attributes.id) {
      const moduleId = nodeData.data.attributes.id;
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        setSelectedNode(module);
      }
    }
  };

  if (loading) {
    return <SystemMapLoading />;
  }

  if (error) {
    return <SystemMapError error={error} />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Systemkart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[600px] overflow-hidden">
            <CardHeader>
              <CardTitle>Moduloversikt</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SystemTreeVisualization 
                treeData={treeData} 
                onNodeClick={handleNodeClick} 
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <ModuleDetailsPanel selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
};
