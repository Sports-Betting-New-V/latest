import { storage } from "../storage.js";
import type { Game, Bet } from "../../shared/schema.js";

export function calculatePotentialWin(amount: number, odds: number): number {
  if (odds > 0) {
    // Positive odds: amount * (odds / 100)
    return amount * (odds / 100);
  } else {
    // Negative odds: amount * (100 / Math.abs(odds))
    return amount * (100 / Math.abs(odds));
  }
}

export function calculateTotalReturn(amount: number, odds: number): number {
  return amount + calculatePotentialWin(amount, odds);
}

export async function simulateGameResult(gameId: number): Promise<void> {
  const game = await storage.getGameById(gameId);
  if (!game || game.status !== "upcoming") {
    return;
  }

  // Simple simulation logic - in a real app this would be more sophisticated
  const homeWins = Math.random() > 0.5;
  const totalScore = Math.random() * 40 + 180; // Random total between 180-220 for basketball
  
  let homeScore: number;
  let awayScore: number;

  if (game.sport === "NBA") {
    if (homeWins) {
      homeScore = Math.floor(totalScore * 0.52);
      awayScore = Math.floor(totalScore * 0.48);
    } else {
      homeScore = Math.floor(totalScore * 0.48);
      awayScore = Math.floor(totalScore * 0.52);
    }
  } else if (game.sport === "NFL") {
    const baseTotal = Math.random() * 20 + 35; // 35-55 points
    if (homeWins) {
      homeScore = Math.floor(baseTotal * 0.55);
      awayScore = Math.floor(baseTotal * 0.45);
    } else {
      homeScore = Math.floor(baseTotal * 0.45);
      awayScore = Math.floor(baseTotal * 0.55);
    }
  } else {
    // Default logic for other sports
    if (homeWins) {
      homeScore = Math.floor(Math.random() * 3) + 3;
      awayScore = Math.floor(Math.random() * 3) + 1;
    } else {
      homeScore = Math.floor(Math.random() * 3) + 1;
      awayScore = Math.floor(Math.random() * 3) + 3;
    }
  }

  // Update game with final scores
  await storage.updateGame(gameId, {
    status: "completed",
    homeScore,
    awayScore,
  });

  console.log(`Game ${gameId} completed: ${game.homeTeam} ${homeScore} - ${awayScore} ${game.awayTeam}`);
}

export async function settleBets(gameId: number): Promise<void> {
  const game = await storage.getGameById(gameId);
  if (!game || game.status !== "completed" || !game.homeScore || !game.awayScore) {
    return;
  }

  // Get all pending bets for this game
  const allBets = await storage.getBetsByUserId(1); // For demo, we'll check all bets
  const gameBets = allBets.filter(bet => bet.gameId === gameId && bet.status === "pending");

  for (const bet of gameBets) {
    let betWon = false;
    const pointDiff = game.homeScore - game.awayScore;
    const totalPoints = game.homeScore + game.awayScore;

    switch (bet.betType) {
      case "spread":
        if (bet.betSelection.includes(game.homeTeam)) {
          // Home team spread bet
          const spreadValue = parseFloat(game.spread || "0");
          betWon = pointDiff + spreadValue > 0;
        } else {
          // Away team spread bet  
          const spreadValue = parseFloat(game.spread || "0");
          betWon = pointDiff + spreadValue < 0;
        }
        break;

      case "moneyline":
        if (bet.betSelection.includes(game.homeTeam)) {
          betWon = pointDiff > 0;
        } else {
          betWon = pointDiff < 0;
        }
        break;

      case "total":
        const totalLine = parseFloat(game.total || "0");
        if (bet.betSelection.toLowerCase().includes("over")) {
          betWon = totalPoints > totalLine;
        } else {
          betWon = totalPoints < totalLine;
        }
        break;
    }

    const actualWin = betWon ? bet.potentialWin : "0.00";
    const newStatus = betWon ? "won" : "lost";

    await storage.updateBetStatus(bet.id, newStatus, actualWin);

    // Update user bankroll
    if (betWon) {
      const user = await storage.getUser(bet.userId);
      if (user) {
        const newBankroll = parseFloat(user.bankroll) + parseFloat(actualWin);
        await storage.updateUserBankroll(bet.userId, newBankroll.toFixed(2));
      }
    }
  }

  console.log(`Settled ${gameBets.length} bets for game ${gameId}`);
}

export async function updateUserStatistics(userId: number): Promise<void> {
  const bets = await storage.getBetsByUserId(userId);
  const settledBets = bets.filter(bet => bet.status !== "pending");

  if (settledBets.length === 0) return;

  const wonBets = settledBets.filter(bet => bet.status === "won");
  const winRate = (wonBets.length / settledBets.length) * 100;

  const totalWagered = settledBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const totalWon = wonBets.reduce((sum, bet) => sum + parseFloat(bet.actualWin || "0"), 0);
  const totalProfit = totalWon - totalWagered;
  const roi = totalWagered > 0 ? (totalProfit / totalWagered) * 100 : 0;

  await storage.updateUserStats(userId, {
    winRate: winRate.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
    roi: roi.toFixed(2),
  });
}


