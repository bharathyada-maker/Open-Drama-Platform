// Deno Supabase Edge Function: analyze-video
// Serves requests to enrich video meta using Google Gemini API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on Edge Function.");
    }

    const { video_id, title, genre, language } = await req.json();

    if (!title || !genre) {
      return new Response(
        JSON.stringify({ error: "Missing required video properties (title, genre)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Google Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const promptText = `
      Analyze a video metadata submission.
      Title: "${title}"
      Category/Genre: "${genre}"
      Language: "${language || 'en'}"
      
      Generate a professional, structured JSON enrichment response. Return exactly this JSON schema:
      {
        "title": "A concise, engaging suggestion",
        "synopsis": "A 2-3 sentence synopsis of the story",
        "primary_genre": "${genre}",
        "secondary_genres": ["Drama", "Mystery"],
        "tags": ["cinema", "indie", "shortform"],
        "topics": ["theme1", "theme2"],
        "scenes": [
          { "timestamp": "00:00", "description": "Opening hook scene" },
          { "timestamp": "00:15", "description": "Action transition scene" }
        ],
        "safety_flags": {
          "adult_content": false,
          "violence": false,
          "hate_speech": false,
          "harassment": false
        },
        "thumbnail_desc": "Visual suggestion for the cover thumbnail art",
        "keywords": ["tag1", "theme"]
      }
      Do not wrap the JSON in markdown codeblocks. Return only the raw JSON.
    `;

    const apiBody = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error code ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = JSON.parse(textResponse);

    return new Response(
      JSON.stringify({ video_id, analysis: cleanJson }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
