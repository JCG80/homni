
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lead } from '@/types/leads';
import _ from 'lodash';

// Types for the aggregated data
interface StatusCount {
  status: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const LeadReportsPage = () => {
  const { isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch all leads and compute aggregations client-side 
        const { data: allLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
        
        if (leadsError) throw leadsError;
        
        if (allLeads && allLeads.length > 0) {
          // Process status counts using lodash
          const statusGroups = _.groupBy(allLeads, 'status');
          const statusData: StatusCount[] = Object.entries(statusGroups).map(([status, leads]) => ({
            status,
            count: leads.length
          }));
          
          // Process category counts using lodash
          const categoryGroups = _.groupBy(allLeads, 'category');
          const categoryData: CategoryCount[] = Object.entries(categoryGroups).map(([category, leads]) => ({
            category,
            count: leads.length
          }));
          
          setStatusCounts(statusData);
          setCategoryCounts(categoryData);
          
          // Process time series data
          const dateCountMap: Record<string, number> = {};
          
          // Initialize with zero count for each day in the last 30 days
          for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dateCountMap[dateStr] = 0;
          }
          
          // Count leads per day using lodash
          allLeads.forEach((lead: any) => {
            const date = new Date(lead.created_at).toISOString().split('T')[0];
            if (dateCountMap[date] !== undefined) {
              dateCountMap[date]++;
            }
          });
          
          // Convert to array and sort by date
          const timeSeriesArray = Object.entries(dateCountMap).map(([date, count]) => ({
            date,
            count
          })).sort((a, b) => a.date.localeCompare(b.date));
          
          setTimeSeriesData(timeSeriesArray);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (!isLoading && !loading) {
      fetchReportData();
    }
  }, [isLoading, loading]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lederrapporter</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads etter status</CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : statusCounts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8">Ingen data tilgjengelig</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads etter kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : categoryCounts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryCounts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="count"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8">Ingen data tilgjengelig</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Leads over tid (siste 30 dager)</CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : timeSeriesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Antall leads" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8">Ingen data tilgjengelig</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
