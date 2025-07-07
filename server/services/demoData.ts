import { storage } from "../storage.js";
import type { InsertGame } from "../../shared/schema.js";

export async function initializeDemoData() {
  // Create demo user
  const demoUser = await storage.createUser({
    username: "angel",
    password: "angel1004"
  });

  // Create demo games
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const demoGames: InsertGame[] = [
    // NBA Games
    {
      sport: "NBA",
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      gameTime: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: "upcoming",
      spread: "-3.5",
      spreadOdds: -110,
      moneylineHome: -165,
      moneylineAway: 145,
      total: "218.5",
      totalOdds: -110,
    },
    {
      sport: "NBA",
      homeTeam: "Nets",
      awayTeam: "Heat",
      gameTime: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      status: "upcoming",
      spread: "6.5",
      spreadOdds: -105,
      moneylineHome: 240,
      moneylineAway: -280,
      total: "210.5",
      totalOdds: -110,
    },
    // NFL Games
    {
      sport: "NFL",
      homeTeam: "Chiefs",
      awayTeam: "Bills",
      gameTime: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000), // Tomorrow at 1 PM
      status: "upcoming",
      spread: "-2.5",
      spreadOdds: -108,
      moneylineHome: -140,
      moneylineAway: 125,
      total: "47.5",
      totalOdds: -115,
    },
    // MLB Games
    {
      sport: "MLB",
      homeTeam: "Yankees",
      awayTeam: "Red Sox",
      gameTime: new Date(today.getTime() + 5 * 60 * 60 * 1000), // 5 hours from now
      status: "upcoming",
      spread: "-1.5",
      spreadOdds: 135,
      moneylineHome: -145,
      moneylineAway: 125,
      total: "9.5",
      totalOdds: -115,
    },
    // NHL Games
    {
      sport: "NHL",
      homeTeam: "Rangers",
      awayTeam: "Bruins",
      gameTime: new Date(today.getTime() + 3.5 * 60 * 60 * 1000), // 3.5 hours from now
      status: "upcoming",
      spread: "1.5",
      spreadOdds: -175,
      moneylineHome: 115,
      moneylineAway: -135,
      total: "6.5",
      totalOdds: 105,
    },
  ];

  for (const gameData of demoGames) {
    await storage.createGame(gameData);
  }

  console.log("Demo data initialized successfully");
}


