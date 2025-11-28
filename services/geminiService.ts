import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

export const analyzeTradesWithAI = async (trades: Trade[], apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key required");

  const ai = new GoogleGenAI({ apiKey });
  
  // Format trades for the prompt, taking only the last 20 to avoid token limits
  const recentTrades = trades.slice(-20).map(t => ({
    symbol: t.symbol,
    type: t.type,
    status: t.status,
    pnl: t.pnl,
    date: t.entryDate,
    notes: t.notes
  }));

  const prompt = `
    You are a professional trading psychology and risk management coach.
    Here is a list of my recent 20 trades:
    ${JSON.stringify(recentTrades, null, 2)}

    Please analyze my performance. Look for patterns in my losses, check if I am overtrading, 
    and provide 3 specific, actionable tips to improve my profitability.
    Keep the tone encouraging but strict on risk management.
    Format the output as Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Failed to connect to AI Coach. Please check your API key.";
  }
};