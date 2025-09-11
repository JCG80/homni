import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCcw, Download, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { LeadAnalyticsDashboard } from '../components/analytics/LeadAnalyticsDashboard';

export const LeadAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Mock export functionality
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
  };

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '7d': return 'Siste 7 dager';
      case '30d': return 'Siste 30 dager';
      case '90d': return 'Siste 90 dager';
      case '1y': return 'Siste året';
      default: return 'Valgt periode';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company']}>
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Lead Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Siste 7 dager</SelectItem>
                    <SelectItem value="30d">Siste 30 dager</SelectItem>
                    <SelectItem value="90d">Siste 90 dager</SelectItem>
                    <SelectItem value="1y">Siste året</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Eksporterer...' : 'Eksporter'}
                </Button>
              </div>

              <LeadAnalyticsDashboard 
                timeframe={timeframe}
                className="space-y-6"
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};