import { 
  users, games, predictions, bets,
  type User, type InsertUser, 
  type Game, type InsertGame,
  type Prediction, type InsertPrediction,
  type Bet, type InsertBet,
  type GameWithPredictions,
  type BetWithGame,
  type UserStats
} from "../shared/schema.js";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBankroll(userId: number, newBankroll: string): Promise<void>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<void>;

  // Game operations
  getAllGames(): Promise<Game[]>;
  getGameById(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: Partial<Game>): Promise<Game | undefined>;
  getGamesByStatus(status: string): Promise<Game[]>;
  getGamesBySport(sport: string): Promise<Game[]>;

  // Prediction operations
  getPredictionsByGameId(gameId: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getGamesWithPredictions(): Promise<GameWithPredictions[]>;

  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getBetsByUserId(userId: number): Promise<BetWithGame[]>;
  getBetById(id: number): Promise<Bet | undefined>;
  updateBetStatus(id: number, status: string, actualWin?: string): Promise<void>;
  getUserStats(userId: number): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private predictions: Map<number, Prediction>;
  private bets: Map<number, Bet>;
  private currentUserId: number;
  private currentGameId: number;
  private currentPredictionId: number;
  private currentBetId: number;

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

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      bankroll: "10000.00",
      totalProfit: "0.00",
      winRate: "0.00",
      roi: "0.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBankroll(userId: number, newBankroll: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.bankroll = newBankroll;
      this.users.set(userId, user);
    }
  }

  async updateUserStats(userId: number, stats: Partial<UserStats>): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (stats.bankroll) user.bankroll = stats.bankroll;
      if (stats.totalProfit) user.totalProfit = stats.totalProfit;
      if (stats.winRate) user.winRate = stats.winRate;
      if (stats.roi) user.roi = stats.roi;
      this.users.set(userId, user);
    }
  }

  // Game operations
  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGameById(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = {
      ...insertGame,
      id,
      status: insertGame.status || "upcoming",
      homeTeamLogo: insertGame.homeTeamLogo || null,
      awayTeamLogo: insertGame.awayTeamLogo || null,
      homeScore: insertGame.homeScore || null,
      awayScore: insertGame.awayScore || null,
      spread: insertGame.spread || null,
      spreadOdds: insertGame.spreadOdds || null,
      moneylineHome: insertGame.moneylineHome || null,
      moneylineAway: insertGame.moneylineAway || null,
      total: insertGame.total || null,
      totalOdds: insertGame.totalOdds || null,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (game) {
      const updatedGame = { ...game, ...updates };
      this.games.set(id, updatedGame);
      return updatedGame;
    }
    return undefined;
  }

  async getGamesByStatus(status: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.status === status);
  }

  async getGamesBySport(sport: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.sport === sport);
  }

  // Prediction operations
  async getPredictionsByGameId(gameId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(pred => pred.gameId === gameId);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      aiResponse: insertPrediction.aiResponse || null,
      createdAt: new Date(),
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getGamesWithPredictions(): Promise<GameWithPredictions[]> {
    const games = Array.from(this.games.values());
    return games.map(game => ({
      ...game,
      predictions: Array.from(this.predictions.values()).filter(pred => pred.gameId === game.id)
    }));
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const bet: Bet = {
      ...insertBet,
      id,
      status: insertBet.status || "pending",
      actualWin: insertBet.actualWin || null,
      placedAt: new Date(),
      settledAt: null,
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getBetsByUserId(userId: number): Promise<BetWithGame[]> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)!
    }));
  }

  async getBetById(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async updateBetStatus(id: number, status: string, actualWin?: string): Promise<void> {
    const bet = this.bets.get(id);
    if (bet) {
      bet.status = status;
      bet.settledAt = new Date();
      if (actualWin) {
        bet.actualWin = actualWin;
      }
      this.bets.set(id, bet);
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const user = this.users.get(userId);
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const totalBets = userBets.length;
    const wonBets = userBets.filter(bet => bet.status === "won").length;
    const lostBets = userBets.filter(bet => bet.status === "lost").length;

    return {
      bankroll: user.bankroll,
      totalProfit: user.totalProfit,
      winRate: user.winRate,
      roi: user.roi,
      totalBets,
      wonBets,
      lostBets,
    };
  }
}

export const storage = new MemStorage();
