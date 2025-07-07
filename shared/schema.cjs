const { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean } = require("drizzle-orm/pg-core");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  bankroll: decimal("bankroll", { precision: 10, scale: 2 }).default("10000.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

const games = pgTable("games", {
  id: serial("id").primaryKey(),
  sport: varchar("sport", { length: 50 }).notNull(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  gameTime: timestamp("game_time").notNull(),
  status: varchar("status", { length: 20 }).default("upcoming"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  homeSpread: varchar("home_spread", { length: 10 }),
  awaySpread: varchar("away_spread", { length: 10 }),
  homeMoneyline: integer("home_moneyline"),
  awayMoneyline: integer("away_moneyline"),
  overUnder: varchar("over_under", { length: 10 }),
  overOdds: integer("over_odds"),
  underOdds: integer("under_odds"),
  createdAt: timestamp("created_at").defaultNow(),
});

const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  recommendationType: varchar("recommendation_type", { length: 50 }).notNull(),
  recommendedBet: text("recommended_bet").notNull(),
  confidence: integer("confidence").notNull(),
  edgeScore: integer("edge_score").notNull(),
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  betType: varchar("bet_type", { length: 50 }).notNull(),
  selection: varchar("selection", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  odds: integer("odds").notNull(),
  potentialWin: decimal("potential_win", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  placedAt: timestamp("placed_at").defaultNow(),
  actualWin: decimal("actual_win", { precision: 10, scale: 2 }),
});

const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  bankroll: true,
});

const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
  actualWin: true,
});

module.exports = {
  users,
  games,
  predictions,
  bets,
  insertUserSchema,
  insertGameSchema,
  insertPredictionSchema,
  insertBetSchema
};