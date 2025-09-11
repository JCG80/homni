import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface SourceData {
  source: string;
  count: number;
  value: number;
}

interface LeadSourceChartProps {
  data: SourceData[];
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
  const COLORS = [
    'hsl(var(--primary))',
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#f97316'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.source}</p>
          <p className="text-sm text-muted-foreground">
            Leads: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Verdi: <span className="font-medium text-foreground">{data.value.toLocaleString('no-NO')} kr</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Ingen kildedata tilgjengelig
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value, entry: any) => (
              <span className="text-foreground">
                {value} ({entry.payload.count})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};