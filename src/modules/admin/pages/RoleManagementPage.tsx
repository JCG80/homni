import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  account_type: 'member' | 'company' | 'admin' | 'master_admin';
  internal_admin: boolean;
  module_access: string[];
  last_sign_in_at?: string;
  created_at?: string;
}

const RoleManagementPage: React.FC = () => {
  const { isMasterAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('members');

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles' as any)
        .select('*');
      
      if (error) throw error;
      return data as unknown as User[];
    },
  });

  // Group users by role
  const members = users?.filter(user => user.account_type === 'member') || [];
  const companies = users?.filter(user => user.account_type === 'company') || [];

  // Function to update user modules
  const updateUserModules = async (userId: string, modules: string[]) => {
    try {
      const { error } = await supabase
        .from('user_profiles' as any)
        .update({ module_access: modules })
        .eq('id', userId);
      
      if (error) throw error;
      toast({
        title: "Moduler oppdatert",
        description: "Brukerens moduler har blitt oppdatert",
        variant: "success" as any,
      });
    } catch (err) {
      console.error('Error updating user modules:', err);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere brukerens moduler",
        variant: "destructive",
      });
    }
  };

  // Handle error display
  useEffect(() => {
    if (error) {
      toast({
        title: "Feil ved henting av brukere",
        description: error instanceof Error ? error.message : "Ukjent feil",
        variant: "destructive",
      });
    }
  }, [error]);

  if (!isMasterAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ingen tilgang</h1>
        <p>Du har ikke tilgang til denne siden.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Rolleadministrasjon</h1>
      
      <AdminNavigation />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="members">Medlemmer</TabsTrigger>
          <TabsTrigger value="companies">Bedrifter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medlemsoversikt</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">E-post</th>
                        <th className="text-left p-2">Navn</th>
                        <th className="text-left p-2">Registrert</th>
                        <th className="text-left p-2">Siste pålogging</th>
                        <th className="text-left p-2">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length > 0 ? (
                        members.map(user => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{/* TODO: Add name field */}</td>
                            <td className="p-2">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-2">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-2">
                              <button className="text-primary hover:underline">Tilbakestill passord</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">Ingen medlemmer funnet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bedriftsoversikt</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">E-post</th>
                        <th className="text-left p-2">Bedriftsnavn</th>
                        <th className="text-left p-2">Moduler</th>
                        <th className="text-left p-2">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.length > 0 ? (
                        companies.map(company => (
                          <tr key={company.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{company.email}</td>
                            <td className="p-2">{/* TODO: Add company name field */}</td>
                            <td className="p-2">
                              {/* TODO: Sett inn modul-tilgangs-UI her */}
                              <div className="space-x-1">
                                {company.module_access?.map((module, idx) => (
                                  <span key={idx} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                    {module}
                                  </span>
                                ))}
                                {(!company.module_access || company.module_access.length === 0) && (
                                  <span className="text-muted-foreground">Ingen moduler</span>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <button 
                                className="text-primary hover:underline mr-2"
                                onClick={() => {
                                  // Example function to update modules
                                  const modules = prompt("Angi moduler (kommaseparert)", company.module_access?.join(','))?.split(',');
                                  if (modules) {
                                    updateUserModules(company.id, modules);
                                  }
                                }}
                              >
                                Endre moduler
                              </button>
                              <button className="text-primary hover:underline">
                                Tilbakestill passord
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">Ingen bedrifter funnet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleManagementPage;
