import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string, userGoal: string, language: string = 'en'): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze this meal. The user's goal is: ${userGoal}.
            Estimate weights realistically based on standard portion sizes.
            IMPORTANT: Provide all textual responses (names, advice, feedback) in this language: "${language}".
            Return a JSON object with:
            - items: array of {name, weight_g, nutrients: {calories, protein, fat, carbs, fiber, sugar, sodium}}
            - total_nutrients: sum of all items
            - health_score: 0-100 integer
            - score_breakdown: {calorie_score, macro_score, balance_score, risk_score} (all 0-30 or 0-20 ints)
            - short_feedback: One punchy sentence summary (e.g. "Great protein source but watch the sodium!")
            - detailed_advice: Array of strings with specific improvements.
            - alternatives: Array of strings suggesting healthier swaps.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            weight_g: { type: Type.NUMBER },
                            nutrients: {
                                type: Type.OBJECT,
                                properties: {
                                    calories: { type: Type.NUMBER },
                                    protein: { type: Type.NUMBER },
                                    fat: { type: Type.NUMBER },
                                    carbs: { type: Type.NUMBER },
                                    fiber: { type: Type.NUMBER },
                                    sugar: { type: Type.NUMBER },
                                    sodium: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                },
                total_nutrients: {
                    type: Type.OBJECT,
                    properties: {
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fiber: { type: Type.NUMBER },
                        sugar: { type: Type.NUMBER },
                        sodium: { type: Type.NUMBER }
                    }
                },
                health_score: { type: Type.NUMBER },
                score_breakdown: {
                    type: Type.OBJECT,
                    properties: {
                        calorie_score: { type: Type.NUMBER },
                        macro_score: { type: Type.NUMBER },
                        balance_score: { type: Type.NUMBER },
                        risk_score: { type: Type.NUMBER }
                    }
                },
                short_feedback: { type: Type.STRING },
                detailed_advice: { type: Type.ARRAY, items: { type: Type.STRING } },
                alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No data returned from AI");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};