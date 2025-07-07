const { createServer } = require("http");
const { storage } = require("./storage.cjs");
const { initializeDemoData } = require("./services/demoData.cjs");
const { generatePredictionsForAllGames } = require("./services/predictionService.cjs");
const { calculatePotentialWin, simulateGameResult, settleBets, updateUserStatistics } = require("./services/gameService.cjs");
const { insertBetSchema } = require("../shared/schema.cjs");

async function registerRoutes(app) {
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
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd create a proper session/JWT token here
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

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // User routes
  app.get("/api/user/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Game routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGamesWithPredictions();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Bet routes
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      
      // Validate user has enough bankroll
      const user = await storage.getUser(betData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userBankroll = parseFloat(user.bankroll);
      if (userBankroll < betData.amount) {
        return res.status(400).json({ message: "Insufficient bankroll" });
      }

      // Calculate potential win
      const potentialWin = calculatePotentialWin(betData.amount, betData.odds);
      
      const bet = await storage.createBet({
        ...betData,
        potentialWin: potentialWin.toFixed(2),
        status: "pending",
        placedAt: new Date()
      });

      // Update user bankroll
      const newBankroll = userBankroll - betData.amount;
      await storage.updateUserBankroll(betData.userId, newBankroll.toFixed(2));

      res.json(bet);
    } catch (error) {
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  app.get("/api/users/:userId/bets", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bets = await storage.getBetsByUserId(userId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bets" });
    }
  });

  // Game simulation routes
  app.post("/api/games/:id/simulate", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      await simulateGameResult(gameId);
      await settleBets(gameId);
      
      // Update stats for all users who had bets on this game
      const gameBets = await storage.getBetsByUserId(1); // For demo, just update user 1
      const userIds = [...new Set(gameBets.filter(bet => bet.gameId === gameId).map(bet => bet.userId))];
      
      for (const userId of userIds) {
        await updateUserStatistics(userId);
      }

      res.json({ message: "Game simulated and bets settled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate game" });
    }
  });

  // Prediction routes
  app.post("/api/predictions/refresh", async (req, res) => {
    try {
      await generatePredictionsForAllGames();
      res.json({ message: "Predictions refreshed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

module.exports = { registerRoutes };