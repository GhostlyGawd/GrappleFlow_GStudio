import { GoogleGenAI, Type } from "@google/genai";
import { TrainingSession, Challenge, LabEntry } from "../types";

// Helper to safely get the AI client only when needed
const getAiClient = () => {
  // Use Vite's import.meta.env for environment variables
  // @ts-ignore - Ignore type checking for import.meta.env in this context
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY is not set. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `You are a world-class Brazilian Jiu-Jitsu coach and analyst named "Coach G". 
Your goal is to help students improve by analyzing their training logs, suggesting technical fixes, and providing strategic advice.
You are encouraging but realistic. You use standard BJJ terminology (IBJJF standards).
Keep responses concise and actionable.`;

export const analyzeTrainingPatterns = async (sessions: TrainingSession[]): Promise<string> => {
  if (sessions.length === 0) return "No training data available yet. Log some sessions to get insights!";

  const sessionSummary = sessions.slice(0, 10).map(s => 
    `Date: ${s.date}, Type: ${s.type}, Mood: ${s.mood}, Notes: ${s.notes}, Techniques: ${s.techniques.map(t => t.name).join(', ')}`
  ).join('\n');

  const prompt = `Analyze these recent BJJ training sessions. Identify 1 key strength and 1 specific area for improvement. 
  Suggest a drill or focus for the next week.
  
  Sessions:
  ${sessionSummary}`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Error connecting to Coach G. Please try again later.";
  }
};

export const getTechnicalAdvice = async (query: string, context?: string): Promise<string> => {
  const fullPrompt = context 
    ? `Context from user's recent training: ${context}\n\nUser Question: ${query}` 
    : query;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "I couldn't come up with an answer right now.";
  } catch (error) {
    console.error("Advice error:", error);
    return "Network error. Coach G is offline.";
  }
};

export const suggestDrills = async (position: string): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 3 specific solo or partner drills to improve the '${position}' position in BJJ. Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return ["Shrimping", "Technical Standup", "Bridge and Roll"];
    }
}

// New Scientific Lab Service
export const generateChallengeInsight = async (challenge: Challenge, entries: LabEntry[]): Promise<string> => {
    // Sort entries chronologically to tell a story
    const history = entries
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(e => `[${e.date}] ${e.type.toUpperCase()}: ${e.content} ${e.result ? `(Result: ${e.result})` : ''}`)
        .join('\n');

    const prompt = `
    You are a scientific BJJ analyst. Help the student solve this specific challenge using the Scientific Method.
    
    Challenge: ${challenge.title}
    Category: ${challenge.category}
    
    Lab Notebook History:
    ${history}
    
    Based on the history:
    1. If the last entry was a FAILURE or OBSERVATION: Propose a new specific technical Hypothesis (solution) to test.
    2. If the last entry was a SUCCESS: Suggest how to refine or drill it to make it permanent.
    3. If the history is empty: Provide an initial Hypothesis based on standard high-percentage BJJ mechanics.

    Keep it concise. Focus on biomechanics and leverage.
    `;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
        return response.text || "Unable to generate insight.";
    } catch (error) {
        console.error("Lab Insight Error", error);
        return "Coach G is currently analyzing other matches. Try again later.";
    }
};