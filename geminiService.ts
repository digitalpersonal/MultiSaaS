
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise estes dados empresariais e forneça 3 insights estratégicos, curtos e diretos em Português do Brasil: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "Você é um consultor de negócios experiente especializado em pequenas e médias empresas brasileiras. Forneça conselhos práticos sobre faturamento, estoque e atendimento ao cliente, sempre em Português (Brasil).",
        temperature: 0.7,
      },
    });
    return response.text || "Insights indisponíveis no momento.";
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Não foi possível gerar insights automáticos agora. Verifique seus relatórios manuais.";
  }
};
