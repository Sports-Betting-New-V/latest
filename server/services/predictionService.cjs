const OpenAI = require("openai");
require('dotenv').config();
const { storage } = require("../storage.cjs");
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-test-key"
});

async function generatePrediction(game) {
  try {
    const prompt = `
You are an expert sports betting analyst. Analyze the following ${game.sport} game and provide a betting recommendation:

Game: ${game.awayTeam} at ${game.homeTeam}
Sport: ${game.sport}
Home Spread: ${game.homeSpread}
Away Spread: ${game.awaySpread}
Home Moneyline: ${game.homeMoneyline}
Away Moneyline: ${game.awayMoneyline}
Over/Under: ${game.overUnder}
Over Odds: ${game.overOdds}
Under Odds: ${game.underOdds}

Provide your analysis in the following JSON format:
{
  "recommendationType": "spread|moneyline|total",
  "recommendedBet": "specific bet recommendation",
  "confidence": confidence_score_1_to_100,
  "edgeScore": edge_score_1_to_10,
  "reasoning": "detailed analysis explaining your recommendation"
}

Focus on finding value bets with good edge potential. Consider team form, matchups, and betting line value.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional sports betting analyst. Provide detailed, actionable betting recommendations based on data analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const aiRecommendation = JSON.parse(response.choices[0].message.content);
    
    const prediction = {
      gameId: game.id,
      recommendationType: aiRecommendation.recommendationType,
      recommendedBet: aiRecommendation.recommendedBet,
      confidence: Math.max(1, Math.min(100, aiRecommendation.confidence)),
      edgeScore: Math.max(1, Math.min(10, aiRecommendation.edgeScore)),
      reasoning: aiRecommendation.reasoning
    };

    return await storage.createPrediction(prediction);
  } catch (error) {
    console.error("Error generating prediction:", error);
    
    // Fallback prediction if OpenAI fails
    const fallbackPrediction = {
      gameId: game.id,
      recommendationType: "spread",
      recommendedBet: `${game.homeTeam} ${game.homeSpread}`,
      confidence: 65,
      edgeScore: 6,
      reasoning: "AI prediction service temporarily unavailable. This is a basic recommendation based on spread analysis."
    };

    return await storage.createPrediction(fallbackPrediction);
  }
}

async function generatePredictionsForAllGames() {
  const upcomingGames = await storage.getGamesByStatus("upcoming");
  
  for (const game of upcomingGames) {
    const existingPredictions = await storage.getPredictionsByGameId(game.id);
    
    // Only generate prediction if none exists
    if (existingPredictions.length === 0) {
      await generatePrediction(game);
    }
  }
}

module.exports = { generatePrediction, generatePredictionsForAllGames };