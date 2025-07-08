import { History, Filter, Calendar, Search, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { BetWithGame } from "@shared/schema";

export default function BetHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");

  const { data: bets = [], isLoading } = useQuery<BetWithGame[]>({
    queryKey: [`/api/user/${user?.id}/bets`],
    enabled: !!user,
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  // Filter bets based on search and filters
  const filteredBets = bets.filter(bet => {
    const matchesSearch = searchTerm === "" || 
      bet.game.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.game.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.betSelection.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bet.status === statusFilter;
    const matchesSport = sportFilter === "all" || bet.game.sport === sportFilter;
    
    return matchesSearch && matchesStatus && matchesSport;
  });

  // Group bets by status
  const pendingBets = filteredBets.filter(bet => bet.status === 'pending');
  const wonBets = filteredBets.filter(bet => bet.status === 'won');
  const lostBets = filteredBets.filter(bet => bet.status === 'lost');

  // Calculate summary stats
  const totalWagered = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const totalWon = wonBets.reduce((sum, bet) => sum + parseFloat(bet.actualWin || '0'), 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const netProfit = totalWon - totalLost;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full">
              <History className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Bet History
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review your complete betting history, track performance, and analyze your wagering patterns.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Wagered</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalWagered)}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Won</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalWon)}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Lost</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalLost)}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`bg-gradient-to-r ${netProfit >= 0 ? 'from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800' : 'from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{formatCurrency(netProfit)}</p>
                </div>
                <div className={`p-3 ${netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full`}>
                  {netProfit >= 0 ? 
                    <TrendingUp className="h-6 w-6 text-green-600" /> : 
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by team or bet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="NBA">NBA</SelectItem>
                  <SelectItem value="NFL">NFL</SelectItem>
                  <SelectItem value="MLB">MLB</SelectItem>
                  <SelectItem value="NHL">NHL</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bet History Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full">
            <TabsTrigger value="all">All Bets ({filteredBets.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBets.length})</TabsTrigger>
            <TabsTrigger value="won">Won ({wonBets.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({lostBets.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <BetList bets={filteredBets} />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <BetList bets={pendingBets} />
          </TabsContent>
          
          <TabsContent value="won" className="space-y-4">
            <BetList bets={wonBets} />
          </TabsContent>
          
          <TabsContent value="lost" className="space-y-4">
            <BetList bets={lostBets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BetList({ bets }: { bets: BetWithGame[] }) {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getSportEmoji = (sport: string) => {
    const emojis: Record<string, string> = {
      NBA: '🏀',
      NFL: '🏈',
      MLB: '⚾',
      NHL: '🏒'
    };
    return emojis[sport] || '⚽';
  };

  if (bets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No Bets Found</h3>
        <p className="text-muted-foreground">
          No bets match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <Card key={bet.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getSportEmoji(bet.game.sport)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-lg">
                      {bet.game.awayTeam} @ {bet.game.homeTeam}
                    </p>
                    <Badge variant="outline">{bet.game.sport}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(bet.game.gameTime)}</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">{bet.betType}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                  className={`${bet.status === 'won' ? 'bg-green-500 hover:bg-green-600' : ''} mb-2`}
                >
                  {bet.status.toUpperCase()}
                </Badge>
                <div className="text-lg font-semibold">{formatCurrency(bet.amount)}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Selection</p>
                    <p className="font-medium">{bet.betSelection}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Odds</p>
                    <p className="font-medium">{formatOdds(bet.odds)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Win</p>
                    <p className="font-medium">{formatCurrency(bet.potentialWin)}</p>
                  </div>
                </div>
                
                {bet.status === 'won' && bet.actualWin && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Actual Win</p>
                    <p className="font-semibold text-green-600">{formatCurrency(bet.actualWin)}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}