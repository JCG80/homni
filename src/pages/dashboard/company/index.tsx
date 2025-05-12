
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { canAccessModule } from '@/modules/auth/utils/roles/guards';
import { Navigate } from 'react-router-dom';
import { BarChart, FileText, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CompanyDashboard: React.FC = () => {
  const { user, profile, role } = useAuth();
  
  // Check if user has company role
  if (role !== 'company') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <DashboardLayout title={`Firmaportal - ${profile?.full_name || 'Bedrift'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mine leads Widget */}
        {canAccessModule(role, 'lead_management') && (
          <DashboardWidget title="Mine leads">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Kundeforespørsler</h3>
                <p className="text-sm text-muted-foreground">Oversikt over dine aktive kundeforespørsler</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-xs text-muted-foreground">Nye</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-xs text-muted-foreground">Åpne</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded">
                  <div className="text-xs text-muted-foreground">Vunnet</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-xs text-muted-foreground">Tapt</div>
                  <div className="text-xl font-bold">0</div>
                </div>
              </div>
              <Link to="/leads">
                <Button variant="outline" size="sm" className="w-full">Se alle leads</Button>
              </Link>
            </div>
            {/* Example query commented out:
            // const { data: leadsData, error } = await supabase
            //   .from('leads')
            //   .select('id, status, created_at')
            //   .eq('company_id', profile?.company_id);
            //
            // const stats = {
            //   new: leadsData?.filter(l => l.status === 'new').length || 0,
            //   open: leadsData?.filter(l => l.status === 'in_progress').length || 0,
            //   won: leadsData?.filter(l => l.status === 'won').length || 0,
            //   lost: leadsData?.filter(l => l.status === 'lost').length || 0
            // };
            */}
          </DashboardWidget>
        )}

        {/* Lead-marked Widget */}
        {canAccessModule(role, 'lead_marketplace') && (
          <DashboardWidget title="Lead-marked">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Tilgjengelige forespørsler</h3>
                <p className="text-sm text-muted-foreground">Kjøp leads og utforsk markedsmuligheter</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-muted-foreground mb-4">Utforsk leads tilgjengelig for kjøp</div>
              <Link to="/lead-marketplace">
                <Button variant="outline" size="sm" className="w-full">Åpne lead-marked</Button>
              </Link>
            </div>
            {/* Example query commented out:
            // const { data: marketplaceData, error } = await supabase
            //   .from('marketplace_leads')
            //   .select('*')
            //   .eq('is_available', true)
            //   .limit(5);
            */}
          </DashboardWidget>
        )}
        
        {/* Statistikk Widget */}
        {canAccessModule(role, 'analytics') && (
          <DashboardWidget title="Statistikk">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Konvertering og responstid</h3>
                <p className="text-sm text-muted-foreground">Innsikt i din bedrifts prestasjoner</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Konverteringsrate:</span>
                <span className="text-sm">0%</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium">Gjennomsnittlig responstid:</span>
                <span className="text-sm">- timer</span>
              </div>
              <Link to="/analytics">
                <Button variant="outline" size="sm" className="w-full">Se detaljert statistikk</Button>
              </Link>
            </div>
            {/* Example query commented out:
            // const { data: statsData, error } = await supabase
            //   .rpc('get_company_stats', { company_id: profile?.company_id });
            // 
            // const conversionRate = statsData?.conversion_rate || 0;
            // const responseTime = statsData?.avg_response_time || 0;
            */}
          </DashboardWidget>
        )}
        
        {/* Annonse-eksponering Widget */}
        {canAccessModule(role, 'ad_exposure') && (
          <DashboardWidget title="Annonse-eksponering">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Kjøpte plasseringer</h3>
                <p className="text-sm text-muted-foreground">Oversikt over visninger og klikk</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Totale visninger:</span>
                <span className="text-sm">0</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Totale klikk:</span>
                <span className="text-sm">0</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium">Klikk-rate:</span>
                <span className="text-sm">0%</span>
              </div>
              <Link to="/ad-analytics">
                <Button variant="outline" size="sm" className="w-full">Se annonsedetaljer</Button>
              </Link>
            </div>
            {/* Example query commented out:
            // const { data: adData, error } = await supabase
            //   .from('ad_analytics')
            //   .select('impressions, clicks')
            //   .eq('company_id', profile?.company_id)
            //   .single();
            // 
            // const impressions = adData?.impressions || 0;
            // const clicks = adData?.clicks || 0;
            // const clickRate = impressions > 0 ? Math.round((clicks / impressions) * 100) : 0;
            */}
          </DashboardWidget>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
