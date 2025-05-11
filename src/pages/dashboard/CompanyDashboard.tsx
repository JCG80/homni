
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, BarChart3, Newspaper, Building, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface LeadSummary {
  total: number;
  new: number;
  inProgress: number;
}

export const CompanyDashboard: React.FC = () => {
  const { user, profile, module_access = [] } = useAuth();
  const [leadSummary, setLeadSummary] = useState<LeadSummary>({ total: 0, new: 0, inProgress: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeadSummary = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch total leads
        const { data: totalData, error: totalError } = await supabase
          .from('leads')
          .select('count')
          .eq('company_id', profile?.company_id || user.id);
          
        // Fetch new leads
        const { data: newData, error: newError } = await supabase
          .from('leads')
          .select('count')
          .eq('company_id', profile?.company_id || user.id)
          .eq('status', 'new');
          
        // Fetch in progress leads
        const { data: inProgressData, error: inProgressError } = await supabase
          .from('leads')
          .select('count')
          .eq('company_id', profile?.company_id || user.id)
          .eq('status', 'in_progress');
          
        if (totalError || newError || inProgressError) {
          console.error("Error fetching lead summary:", totalError || newError || inProgressError);
          return;
        }
        
        setLeadSummary({
          total: totalData?.[0]?.count || 0,
          new: newData?.[0]?.count || 0,
          inProgress: inProgressData?.[0]?.count || 0,
        });
      } catch (error) {
        console.error("Unexpected error fetching lead summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeadSummary();
  }, [user?.id, profile?.company_id]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Bedriftsdashboard</h1>
          <p className="text-muted-foreground mt-1">Oversikt over dine bedriftsdata og aktiviteter</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Badge variant="outline" className="text-sm px-2 py-1 bg-primary/10">
            {profile?.role || 'company'}
          </Badge>
          {module_access.some(m => m.internal_admin) && (
            <Badge className="bg-blue-500 text-white text-sm px-2 py-1">
              Intern Admin
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 text-primary mr-2" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-medium">{profile?.full_name || user?.email}</h3>
            <p className="text-muted-foreground text-sm mt-1">{profile?.email || user?.email}</p>
            <p className="text-muted-foreground text-sm">{profile?.phone || 'Ingen telefon registrert'}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="pl-0">
              Oppdater profil <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Building className="h-5 w-5 text-primary mr-2" />
              Bedrift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-medium">
              {(profile?.metadata as any)?.company_name || 'Din bedrift'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {(profile?.metadata as any)?.industry || 'Ingen industri spesifisert'}
            </p>
            <p className="text-muted-foreground text-sm">
              ID: {profile?.company_id || 'Ikke tilgjengelig'}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="pl-0">
              Bedriftsinnstillinger <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[80px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Laster...</div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-medium">{leadSummary.total} totalt</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div>
                    <Badge variant="secondary">{leadSummary.new}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Nye</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-blue-50">{leadSummary.inProgress}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">I prosess</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="pl-0">
              Se alle leads <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="h-5 w-5 text-primary mr-2" />
              Mine moduler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {module_access.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {module_access.map((module, index) => (
                  <Badge 
                    key={index} 
                    variant={module.internal_admin ? "default" : "outline"} 
                    className={`
                      flex items-center justify-center px-3 py-1.5 
                      ${module.internal_admin ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-secondary'} 
                      transition-colors
                    `}
                  >
                    {module.system_module_id}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-6 bg-muted/30 rounded-md">
                Ingen moduler aktivert for din konto.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Utforsk tilgjengelige moduler
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Aktivitetssammendrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="font-medium">Siste aktiviteter</h4>
                <Separator className="my-3" />
                <div className="text-muted-foreground text-center py-6">
                  Ingen nylige aktiviteter å vise.
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Se full logg
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
