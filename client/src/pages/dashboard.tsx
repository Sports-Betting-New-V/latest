import { Wallet, TrendingUp, Trophy, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { GameCard } from "@/components/game-card";
import { BetSlip } from "@/components/bet-slip";
import { AnalyticsChart } from "@/components/analytics-chart";
import { useAuth } from "@/hooks/use-auth";
import type { GameWithPredictions, UserStats } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/user/${user?.id}/stats`],
    enabled: !!user,
  });

  const { data: games = [], isLoading: gamesLoading } = useQuery<GameWithPredictions[]>({
    queryKey: ['/api/games'],
  });

  const featuredGames = games.filter(game => game.status === "upcoming").slice(0, 2);
  const moreGames = games.filter(game => game.status === "upcoming").slice(2, 8);

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

  if (gamesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}! Here's your betting overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Current Balance"
            value={formatCurrency(stats?.bankroll)}
            icon={<Wallet className="h-5 w-5 text-success" />}
            iconBgColor="bg-success/10"
            valueColor="text-success"
          />
          <StatsCard
            title="Total Profit/Loss"
            value={formatCurrency(stats?.totalProfit)}
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            iconBgColor="bg-success/10"
            valueColor={parseFloat(stats?.totalProfit || "0") >= 0 ? "text-success" : "text-destructive"}
          />
          <StatsCard
            title="Win Rate"
            value={formatPercentage(stats?.winRate)}
            icon={<Trophy className="h-5 w-5 text-primary" />}
            iconBgColor="bg-primary/10"
            valueColor="text-primary"
          />
          <StatsCard
            title="ROI"
            value={formatPercentage(stats?.roi)}
            icon={<Percent className="h-5 w-5 text-gold" />}
            iconBgColor="bg-gold/10"
            valueColor="text-gold"
          />
        </div>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Games</h2>
              <div className="flex items-center space-x-2 bg-gold/10 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 bg-gold rounded-full"></span>
                <span className="text-gold text-sm font-medium">AI Powered</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} featured />
              ))}
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics Chart */}
          <div className="lg:col-span-2">
            <AnalyticsChart 
              title="Bankroll Performance" 
              type="line"
            />
          </div>

          {/* Recent Bets */}
          <div>
            <BetSlip />
          </div>
        </div>

        {/* More Games */}
        {moreGames.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">More Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {moreGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No Games Available</h3>
            <p className="text-muted-foreground">
              Check back soon for upcoming games and betting opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
