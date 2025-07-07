const { storage } = require("../storage.cjs");

async function initializeDemoData() {
  // Create demo user
  const demoUser = await storage.createUser({
    username: "angel",
    password: "angel1004"
  });

  // Create demo games
  const demoGames = [
    {
      sport: "NBA",
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      gameTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      homeSpread: "-3.5",
      awaySpread: "+3.5",
      homeMoneyline: -150,
      awayMoneyline: +130,
      overUnder: "220.5",
      overOdds: -110,
      underOdds: -110,
      status: "upcoming"
    },
    {
      sport: "NFL",
      homeTeam: "Chiefs",
      awayTeam: "Bills",
      gameTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      homeSpread: "-2.5",
      awaySpread: "+2.5",
      homeMoneyline: -120,
      awayMoneyline: +100,
      overUnder: "47.5",
      overOdds: -110,
      underOdds: -110,
      status: "upcoming"
    },
    {
      sport: "NHL",
      homeTeam: "Rangers",
      awayTeam: "Bruins",
      gameTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      homeSpread: "-1.5",
      awaySpread: "+1.5",
      homeMoneyline: -140,
      awayMoneyline: +120,
      overUnder: "6.5",
      overOdds: -105,
      underOdds: -115,
      status: "upcoming"
    },
    {
      sport: "MLB",
      homeTeam: "Yankees",
      awayTeam: "Red Sox",
      gameTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      homeSpread: "-1.5",
      awaySpread: "+1.5",
      homeMoneyline: -160,
      awayMoneyline: +140,
      overUnder: "8.5",
      overOdds: -110,
      underOdds: -110,
      status: "upcoming"
    },
    {
      sport: "NBA",
      homeTeam: "Celtics",
      awayTeam: "Heat",
      gameTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours from now
      homeSpread: "-4.5",
      awaySpread: "+4.5",
      homeMoneyline: -180,
      awayMoneyline: +160,
      overUnder: "215.5",
      overOdds: -110,
      underOdds: -110,
      status: "upcoming"
    }
  ];

  for (const gameData of demoGames) {
    await storage.createGame(gameData);
  }

  console.log("Demo data initialized successfully");
}

module.exports = { initializeDemoData };