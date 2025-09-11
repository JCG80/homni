import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ConversionData {
  stage: string;
  count: number;
  percentage: number;
}

interface LeadConversionChartProps {
  data: ConversionData[];
}

export const LeadConversionChart: React.FC<LeadConversionChartProps> = ({ data }) => {
  // Color gradient from green to red based on conversion drop
  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--primary))';
    if (percentage >= 60) return '#22c55e';
    if (percentage >= 40) return '#eab308';
    if (percentage >= 20) return '#f97316';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Antall: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Andel: <span className="font-medium text-foreground">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Ingen konverteringsdata tilgjengelig
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="stage" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};