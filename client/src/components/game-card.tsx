import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Calendar, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { GameWithPredictions } from "@shared/schema";

interface GameCardProps {
  game: GameWithPredictions;
  featured?: boolean;
}

const sportIcons: Record<string, string> = {
  NBA: "🏀",
  NFL: "🏈", 
  MLB: "⚾",
  NHL: "🏒",
};

const sportColors: Record<string, string> = {
  NBA: "from-orange-500 via-red-500 to-purple-600",
  NFL: "from-green-500 via-emerald-500 to-teal-600",
  MLB: "from-blue-500 via-indigo-500 to-purple-600", 
  NHL: "from-gray-500 via-slate-500 to-blue-600",
};

const getTeamLogo = (team: string) => {
  const logos: Record<string, string> = {
    // NBA
    "Lakers": "LAL",
    "Warriors": "GSW",
    "Celtics": "BOS",
    "Heat": "MIA",
    // NFL
    "Chiefs": "KC",
    "Bills": "BUF",
    // NHL
    "Rangers": "NYR",
    "Bruins": "BOS",
    // MLB
    "Yankees": "NYY",
    "Red Sox": "BOS",
  };
  return logos[team] || team.substring(0, 3).toUpperCase();
};

export function GameCard({ game, featured = false }: GameCardProps) {
  const { user } = useAuth();
  const [selectedBet, setSelectedBet] = useState<{
    type: string;
    selection: string;
    odds: number;
  } | null>(null);
  const [betAmount, setBetAmount] = useState<string>("100");
  const queryClient = useQueryClient();

  const prediction = game.predictions[0];

  const simulateGameMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${game.id}/simulate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id}/stats`] });
    },
  });

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      await apiRequest("POST", "/api/bets", betData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id}/stats`] });
      setSelectedBet(null);
      setBetAmount("100");
    },
  });

  const formatTime = (date: Date | string) => {
    const gameDate = new Date(date);
    return gameDate.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const calculatePayout = (amount: number, odds: number) => {
    if (odds > 0) {
      return amount * (odds / 100);
    } else {
      return amount * (100 / Math.abs(odds));
    }
  };

  const handleBetSelection = (type: string, selection: string, odds: number) => {
    setSelectedBet({ type, selection, odds });
  };

  const handlePlaceBet = async () => {
    if (!selectedBet || !user) return;

    const amount = parseFloat(betAmount);
    const potentialWin = calculatePayout(amount, selectedBet.odds);

    await placeBetMutation.mutateAsync({
      userId: user.id,
      gameId: game.id,
      betType: selectedBet.type,
      betSelection: selectedBet.selection,
      amount: amount.toFixed(2),
      odds: selectedBet.odds,
      potentialWin: potentialWin.toFixed(2),
    });
  };

  const getBetButtons = () => {
    const buttons = [];

    // Spread
    if (game.spread) {
      buttons.push(
        <div
          key="spread-home"
          className={`betting-odds ${selectedBet?.type === "spread" && selectedBet.selection.includes(game.homeTeam) ? "selected" : ""}`}
          onClick={() => handleBetSelection("spread", `${game.homeTeam} ${game.homeSpread}`, game.homeMoneyline || -110)}
        >
          <div className="text-center relative z-10">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Spread</p>
            <p className="font-bold text-lg">{getTeamLogo(game.homeTeam)} {game.homeSpread}</p>
            <p className="text-xs font-medium">{formatOdds(game.homeMoneyline || -110)}</p>
          </div>
        </div>
      );
    }

    // Moneyline
    if (game.moneylineHome && game.moneylineAway) {
      buttons.push(
        <Button
          key="moneyline-home"
          variant={selectedBet?.type === "moneyline" && selectedBet.selection.includes(game.homeTeam) ? "default" : "outline"}
          className="flex-1 h-auto py-3 px-2"
          onClick={() => handleBetSelection("moneyline", `${game.homeTeam} ML`, game.moneylineHome || 100)}
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Moneyline</p>
            <p className="font-bold">{game.homeTeam.substring(0, 3)}</p>
            <p className="text-xs">{formatOdds(game.moneylineHome || 100)}</p>
          </div>
        </Button>
      );
    }

    // Total
    if (game.total) {
      buttons.push(
        <div
          key="total-over"
          className={`betting-odds ${selectedBet?.type === "total" && selectedBet.selection.includes("Over") ? "selected" : ""}`}
          onClick={() => handleBetSelection("total", `Over ${game.overUnder}`, game.overOdds || -110)}
        >
          <div className="text-center relative z-10">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total</p>
            <p className="font-bold text-lg">O {game.overUnder}</p>
            <p className="text-xs font-medium">{formatOdds(game.overOdds || -110)}</p>
          </div>
        </div>
      );
    }

    return buttons.slice(0, 3); // Show max 3 buttons
  };

  return (
    <Card className={`sports-card ${featured ? "lg:col-span-1 neon-glow" : ""}`}>
      {featured && (
        <div className={`game-card-header relative h-48 bg-gradient-to-r ${sportColors[game.sport]} rounded-t-xl overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="flex items-center justify-center space-x-8 mb-4">
                <div className="text-center">
                  <div className="team-logo mb-2 bounce-slow">
                    <span className="text-sm font-bold">{getTeamLogo(game.awayTeam)}</span>
                  </div>
                  <p className="font-bold text-lg">{game.awayTeam}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text animate-pulse">VS</div>
                  <div className="sport-icon mt-2">
                    <span className="text-lg">{sportIcons[game.sport]}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="team-logo mb-2 bounce-slow" style={{ animationDelay: '0.5s' }}>
                    <span className="text-sm font-bold">{getTeamLogo(game.homeTeam)}</span>
                  </div>
                  <p className="font-bold text-lg">{game.homeTeam}</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm opacity-75">
                <Calendar className="h-4 w-4" />
                <span>{formatTime(game.gameTime)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <CardHeader className={!featured ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!featured && (
              <div className="sport-icon">
                <span className="text-xl">{sportIcons[game.sport]}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">
                {game.awayTeam} @ {game.homeTeam}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatTime(game.gameTime)}</span>
              </div>
            </div>
          </div>
          
          {prediction && (
            <Badge variant="secondary" className="bg-gold text-gold-foreground">
              AI Edge: {prediction.edgeScore}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Betting Options */}
        <div className="grid grid-cols-3 gap-2">
          {getBetButtons()}
        </div>

        {/* AI Recommendation */}
        {prediction && (
          <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-gold mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gold mb-1">AI Recommendation</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {prediction.recommendedBet} - Confidence: {prediction.confidence}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {prediction.reasoning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Bet & Place Bet */}
        {selectedBet && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedBet.selection}</span>
              <span className="text-muted-foreground">{formatOdds(selectedBet.odds)}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Bet Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-background"
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Potential Win
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="text"
                    value={calculatePayout(parseFloat(betAmount) || 0, selectedBet.odds).toFixed(2)}
                    readOnly
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-muted"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Total Return
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="text"
                    value={(parseFloat(betAmount) + calculatePayout(parseFloat(betAmount) || 0, selectedBet.odds)).toFixed(2)}
                    readOnly
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handlePlaceBet}
                disabled={placeBetMutation.isPending || !betAmount || parseFloat(betAmount) <= 0}
                className="flex-1"
              >
                {placeBetMutation.isPending ? "Placing..." : "Place Bet"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedBet(null)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Demo Controls */}
        {game.status === "upcoming" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateGameMutation.mutate()}
            disabled={simulateGameMutation.isPending}
            className="w-full"
          >
            {simulateGameMutation.isPending ? "Simulating..." : "Simulate Game (Demo)"}
          </Button>
        )}

        {game.status === "completed" && game.homeScore !== null && game.awayScore !== null && (
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="font-semibold">Final Score</p>
            <p className="text-lg">
              {game.homeTeam} {game.homeScore} - {game.awayScore} {game.awayTeam}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
