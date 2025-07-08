import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
}

export function StatsCard({ title, value, icon, iconBgColor, valueColor = "text-foreground" }: StatsCardProps) {
  return (
    <Card className="stats-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconBgColor} floating-animation`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
