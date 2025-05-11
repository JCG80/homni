
import React, { useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSystemModules, getModuleDependencies } from '../api/systemModules';
import { SystemModule } from '../types/systemModules';

// Define the node structure for the D3 tree
interface TreeNodeData {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNodeData[];
}

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
        if (modulesData.length > 0) {
          const rootNode: TreeNodeData = {
            name: 'System',
            children: []
          };

          // Add all modules to the tree
          modulesData.forEach(module => {
            if (module.is_active) {
              rootNode.children?.push({
                name: module.name,
                attributes: {
                  id: module.id,
                  description: module.description
                },
                children: []
              });
            }
          });

          // For now, we'll skip the dependencies processing since it's not fully implemented
          setTreeData(rootNode);
        }
      } catch (error) {
        console.error('Failed to load system modules:', error);
        setError('Kunne ikke laste systemmoduler. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, []);

  // Helper function to find a node by ID in the tree structure
  const findNodeById = (node: TreeNodeData, id: string): TreeNodeData | null => {
    if (node.attributes && node.attributes.id === id) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }

    return null;
  };

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

  // Custom node component for the tree
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isRoot = nodeDatum.name === 'System';
    const isDependency = nodeDatum.attributes?.dependency === 'true';
    
    return (
      <g>
        <circle 
          r={isRoot ? 25 : 20}
          fill={isRoot ? '#4f46e5' : isDependency ? '#d97706' : '#10b981'}
          onClick={toggleNode}
        />
        <text
          fill="white"
          x={0}
          y={0}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={12}
          style={{ pointerEvents: 'none' }}
        >
          {typeof nodeDatum.name === 'string' && nodeDatum.name.length > 10 
            ? `${nodeDatum.name.substring(0, 10)}...` 
            : nodeDatum.name}
        </text>
        <text
          fill="black"
          x={0}
          y={isRoot ? 40 : 35}
          textAnchor="middle"
          fontSize={11}
        >
          {nodeDatum.attributes?.id || ''}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster systemkart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
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
              {treeData ? (
                <div className="w-full h-[500px]">
                  <Tree 
                    data={treeData} 
                    orientation="vertical"
                    onNodeClick={handleNodeClick}
                    renderCustomNodeElement={renderCustomNodeElement}
                    translate={{ x: 300, y: 50 }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px]">
                  <p>Ingen moduldata tilgjengelig</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
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
        </div>
      </div>
    </div>
  );
};
