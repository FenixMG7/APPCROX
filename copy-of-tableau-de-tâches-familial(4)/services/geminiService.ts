
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Utilise process.env pour accéder à la variable d'environnement de l'API Key.
const apiKey = process.env.API_KEY;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("API_KEY for Gemini is not set in environment variables. Suggestion feature will be disabled.");
}

export const suggestChore = async (): Promise<string> => {
    if (!ai) {
        return "Nourrir le poisson rouge";
    }
    
    try {
        const prompt = `Suggère une nouvelle tâche ménagère simple pour un enfant. La réponse doit être juste le nom de la tâche, sans phrase d'introduction ni guillemets. Par exemple: 'Ranger ses jouets'.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 20
            }
        });

        const text = response.text.trim().replace(/"/g, '');
        
        if (!text) {
          return "Faire son lit";
        }
        
        return text;
    } catch (error) {
        console.error("Erreur lors de la suggestion de tâche via Gemini:", error);
        // Fallback in case of API error
        return "Aider à mettre la table";
    }
};
