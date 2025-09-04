/**
 * Admin Dashboard Component
 * Provides administrative overview and controls
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminLeadsData } from '@/hooks/useLeadsData';
import { BarChart, Users, TrendingUp, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { stats, loading } = useAdminLeadsData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Totale Leads',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Dagens Leads',
      value: stats.todayCount,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Konverteringsrate',
      value: `${stats.conversionRate}%`,
      icon: BarChart,
      color: 'text-purple-600'
    },
    {
      title: 'Gjennomsnittlig Verdi',
      value: `${stats.averageValue.toLocaleString('no-NO')} kr`,
      icon: AlertCircle,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status Oversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {status === 'new' && 'Nye'}
                  {status === 'qualified' && 'Kvalifiserte'}
                  {status === 'contacted' && 'Kontaktet'}
                  {status === 'negotiating' && 'Forhandling'}
                  {status === 'converted' && 'Konvertert'}
                  {status === 'lost' && 'Tapt'}
                  {status === 'paused' && 'Pauset'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};