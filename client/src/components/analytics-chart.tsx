import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

interface AnalyticsChartProps {
  title: string;
  data?: any[];
  type?: "line" | "bar";
}

export function AnalyticsChart({ title, data = [], type = "line" }: AnalyticsChartProps) {
  // Placeholder chart component - in a real app you'd use recharts or similar
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-blue/10 rounded-lg border border-primary/10">
          <div className="text-center space-y-3">
            {type === "line" ? (
              <TrendingUp className="h-12 w-12 text-primary mx-auto" />
            ) : (
              <BarChart3 className="h-12 w-12 text-primary mx-auto" />
            )}
            <div className="space-y-1">
              <p className="text-lg font-medium">Interactive Chart</p>
              <p className="text-sm text-muted-foreground">
                {title} visualization would appear here
              </p>
              <p className="text-xs text-muted-foreground">
                Integration with chart library (Recharts) available
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
