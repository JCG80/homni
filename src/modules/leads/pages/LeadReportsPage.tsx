import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LeadStatus } from '../types/types';
import { LoadingIndicator } from '../components/settings/LoadingStates';
import { useLeadsReport } from '../hooks/useLeadsReport';
import _ from 'lodash';

// Import the Lead type from our local types file, not from @/types/leads
import { Lead } from '../types/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const LeadReportsPage = () => {
  const { 
    leads, 
    loading, 
    error 
  } = useLeadsReport();
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!leads || leads.length === 0) {
    return <div>No leads data available.</div>;
  }

  // Group leads by status
  const leadStatusCounts = _.countBy(leads, 'status');
  const leadStatusData = Object.entries(leadStatusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Group leads by category
  const leadCategoryCounts = _.countBy(leads, 'category');
  const leadCategoryData = Object.entries(leadCategoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  // Prepare time series data (last 30 days)
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const leadsByDate = _.groupBy(leads, (lead) => lead.created_at.split('T')[0]);

  const timeSeriesData = last30Days.map(date => ({
    date,
    count: leadsByDate[date]?.length || 0,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Lead Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  isAnimationActive={false}
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {
                    leadStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leads Over Time (Last 30 Days) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Leads Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
