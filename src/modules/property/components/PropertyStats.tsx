import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProperties } from '../hooks/useProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Home, DollarSign, FileText, Calendar } from 'lucide-react';

export function PropertyStats() {
  const { properties, isLoading } = useProperties();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProperties = properties?.length || 0;
  const totalValue = properties?.reduce((sum, p) => sum + (p.size || 0) * 50000, 0) || 0; // Estimated value
  
  // Real data for documents and maintenance tasks
  const { data: documentsData } = useQuery({
    queryKey: ['property-documents-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_documents')
        .select('property_id', { count: 'exact' });
      return error ? 0 : data?.length || 0;
    },
    enabled: !!properties?.length
  });
  
  const { data: tasksData } = useQuery({
    queryKey: ['property-maintenance-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_maintenance_tasks')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'in_progress'])
        .gte('due_date', new Date().toISOString().split('T')[0]);
      return error ? 0 : data?.length || 0;
    },
    enabled: !!properties?.length
  });

  const documentsCount = documentsData || 0;
  const upcomingTasks = tasksData || 0;

  const stats = [
    {
      title: 'Totale Eiendommer',
      value: totalProperties,
      description: 'Registrerte eiendommer',
      icon: Home,
    },
    {
      title: 'Estimert Verdi',
      value: `kr ${totalValue.toLocaleString('no-NO')}`,
      description: 'Basert på areal',
      icon: DollarSign,
    },
    {
      title: 'Dokumenter',
      value: documentsCount,
      description: 'Lagrede dokumenter',
      icon: FileText,
    },
    {
      title: 'Vedlikehold',
      value: upcomingTasks,
      description: 'Kommende oppgaver',
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}