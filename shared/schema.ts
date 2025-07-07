import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  bankroll: decimal("bankroll", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).notNull().default("0.00"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(), // NBA, NFL, MLB, NHL
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  gameTime: timestamp("game_time").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, live, completed
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  spread: decimal("spread", { precision: 4, scale: 1 }),
  spreadOdds: integer("spread_odds").default(-110),
  moneylineHome: integer("moneyline_home"),
  moneylineAway: integer("moneyline_away"),
  total: decimal("total", { precision: 4, scale: 1 }),
  totalOdds: integer("total_odds").default(-110),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  recommendationType: text("recommendation_type").notNull(), // spread, moneyline, total
  recommendedBet: text("recommended_bet").notNull(),
  confidence: integer("confidence").notNull(), // 1-100
  edgeScore: decimal("edge_score", { precision: 3, scale: 1 }).notNull(), // 1-10
  reasoning: text("reasoning").notNull(),
  aiResponse: json("ai_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  betType: text("bet_type").notNull(), // spread, moneyline, total
  betSelection: text("bet_selection").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  odds: integer("odds").notNull(),
  potentialWin: decimal("potential_win", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, won, lost
  actualWin: decimal("actual_win", { precision: 8, scale: 2 }).default("0.00"),
  placedAt: timestamp("placed_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
  settledAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

// Extended types for API responses
export type GameWithPredictions = Game & {
  predictions: Prediction[];
};

export type BetWithGame = Bet & {
  game: Game;
};

export type UserStats = {
  bankroll: string;
  totalProfit: string;
  winRate: string;
  roi: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
};
