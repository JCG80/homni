import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, AlertTriangle } from "lucide-react";

type HealthMetrics = {
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
  active_integrations: number;
  last_24h_errors: number;
};

type RecentLog = {
  id: string;
  integration_name: string;
  request_method: string;
  request_url: string;
  response_status: number | null;
  created_at: string;
  response_time_ms: number | null;
};

export const ApiHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Load health metrics (mock data for preparation)
      const mockMetrics: HealthMetrics = {
        total_requests: 1247,
        success_rate: 98.5,
        avg_response_time: 145,
        active_integrations: 5,
        last_24h_errors: 3
      };
      
      // Load recent logs
      const { data: logs } = await supabase
        .from('api_request_logs')
        .select(`
          id,
          request_method,
          request_url,
          response_status,
          created_at,
          response_time_ms,
          api_integrations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedLogs: RecentLog[] = (logs || []).map(log => ({
        id: log.id,
        integration_name: (log.api_integrations as any)?.name || 'Unknown',
        request_method: log.request_method,
        request_url: log.request_url,
        response_status: log.response_status,
        created_at: log.created_at,
        response_time_ms: log.response_time_ms
      }));

      setMetrics(mockMetrics);
      setRecentLogs(formattedLogs);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale forespørsler</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_requests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Siste 30 dager</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suksessrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.success_rate}%</div>
            <p className="text-xs text-muted-foreground">Siste 24 timer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Snitt responstid</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_response_time}ms</div>
            <p className="text-xs text-muted-foreground">Gjennomsnitt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive integrasjoner</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_integrations}</div>
            <p className="text-xs text-muted-foreground">{metrics.last_24h_errors} feil siste 24t</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent API Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Siste API-aktivitet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen API-aktivitet registrert enda.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center space-x-3">
                    <Badge variant={log.response_status && log.response_status < 400 ? "default" : "destructive"}>
                      {log.request_method}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{log.integration_name}</p>
                      <p className="text-xs text-muted-foreground">{log.request_url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{log.response_status || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{log.response_time_ms || 0}ms</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};