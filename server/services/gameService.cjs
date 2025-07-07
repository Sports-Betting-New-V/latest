const { storage } = require("../storage.cjs");

function calculatePotentialWin(amount, odds) {
  if (odds > 0) {
    // Positive odds: amount * (odds / 100)
    return amount * (odds / 100);
  } else {
    // Negative odds: amount * (100 / abs(odds))
    return amount * (100 / Math.abs(odds));
  }
}

function calculateTotalReturn(amount, odds) {
  return amount + calculatePotentialWin(amount, odds);
}

async function simulateGameResult(gameId) {
  const game = await storage.getGameById(gameId);
  if (!game || game.status !== "upcoming") {
    return;
  }

  // Simple simulation - generate random scores based on sport
  let homeScore, awayScore;
  
  switch (game.sport) {
    case "NBA":
      homeScore = Math.floor(Math.random() * 40) + 90; // 90-130 range
      awayScore = Math.floor(Math.random() * 40) + 90;
      break;
    case "NFL":
      homeScore = Math.floor(Math.random() * 35) + 10; // 10-45 range
      awayScore = Math.floor(Math.random() * 35) + 10;
      break;
    case "NHL":
      homeScore = Math.floor(Math.random() * 6) + 1; // 1-6 range
      awayScore = Math.floor(Math.random() * 6) + 1;
      break;
    case "MLB":
      homeScore = Math.floor(Math.random() * 12) + 1; // 1-12 range
      awayScore = Math.floor(Math.random() * 12) + 1;
      break;
    default:
      homeScore = Math.floor(Math.random() * 5) + 1;
      awayScore = Math.floor(Math.random() * 5) + 1;
  }

  // Update game with results
  await storage.updateGame(gameId, {
    status: "completed",
    homeScore: homeScore,
    awayScore: awayScore
  });

  console.log(`Game ${gameId} completed: ${game.homeTeam} ${homeScore} - ${awayScore} ${game.awayTeam}`);
}

async function settleBets(gameId) {
  const game = await storage.getGameById(gameId);
  if (!game || game.status !== "completed" || !game.homeScore || !game.awayScore) {
    return;
  }

  // Get all bets for this game
  const allBets = await storage.getBetsByUserId(1); // For demo, we only have user 1
  const gameBets = allBets.filter(bet => bet.gameId === gameId && bet.status === "pending");

  for (const bet of gameBets) {
    let isWinning = false;
    
    switch (bet.betType) {
      case "spread":
        const homeSpread = parseFloat(game.homeSpread);
        const adjustedHomeScore = game.homeScore + homeSpread;
        
        if (bet.selection === game.homeTeam) {
          isWinning = adjustedHomeScore > game.awayScore;
        } else {
          isWinning = game.awayScore > adjustedHomeScore;
        }
        break;
        
      case "moneyline":
        if (bet.selection === game.homeTeam) {
          isWinning = game.homeScore > game.awayScore;
        } else {
          isWinning = game.awayScore > game.homeScore;
        }
        break;
        
      case "total":
        const totalScore = game.homeScore + game.awayScore;
        const overUnder = parseFloat(game.overUnder);
        
        if (bet.selection === "over") {
          isWinning = totalScore > overUnder;
        } else {
          isWinning = totalScore < overUnder;
        }
        break;
    }

    if (isWinning) {
      const winnings = calculateTotalReturn(bet.amount, bet.odds);
      await storage.updateBetStatus(bet.id, "won", winnings.toFixed(2));
      
      // Add winnings to user bankroll
      const user = await storage.getUser(bet.userId);
      if (user) {
        const newBankroll = parseFloat(user.bankroll) + winnings;
        await storage.updateUserBankroll(bet.userId, newBankroll.toFixed(2));
      }
    } else {
      await storage.updateBetStatus(bet.id, "lost", "0.00");
    }
  }

  console.log(`Settled ${gameBets.length} bets for game ${gameId}`);
}

async function updateUserStatistics(userId) {
  const bets = await storage.getBetsByUserId(userId);
  const settledBets = bets.filter(bet => bet.status !== "pending");

  if (settledBets.length === 0) return;

  const wonBets = settledBets.filter(bet => bet.status === "won");
  const totalWagered = settledBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWon = wonBets.reduce((sum, bet) => sum + parseFloat(bet.actualWin || 0), 0);
  const totalProfit = totalWon - totalWagered;
  const winRate = (wonBets.length / settledBets.length) * 100;
  const roi = (totalProfit / totalWagered) * 100;

  await storage.updateUserStats(userId, {
    winRate: winRate.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
    roi: roi.toFixed(2),
  });
}

module.exports = { 
  calculatePotentialWin, 
  calculateTotalReturn, 
  simulateGameResult, 
  settleBets, 
  updateUserStatistics 
};