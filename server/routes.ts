import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { initializeDemoData } from "./services/demoData.js";
import { generatePredictionsForAllGames } from "./services/predictionService.js";
import { calculatePotentialWin, simulateGameResult, settleBets, updateUserStatistics } from "./services/gameService.js";
import { insertBetSchema } from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize demo data on startup
  await initializeDemoData();
  
  // Generate predictions in background to avoid startup timeout
  generatePredictionsForAllGames().catch(error => {
    console.log("Initial prediction generation failed (will retry later):", error.message);
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          bankroll: user.bankroll 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user stats
  app.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get all games with predictions
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGamesWithPredictions();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Get games by sport
  app.get("/api/games/sport/:sport", async (req, res) => {
    try {
      const sport = req.params.sport.toUpperCase();
      const games = await storage.getGamesBySport(sport);
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games by sport" });
    }
  });

  // Place a bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      
      // Verify user has sufficient bankroll
      const user = await storage.getUser(betData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBankroll = parseFloat(user.bankroll);
      const betAmount = parseFloat(betData.amount);

      if (betAmount > currentBankroll) {
        return res.status(400).json({ message: "Insufficient bankroll" });
      }

      // Deduct bet amount from bankroll
      const newBankroll = currentBankroll - betAmount;
      await storage.updateUserBankroll(betData.userId, newBankroll.toFixed(2));

      // Create the bet
      const bet = await storage.createBet(betData);
      
      res.json(bet);
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  // Get user's bet history
  app.get("/api/users/:id/bets", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const bets = await storage.getBetsByUserId(userId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bet history" });
    }
  });

  // Calculate potential winnings
  app.post("/api/calculate-payout", async (req, res) => {
    try {
      const { amount, odds } = req.body;
      const potentialWin = calculatePotentialWin(parseFloat(amount), parseInt(odds));
      const totalReturn = parseFloat(amount) + potentialWin;
      
      res.json({
        potentialWin: potentialWin.toFixed(2),
        totalReturn: totalReturn.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate payout" });
    }
  });

  // Simulate game (for demo purposes)
  app.post("/api/games/:id/simulate", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      await simulateGameResult(gameId);
      await settleBets(gameId);
      
      // Update statistics for all users who had bets on this game
      const allBets = await storage.getBetsByUserId(1); // Demo user
      const gameBets = allBets.filter(bet => bet.gameId === gameId);
      for (const bet of gameBets) {
        await updateUserStatistics(bet.userId);
      }
      
      res.json({ message: "Game simulated and bets settled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate game" });
    }
  });

  // Generate new predictions (refresh)
  app.post("/api/predictions/refresh", async (req, res) => {
    try {
      await generatePredictionsForAllGames();
      res.json({ message: "Predictions refreshed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


