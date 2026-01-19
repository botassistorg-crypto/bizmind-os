import { GoogleGenAI, Type } from "@google/genai";
import { Tier } from "../types";

const getAiClient = () => {
  // Guidelines: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMarketingOffer = async (product: string, dream: string, fear: string) => {
  const ai = getAiClient();

  const prompt = `
    Act as a world-class copywriter using the "Value Stack" formula.
    Create a short, punchy Facebook ad script for:
    Product: ${product}
    Target Customer's Dream: ${dream}
    Target Customer's Fear: ${fear}

    Structure:
    1. Hook (Call out the fear)
    2. Story/Solution (Bridge to the dream)
    3. The Offer (Value Stack - list 3 benefits as bullets)
    4. Call to Action.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to generate offer.");
  }
};

export const runPriceDoctor = async (costPrice: number, productName: string) => {
  const ai = getAiClient();

  const prompt = `
    I am selling ${productName}. My cost price is ${costPrice}.
    Suggest 3 pricing tiers using psychological pricing strategies.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              charm: {
                type: Type.OBJECT,
                properties: {
                  price: { type: Type.NUMBER },
                  strategy: { type: Type.STRING },
                },
                required: ['price', 'strategy'],
              },
              profit: {
                type: Type.OBJECT,
                properties: {
                  price: { type: Type.NUMBER },
                  strategy: { type: Type.STRING },
                },
                required: ['price', 'strategy'],
              },
              anchor: {
                type: Type.OBJECT,
                properties: {
                  price: { type: Type.NUMBER },
                  strategy: { type: Type.STRING },
                },
                required: ['price', 'strategy'],
              },
            },
            required: ['charm', 'profit', 'anchor'],
          }
        }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Price Doctor Error:", error);
    throw new Error("Failed to calculate prices.");
  }
};