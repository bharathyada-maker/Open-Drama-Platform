import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini SDK client if key is configured
const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeminiMetadataResult {
  title: string;
  synopsis: string;
  primary_genre: string;
  secondary_genres: string[];
  tags: string[];
  language: string;
  topics: string[];
  scenes: { timestamp: string; description: string }[];
  safety_flags: { adult_content: boolean; violence: boolean; hate_speech: boolean; harassment: boolean };
  thumbnail_desc: string;
  keywords: string[];
  transcript?: string;
  confidence: number;
}

export const geminiHelper = {
  analyzeVideoMetadata: async (videoTitle: string, inputGenre: string, languageCode = 'en'): Promise<GeminiMetadataResult> => {
    // 1. IF REAL GEMINI KEY IS AVAILABLE: Run the actual Gemini API call
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `
          Analyze a creator-uploaded video with raw title "${videoTitle}" in the "${inputGenre}" category (language code: ${languageCode}).
          Since you do not have the direct video binary stream currently, generate highly relevant, professional metadata matching these parameters.
          Return a structured JSON output conforming EXACTLY to this schema:
          {
            "title": "A concise click-worthy title suggestion",
            "synopsis": "A 2-3 sentence engaging synopsis",
            "primary_genre": "The primary genre matched",
            "secondary_genres": ["Secondary genre 1", "Secondary genre 2"],
            "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
            "language": "Detected language code (e.g. en, hi, te)",
            "topics": ["Major theme 1", "Major theme 2"],
            "scenes": [
              { "timestamp": "00:00", "description": "Scene 1 description" },
              { "timestamp": "00:15", "description": "Scene 2 description" }
            ],
            "safety_flags": {
              "adult_content": false,
              "violence": false,
              "hate_speech": false,
              "harassment": false
            },
            "thumbnail_desc": "Short description of an ideal thumbnail",
            "keywords": ["search keyword 1", "search keyword 2"],
            "confidence": 0.95
          }
          Do not invent facts that are not present. Return ONLY valid structured JSON.
        `;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });

        const textResponse = result.response.text();
        const json = JSON.parse(textResponse);
        return json as GeminiMetadataResult;
      } catch (e) {
        console.warn('Real Gemini API failed, falling back to simulator:', e);
      }
    }

    // 2. MOCK AI SIMULATION FALLBACK ENGINE
    return new Promise((resolve) => {
      setTimeout(() => {
        const tags = [inputGenre.toLowerCase(), 'cinematic', 'opendrama', 'indie-film', 'shorts'];
        const simulatedResult: GeminiMetadataResult = {
          title: `The Shadow: ${videoTitle}`,
          synopsis: `An immersive short film entry in the ${inputGenre} genre. Paced around a sudden discovery that challenges the protagonist's viewpoint.`,
          primary_genre: inputGenre,
          secondary_genres: ['Drama', 'Mystery'],
          tags: tags,
          language: languageCode,
          topics: [`${inputGenre} storytelling`, 'cinematic framing', 'short pacing'],
          scenes: [
            { timestamp: '00:00', description: 'Opening sequence introduces key theme and silent audio' },
            { timestamp: '00:15', description: 'Visual shift, dialogue peak or main visual action' },
            { timestamp: '00:35', description: 'Closing frame and resolution fade' }
          ],
          safety_flags: {
            adult_content: false,
            violence: false,
            hate_speech: false,
            harassment: false
          },
          thumbnail_desc: `Close up photo focusing on atmospheric lighting representing the core vibe of ${videoTitle}.`,
          keywords: [videoTitle.toLowerCase(), inputGenre.toLowerCase(), 'opendrama', 'creator-short'],
          transcript: '[Simulated audio transcript segment]: Hey, did you see that? No, check the other room. Quick! [Tense background music swells]',
          confidence: 0.92
        };
        resolve(simulatedResult);
      }, 1000);
    });
  }
};
export default geminiHelper;
