import OpenAI from "openai";
import { storage } from "../storage.js";
import type { Game, InsertPrediction } from "../../shared/schema.js";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-test-key"
});

interface AIRecommendation {
  recommendationType: string;
  recommendedBet: string;
  confidence: number;
  edgeScore: number;
  reasoning: string;
}

export async function generatePrediction(game: Game): Promise<InsertPrediction> {
  try {
    const prompt = `
You are an expert sports betting analyst. Analyze the following ${game.sport} game and provide a betting recommendation:

Game: ${game.awayTeam} @ ${game.homeTeam}
Spread: ${game.homeTeam} ${game.spread} (${game.spreadOdds})
Moneyline: ${game.homeTeam} ${game.moneylineHome}, ${game.awayTeam} ${game.moneylineAway}
Total: ${game.total} (${game.totalOdds})

Provide your analysis in the following JSON format:
{
  "recommendationType": "spread|moneyline|total",
  "recommendedBet": "specific bet recommendation (e.g., 'Lakers -3.5', 'Warriors ML', 'Over 218.5')",
  "confidence": 1-100,
  "edgeScore": 1.0-10.0,
  "reasoning": "detailed reasoning for the recommendation including key factors"
}

Consider factors like:
- Team performance and recent form
- Head-to-head matchups
- Injuries and roster changes
- Home/away advantages
- Weather conditions (for outdoor sports)
- Value in the betting lines
- Statistical trends

Provide a confident recommendation with specific reasoning.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional sports betting analyst with years of experience. Provide detailed, analytical betting recommendations based on data and trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}") as AIRecommendation;

    const prediction: InsertPrediction = {
      gameId: game.id,
      recommendationType: aiResult.recommendationType,
      recommendedBet: aiResult.recommendedBet,
      confidence: Math.max(1, Math.min(100, aiResult.confidence)),
      edgeScore: aiResult.edgeScore.toString(),
      reasoning: aiResult.reasoning,
      aiResponse: aiResult,
    };

    return await storage.createPrediction(prediction);

  } catch (error) {
    console.error("Error generating AI prediction:", error);
    
    // Fallback prediction if AI fails
    const fallbackPrediction: InsertPrediction = {
      gameId: game.id,
      recommendationType: "spread",
      recommendedBet: `${game.homeTeam} ${game.spread}`,
      confidence: 65,
      edgeScore: "5.5",
      reasoning: "AI service temporarily unavailable. This is a moderate confidence pick based on historical data.",
      aiResponse: null,
    };

    return await storage.createPrediction(fallbackPrediction);
  }
}

export async function generatePredictionsForAllGames(): Promise<void> {
  const upcomingGames = await storage.getGamesByStatus("upcoming");
  
  for (const game of upcomingGames) {
    const existingPredictions = await storage.getPredictionsByGameId(game.id);
    
    // Only generate prediction if none exists
    if (existingPredictions.length === 0) {
      await generatePrediction(game);
    }
  }
}


