
import { GoogleGenAI } from "@google/genai";

// Always use named parameter for apiKey and use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados financeiros e de estoque de uma empresa e forneça 3 insights rápidos e acionáveis em Português: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "Você é um consultor financeiro sênior especializado em pequenas e médias empresas.",
        temperature: 0.7,
      },
    });
    // Use .text property directly instead of text() method.
    return response.text;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return "Não foi possível gerar insights no momento.";
  }
};
