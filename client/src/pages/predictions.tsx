import { Brain, TrendingUp, Target, AlertTriangle, Star, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { StatsCard } from "@/components/stats-card";
import type { GameWithPredictions } from "@shared/schema";

export default function Predictions() {
  const { data: games = [], isLoading } = useQuery<GameWithPredictions[]>({
    queryKey: ['/api/games'],
  });

  const gamesWithPredictions = games.filter(game => game.predictions.length > 0);
  const highConfidenceGames = gamesWithPredictions.filter(game => 
    game.predictions[0] && game.predictions[0].confidence >= 75
  );
  const mediumConfidenceGames = gamesWithPredictions.filter(game => 
    game.predictions[0] && game.predictions[0].confidence >= 50 && game.predictions[0].confidence < 75
  );

  const avgConfidence = gamesWithPredictions.length > 0 
    ? Math.round(gamesWithPredictions.reduce((sum, game) => sum + (game.predictions[0]?.confidence || 0), 0) / gamesWithPredictions.length)
    : 0;

  const avgEdgeScore = gamesWithPredictions.length > 0 
    ? Math.round(gamesWithPredictions.reduce((sum, game) => sum + (game.predictions[0]?.edgeScore || 0), 0) / gamesWithPredictions.length * 10) / 10
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
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
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Predictions
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced machine learning algorithms analyze team performance, player statistics, and historical data to provide intelligent betting recommendations.
          </p>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Predictions"
            value={gamesWithPredictions.length.toString()}
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            iconBgColor="bg-purple-500/10"
            valueColor="text-purple-500"
          />
          <StatsCard
            title="High Confidence"
            value={highConfidenceGames.length.toString()}
            icon={<Target className="h-5 w-5 text-green-500" />}
            iconBgColor="bg-green-500/10"
            valueColor="text-green-500"
          />
          <StatsCard
            title="Avg Confidence"
            value={`${avgConfidence}%`}
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            iconBgColor="bg-blue-500/10"
            valueColor="text-blue-500"
          />
          <StatsCard
            title="Avg Edge Score"
            value={avgEdgeScore.toString()}
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            iconBgColor="bg-yellow-500/10"
            valueColor="text-yellow-500"
          />
        </div>

        {/* Premium Picks */}
        {highConfidenceGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Star className="h-6 w-6 text-gold" />
                <span>Premium Picks</span>
                <Badge className="bg-gradient-to-r from-gold to-yellow-500 text-black">
                  75%+ Confidence
                </Badge>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {highConfidenceGames.slice(0, 4).map((game) => (
                <GameCard key={game.id} game={game} featured />
              ))}
            </div>
          </section>
        )}

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Model Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prediction Accuracy</span>
                    <span className="font-medium">87.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ROI Enhancement</span>
                    <span className="font-medium text-green-600">+15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sharp Money Indicator</span>
                    <span className="font-medium text-blue-600">Strong</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Current Trends</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Home teams performing above expected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">High volatility in NBA totals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">NFL spreads showing value</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Picks */}
        {mediumConfidenceGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-500" />
                <span>Standard Picks</span>
                <Badge variant="secondary">
                  50-74% Confidence
                </Badge>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mediumConfidenceGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* No Predictions State */}
        {gamesWithPredictions.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-2 text-6xl mb-4">
              <Brain className="h-16 w-16 text-purple-500 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
            <p className="text-muted-foreground mb-4">
              Our advanced algorithms are processing the latest data to generate predictions.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-purple-500 to-pink-500">
              Refresh Predictions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}