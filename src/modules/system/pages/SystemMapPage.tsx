import { useState, useEffect } from 'react';
import { Tree, TreeNode } from 'react-d3-tree';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_MODULES, SystemModule } from '../types/systemModules';
import { getSystemModules, getModuleDependencies } from '../api/systemModules';
import { LayoutDashboard } from 'lucide-react';

interface ModuleNode {
  name: string;
  attributes?: {
    active: boolean;
    description: string;
  };
  children?: ModuleNode[];
}

export const SystemMapPage = () => {
  const [treeData, setTreeData] = useState<ModuleNode | null>(null);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  useEffect(() => {
    const fetchModulesAndBuildTree = async () => {
      try {
        setLoading(true);
        const modules = await getSystemModules();
        
        // Create the system root node
        const rootModule = modules.find(m => m.id === 'system') || 
          { id: 'system', name: 'System', description: 'Systemadministrasjon', active: true };
          
        const rootNode: ModuleNode = {
          name: rootModule.name,
          attributes: {
            active: rootModule.active,
            description: rootModule.description
          },
          children: []
        };
        
        // Add other modules as children
        const otherModules = modules.filter(m => m.id !== 'system');
        for (const module of otherModules) {
          const dependencies = await getModuleDependencies(module.id);
          
          // If no dependencies, add directly to root
          if (dependencies.length === 0) {
            rootNode.children?.push({
              name: module.name,
              attributes: {
                active: module.active,
                description: module.description
              },
              children: []
            });
          }
          // Otherwise handle dependencies (simplified for demo)
          else {
            // This is a simple approach - in a real app you'd build a proper tree
            const dependencyNode = rootNode.children?.find(c => 
              dependencies.some(d => modules.find(m => m.id === d)?.name === c.name)
            );
            
            if (dependencyNode) {
              if (!dependencyNode.children) {
                dependencyNode.children = [];
              }
              
              dependencyNode.children.push({
                name: module.name,
                attributes: {
                  active: module.active,
                  description: module.description
                }
              });
            } else {
              rootNode.children?.push({
                name: module.name,
                attributes: {
                  active: module.active,
                  description: module.description
                }
              });
            }
          }
        }
        
        setTreeData(rootNode);
      } catch (error) {
        console.error('Failed to build module tree:', error);
        
        // Fallback to static module tree
        const fallbackRoot: ModuleNode = {
          name: 'System',
          attributes: {
            active: true,
            description: 'Systemadministrasjon'
          },
          children: ALL_MODULES.filter(m => m.id !== 'system').map(m => ({
            name: m.name,
            attributes: {
              active: m.active,
              description: m.description
            }
          }))
        };
        
        setTreeData(fallbackRoot);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchModulesAndBuildTree();
    }
  }, [authLoading]);
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              <span>Systemkart</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[600px] flex items-center justify-center">
            <div className="space-y-4 w-full">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-2/4 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span>Systemkart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '600px' }}>
            {treeData ? (
              <Tree
                data={treeData}
                orientation="vertical"
                translate={{ x: 400, y: 50 }}
                nodeSize={{ x: 200, y: 100 }}
                renderCustomNodeElement={(nodeProps) => (
                  <g>
                    <circle r={25} 
                      fill={nodeProps.nodeDatum.attributes?.active ? "#22c55e" : "#94a3b8"}
                    />
                    <text 
                      x={30} 
                      y={-10} 
                      style={{ fill: nodeProps.nodeDatum.attributes?.active ? "#000" : "#666" }}
                    >
                      {nodeProps.nodeDatum.name}
                    </text>
                    <text 
                      x={30} 
                      y={10} 
                      style={{ fontSize: '0.8em', fill: "#666" }}
                    >
                      {nodeProps.nodeDatum.attributes?.description.substring(0, 20)}
                      {nodeProps.nodeDatum.attributes?.description.length > 20 ? '...' : ''}
                    </text>
                  </g>
                )}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Kunne ikke laste systemkartet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMapPage;
