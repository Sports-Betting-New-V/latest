const { 
  users, games, predictions, bets
} = require("../shared/schema.cjs");

class MemStorage {
  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.predictions = new Map();
    this.bets = new Map();
    this.currentUserId = 1;
    this.currentGameId = 1;
    this.currentPredictionId = 1;
    this.currentBetId = 1;
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser) {
    const user = {
      id: this.currentUserId++,
      username: insertUser.username,
      password: insertUser.password,
      bankroll: insertUser.bankroll || "10000.00",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserBankroll(userId, newBankroll) {
    const user = this.users.get(userId);
    if (user) {
      user.bankroll = newBankroll;
    }
  }

  async updateUserStats(userId, stats) {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, stats);
    }
  }

  async getAllGames() {
    return Array.from(this.games.values());
  }

  async getGameById(id) {
    return this.games.get(id);
  }

  async createGame(insertGame) {
    const game = {
      id: this.currentGameId++,
      sport: insertGame.sport,
      homeTeam: insertGame.homeTeam,
      awayTeam: insertGame.awayTeam,
      gameTime: insertGame.gameTime,
      status: insertGame.status || "upcoming",
      homeScore: insertGame.homeScore || null,
      awayScore: insertGame.awayScore || null,
      homeSpread: insertGame.homeSpread,
      awaySpread: insertGame.awaySpread,
      homeMoneyline: insertGame.homeMoneyline,
      awayMoneyline: insertGame.awayMoneyline,
      overUnder: insertGame.overUnder,
      overOdds: insertGame.overOdds,
      underOdds: insertGame.underOdds,
      createdAt: new Date()
    };
    this.games.set(game.id, game);
    return game;
  }

  async updateGame(id, updates) {
    const game = this.games.get(id);
    if (game) {
      Object.assign(game, updates);
      return game;
    }
    return undefined;
  }

  async getGamesByStatus(status) {
    return Array.from(this.games.values()).filter(game => game.status === status);
  }

  async getGamesBySport(sport) {
    return Array.from(this.games.values()).filter(game => game.sport === sport);
  }

  async getPredictionsByGameId(gameId) {
    return Array.from(this.predictions.values()).filter(prediction => prediction.gameId === gameId);
  }

  async createPrediction(insertPrediction) {
    const prediction = {
      id: this.currentPredictionId++,
      gameId: insertPrediction.gameId,
      recommendationType: insertPrediction.recommendationType,
      recommendedBet: insertPrediction.recommendedBet,
      confidence: insertPrediction.confidence,
      edgeScore: insertPrediction.edgeScore,
      reasoning: insertPrediction.reasoning,
      createdAt: new Date()
    };
    this.predictions.set(prediction.id, prediction);
    return prediction;
  }

  async getGamesWithPredictions() {
    const games = Array.from(this.games.values());
    return games.map(game => ({
      ...game,
      predictions: Array.from(this.predictions.values()).filter(p => p.gameId === game.id)
    }));
  }

  async createBet(insertBet) {
    const bet = {
      id: this.currentBetId++,
      userId: insertBet.userId,
      gameId: insertBet.gameId,
      betType: insertBet.betType,
      selection: insertBet.selection,
      amount: insertBet.amount,
      odds: insertBet.odds,
      potentialWin: insertBet.potentialWin,
      status: insertBet.status || "pending",
      placedAt: insertBet.placedAt || new Date(),
      actualWin: insertBet.actualWin || null
    };
    this.bets.set(bet.id, bet);
    return bet;
  }

  async getBetsByUserId(userId) {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)
    }));
  }

  async getBetById(id) {
    return this.bets.get(id);
  }

  async updateBetStatus(id, status, actualWin) {
    const bet = this.bets.get(id);
    if (bet) {
      bet.status = status;
      if (actualWin !== undefined) {
        bet.actualWin = actualWin;
      }
    }
  }

  async getUserStats(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    const settledBets = userBets.filter(bet => bet.status !== "pending");
    const wonBets = settledBets.filter(bet => bet.status === "won");
    const lostBets = settledBets.filter(bet => bet.status === "lost");

    const totalWagered = settledBets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = wonBets.reduce((sum, bet) => sum + parseFloat(bet.actualWin || 0), 0);
    const totalProfit = totalWon - totalWagered;
    const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0;
    const roi = totalWagered > 0 ? (totalProfit / totalWagered) * 100 : 0;

    return {
      bankroll: user.bankroll,
      totalProfit: totalProfit.toFixed(2),
      winRate: winRate.toFixed(2),
      roi: roi.toFixed(2),
      totalBets: settledBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length
    };
  }
}

const storage = new MemStorage();

module.exports = { storage };