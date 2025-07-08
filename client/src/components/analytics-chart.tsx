import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsChartProps {
  title: string;
  data?: any[];
  type?: "line" | "bar";
}

export function AnalyticsChart({ title, data = [], type = "line" }: AnalyticsChartProps) {
  // Generate sample data if none provided
  const sampleData = data.length > 0 ? data : [
    { name: 'Week 1', balance: 10000, profit: 0, bets: 5 },
    { name: 'Week 2', balance: 10350, profit: 350, bets: 8 },
    { name: 'Week 3', balance: 9800, profit: -200, bets: 6 },
    { name: 'Week 4', balance: 10650, profit: 650, bets: 12 },
    { name: 'Week 5', balance: 11200, profit: 1200, bets: 9 },
    { name: 'Week 6', balance: 10950, profit: 950, bets: 7 },
    { name: 'Week 7', balance: 11800, profit: 1800, bets: 11 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="sports-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          {type === "line" ? (
            <Activity className="h-5 w-5 text-blue-500" />
          ) : (
            <BarChart3 className="h-5 w-5 text-green-500" />
          )}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'balance' ? formatCurrency(value) : 
                    name === 'profit' ? formatCurrency(value) : value,
                    name === 'balance' ? 'Balance' :
                    name === 'profit' ? 'Profit' : 'Bets'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(207, 90%, 54%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(207, 90%, 54%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(207, 90%, 54%)', strokeWidth: 2, fill: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Profit/Loss']}
                />
                <Bar 
                  dataKey="profit" 
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
