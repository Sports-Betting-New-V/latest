import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { BetWithGame } from "@shared/schema";

export function BetSlip() {
  const { user } = useAuth();

  const { data: bets = [], isLoading } = useQuery<BetWithGame[]>({
    queryKey: [`/api/users/${user?.id}/bets`],
    enabled: !!user,
  });

  const recentBets = bets.slice(0, 5);

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTime = (date: Date | string) => {
    const betDate = new Date(date);
    return betDate.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-success text-success-foreground";
      case "lost":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getBetStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <TrendingUp className="h-4 w-4" />;
      case "lost":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="sports-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="text-xl">🎯</span>
            </div>
            <span>Recent Bets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse shimmer">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentBets.length === 0) {
    return (
      <Card className="sports-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="text-xl">🎯</span>
            </div>
            <span>Recent Bets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-6xl mb-4 floating-animation">🎯</div>
            <p className="text-lg font-medium mb-2">No bets placed yet</p>
            <p className="text-sm">Start betting to see your history here</p>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-primary font-medium">
                💡 Tip: Check out our AI predictions for smart betting opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sports-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <span className="text-xl">🎯</span>
          </div>
          <span>Recent Bets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentBets.map((bet) => (
            <div
              key={bet.id}
              className={`p-3 rounded-lg border ${
                bet.status === "won" 
                  ? "bg-success/5 border-success/20" 
                  : bet.status === "lost"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getBetStatusColor(bet.status)}>
                    <div className="flex items-center space-x-1">
                      {getBetStatusIcon(bet.status)}
                      <span className="capitalize">{bet.status}</span>
                    </div>
                  </Badge>
                  <span className="text-sm font-medium">
                    {bet.game.awayTeam} @ {bet.game.homeTeam}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {bet.status === "won" && "+"}
                    {bet.status === "won" 
                      ? formatAmount(bet.actualWin || "0") 
                      : bet.status === "lost"
                      ? `-${formatAmount(bet.amount)}`
                      : formatAmount(bet.amount)
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{bet.betSelection}</span>
                <span>{formatTime(bet.placedAt)}</span>
              </div>
            </div>
          ))}
          
          {bets.length > 5 && (
            <Button variant="outline" className="w-full">
              View All Bets ({bets.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
