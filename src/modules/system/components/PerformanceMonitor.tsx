import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

type PerformanceData = {
  timestamp: string;
  responseTime: number;
  active_connections?: number;
};

export const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate collecting performance data
  // In a real app, you would connect to your performance monitoring system
  useEffect(() => {
    const collectPerformanceData = () => {
      const startTime = Date.now();
      
      // Make a simple request to measure response time
      supabase.from('leads').select('count').then(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        setPerformanceData(prev => {
          // Keep last 20 data points for the chart
          const newData = [
            ...prev, 
            { 
              timestamp: new Date().toISOString().substring(11, 19), // HH:MM:SS
              responseTime 
            }
          ].slice(-20);
          
          return newData;
        });
        
        setIsLoading(false);
      }).catch(err => {
        console.error('Error measuring performance:', err);
        setError('Kunne ikke måle ytelse');
        setIsLoading(false);
      });
    };
    
    // Collect initial data
    collectPerformanceData();
    
    // Then collect every 10 seconds
    const interval = setInterval(collectPerformanceData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading && performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ytelsesmonitor</CardTitle>
          <CardDescription>Laster inn ytelsesdata...</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ytelsesmonitor</CardTitle>
          <CardDescription>Det oppstod en feil</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ytelsesmonitor</CardTitle>
        <CardDescription>Responstider for API-kall i millisekunder</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              stroke="#8884d8" 
              name="Responstid (ms)"
              activeDot={{ r: 8 }} 
            />
            {performanceData[0]?.active_connections !== undefined && (
              <Line 
                type="monotone" 
                dataKey="active_connections" 
                stroke="#82ca9d" 
                name="Aktive tilkoblinger"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
