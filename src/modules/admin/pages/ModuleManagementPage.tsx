import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Package, 
  Trash2, 
  Settings, 
  Users, 
  Activity,
  Loader2,
  Database,
  CheckCircle,
  XCircle,
  GitBranch,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SystemModule {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleDependency {
  module_id: string;
  dependency_id: string;
  dependency_name: string;
}

interface CreateModuleData {
  name: string;
  description: string;
  route: string;
  icon: string;
  category: string;
  sort_order: number;
}

export const ModuleManagementPage: React.FC = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [dependencies, setDependencies] = useState<ModuleDependency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newModule, setNewModule] = useState<CreateModuleData>({
    name: '',
    description: '',
    route: '',
    icon: 'Package',
    category: 'core',
    sort_order: 0
  });

  const categories = ['core', 'admin', 'company', 'content', 'analytics', 'integration'];
  const iconOptions = ['Package', 'Database', 'Users', 'Settings', 'Activity', 'BarChart', 'FileText', 'Building'];

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('system_modules')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (modulesError) throw modulesError;

      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system modules",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = async (moduleId: string, currentState: boolean) => {
    setUpdatingModule(moduleId);
    
    try {
      const { error } = await supabase
        .from('system_modules')
        .update({ is_active: !currentState })
        .eq('id', moduleId);
      
      if (error) throw error;
      
      // Update local state
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, is_active: !currentState }
          : module
      ));
      
      toast({
        title: "Module updated",
        description: `Module has been ${!currentState ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      console.error('Error updating module:', err);
      toast({
        title: "Update failed",
        description: "There was an error updating the module",
        variant: "destructive"
      });
    } finally {
      setUpdatingModule(null);
    }
  };

  const handleCreateModule = async () => {
    if (!newModule.name.trim() || !newModule.route.trim()) {
      toast({
        title: "Invalid input",
        description: "Module name and route are required",
        variant: "destructive"
      });
      return;
    }

    setCreateLoading(true);
    
    try {
      const { error } = await supabase
        .from('system_modules')
        .insert({
          name: newModule.name.trim(),
          description: newModule.description.trim() || null,
          route: newModule.route.trim(),
          icon: newModule.icon,
          category: newModule.category,
          sort_order: newModule.sort_order,
          is_active: true
        });
      
      if (error) throw error;
      
      toast({
        title: "Module created",
        description: `System module "${newModule.name}" has been created`,
      });
      
      setShowCreateDialog(false);
      setNewModule({
        name: '',
        description: '',
        route: '',
        icon: 'Package',
        category: 'core',
        sort_order: 0
      });
      
      // Refresh modules list
      fetchModules();
    } catch (err) {
      console.error('Error creating module:', err);
      toast({
        title: "Creation failed",
        description: "There was an error creating the module",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleName: string) => {
    if (!confirm(`Are you sure you want to delete the module "${moduleName}"? This action cannot be undone and may affect user access.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('system_modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
      
      // Update local state
      setModules(prev => prev.filter(module => module.id !== moduleId));
      
      toast({
        title: "Module deleted",
        description: `System module "${moduleName}" has been deleted`,
      });
    } catch (err) {
      console.error('Error deleting module:', err);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the module",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading system modules...</span>
      </div>
    );
  }

  const activeModules = modules.filter(m => m.is_active).length;
  const totalModules = modules.length;
  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, SystemModule[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">Configure and manage system modules and user access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create System Module</DialogTitle>
              <DialogDescription>
                Create a new system module to extend platform functionality.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Lead Management"
                    value={newModule.name}
                    onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    placeholder="e.g. /leads"
                    value={newModule.route}
                    onChange={(e) => setNewModule(prev => ({ ...prev, route: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of module functionality"
                  value={newModule.description}
                  onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newModule.category}
                    onChange={(e) => setNewModule(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newModule.icon}
                    onChange={(e) => setNewModule(prev => ({ ...prev, icon: e.target.value }))}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    value={newModule.sort_order}
                    onChange={(e) => setNewModule(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateModule} disabled={createLoading}>
                {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground">System modules configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModules}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules - activeModules}</div>
            <p className="text-xs text-muted-foreground">Currently disabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(modulesByCategory).length}</div>
            <p className="text-xs text-muted-foreground">Module categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules by Category */}
      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <Database className="h-5 w-5" />
              {category} Modules
            </CardTitle>
            <CardDescription>
              {categoryModules.length} modules in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryModules.map((module) => (
                <div key={module.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{module.name}</h3>
                        <Badge variant={module.is_active ? "default" : "outline"}>
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Route: {module.route}</span>
                        <span>Icon: {module.icon}</span>
                        <span>Order: {module.sort_order}</span>
                        <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {updatingModule === module.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Switch
                            checked={module.is_active}
                            onCheckedChange={() => handleToggleModule(module.id, module.is_active)}
                            disabled={updatingModule !== null}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id, module.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center p-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No System Modules</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first system module</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Module
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};