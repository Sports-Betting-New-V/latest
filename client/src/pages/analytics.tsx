import { BarChart3, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Percent, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/stats-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { useAuth } from "@/hooks/use-auth";
import type { UserStats, BetWithGame } from "@shared/schema";

export default function Analytics() {
  const { user } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/user/${user?.id}/stats`],
    enabled: !!user,
  });

  const { data: bets = [] } = useQuery<BetWithGame[]>({
    queryKey: [`/api/user/${user?.id}/bets`],
    enabled: !!user,
  });

  const formatCurrency = (value: string | undefined) => {
    if (!value) return "$0.00";
    return parseFloat(value).toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercentage = (value: string | undefined) => {
    if (!value) return "0.00%";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  // Generate mock time series data for charts
  const generateTimeSeriesData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    let currentBalance = 10000;
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add some realistic variance
      const dailyChange = (Math.random() - 0.5) * 200;
      currentBalance += dailyChange;
      
      data.push({
        date: date.toISOString().split('T')[0],
        balance: Math.round(currentBalance),
        profit: Math.round(currentBalance - 10000),
        bets: Math.floor(Math.random() * 5) + 1,
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Analyze betting patterns
  const betsByType = bets.reduce((acc, bet) => {
    acc[bet.betType] = (acc[bet.betType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const betsBySport = bets.reduce((acc, bet) => {
    acc[bet.game.sport] = (acc[bet.game.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentBets = bets.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your betting performance, analyze patterns, and optimize your strategy with detailed insights.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Current Balance"
            value={formatCurrency(stats?.bankroll)}
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            iconBgColor="bg-green-500/10"
            valueColor="text-green-500"
          />
          <StatsCard
            title="Total Profit/Loss"
            value={formatCurrency(stats?.totalProfit)}
            icon={
              parseFloat(stats?.totalProfit || "0") >= 0 
                ? <TrendingUp className="h-5 w-5 text-green-500" />
                : <TrendingDown className="h-5 w-5 text-red-500" />
            }
            iconBgColor={
              parseFloat(stats?.totalProfit || "0") >= 0 
                ? "bg-green-500/10"
                : "bg-red-500/10"
            }
            valueColor={
              parseFloat(stats?.totalProfit || "0") >= 0 
                ? "text-green-500"
                : "text-red-500"
            }
          />
          <StatsCard
            title="Win Rate"
            value={formatPercentage(stats?.winRate)}
            icon={<Target className="h-5 w-5 text-blue-500" />}
            iconBgColor="bg-blue-500/10"
            valueColor="text-blue-500"
          />
          <StatsCard
            title="Return on Investment"
            value={formatPercentage(stats?.roi)}
            icon={<Percent className="h-5 w-5 text-purple-500" />}
            iconBgColor="bg-purple-500/10"
            valueColor="text-purple-500"
          />
        </div>

        {/* Performance Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-blue-600">{stats?.totalBets || 0}</div>
                <div className="text-sm text-muted-foreground">Total Bets</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">{stats?.wonBets || 0}</div>
                <div className="text-sm text-muted-foreground">Won Bets</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-red-600">{stats?.lostBets || 0}</div>
                <div className="text-sm text-muted-foreground">Lost Bets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Analysis */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="patterns">Betting Patterns</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart 
                title="Bankroll Performance (30 Days)" 
                data={timeSeriesData}
                type="line"
              />
              <AnalyticsChart 
                title="Daily Profit/Loss" 
                data={timeSeriesData}
                type="bar"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bet Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(betsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(count / Math.max(...Object.values(betsByType))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sports Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(betsBySport).map(([sport, count]) => (
                      <div key={sport} className="flex items-center justify-between">
                        <span>{sport}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(count / Math.max(...Object.values(betsBySport))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Day</span>
                      <Badge variant="secondary">Saturday</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Worst Day</span>
                      <Badge variant="outline">Tuesday</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Bets/Day</span>
                      <span className="font-medium">3.2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Streak Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Streak</span>
                      <Badge className="bg-green-500">3W</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Streak</span>
                      <Badge className="bg-green-600">7W</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Worst Streak</span>
                      <Badge variant="destructive">4L</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Level</span>
                      <Badge className="bg-yellow-500">Moderate</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Bet Size</span>
                      <span className="font-medium">$125</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Max Bet Size</span>
                      <span className="font-medium">$500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBets.length > 0 ? (
              <div className="space-y-4">
                {recentBets.map((bet, index) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{bet.game.sport === 'NBA' ? '🏀' : bet.game.sport === 'NFL' ? '🏈' : bet.game.sport === 'MLB' ? '⚾' : '🏒'}</div>
                      <div>
                        <p className="font-medium">{bet.game.awayTeam} @ {bet.game.homeTeam}</p>
                        <p className="text-sm text-muted-foreground">
                          {bet.betType} - {bet.betSelection}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(bet.amount)}</p>
                      <Badge 
                        variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                        className={bet.status === 'won' ? 'bg-green-500' : ''}
                      >
                        {bet.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent betting activity to display.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}