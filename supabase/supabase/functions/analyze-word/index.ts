// v1.5: Use gemini-2.0-flash model as requested
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the expected structure of the AI's response
interface WordAnalysis {
  rootWord?: string;
  analysis: {
    partOfSpeech: string;
    translation: string;
    exampleSentence: string;
    exampleTranslation: string;
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { word, sourceLanguage, targetLanguage } = await req.json();
    console.log(`Analyzing word: ${word} (${sourceLanguage} -> ${targetLanguage})`);

    if (!word || !sourceLanguage || !targetLanguage) {
      throw new Error('Missing required parameters: word, sourceLanguage, or targetLanguage');
    }
    const lowerCaseWord = word.toLowerCase();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingAnalysis } = await supabaseAdmin
      .from('word_analysis')
      .select('analysis')
      .eq('word', lowerCaseWord)
      .eq('source_language', sourceLanguage)
      .eq('target_language', targetLanguage)
      .maybeSingle();

    if (existingAnalysis) {
      return new Response(JSON.stringify(existingAnalysis.analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const genAIKey = Deno.env.get('GEN_AI_KEY');
    if (!genAIKey) throw new Error('GEN_AI_KEY not found in secrets.');

    const prompt = `
      Analyze the word "${word}" from the language "${sourceLanguage}". 
      Provide a detailed analysis for a person learning "${targetLanguage}".
      The response must be a single, minified JSON object with no markdown formatting.
      The JSON object must have this exact structure:
      {
        "rootWord": "The root or infinitive form of the word, if different. Otherwise, the original word.",
        "analysis": [
          {
            "partOfSpeech": "e.g., Noun, Verb, Adjective",
            "translation": "The most common translation in ${targetLanguage}",
            "exampleSentence": "A simple example sentence in ${sourceLanguage} using the word.",
            "exampleTranslation": "The translation of the example sentence in ${targetLanguage}."
          }
        ]
      }
      If there are multiple common meanings (e.g., noun and verb), include a separate object for each in the "analysis" array.
    `;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${genAIKey}`, // Using user-specified model
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const errorDetails = JSON.stringify(geminiData, null, 2);
      console.error('Gemini API Error:', errorDetails);
      throw new Error(`Gemini API request failed with status ${geminiResponse.status}. Details: ${errorDetails}`);
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      const errorDetails = JSON.stringify(geminiData, null, 2);
      console.error('Invalid response structure from Gemini API:', errorDetails);
      throw new Error(`Invalid response structure from Gemini API. Full response: ${errorDetails}`);
    }

    const newAnalysis: WordAnalysis = JSON.parse(rawText.trim().replace(/```json|```/g, ''));

    await supabaseAdmin
      .from('word_analysis')
      .insert({
        word: lowerCaseWord,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        analysis: newAnalysis,
      });

    return new Response(JSON.stringify(newAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Edge function error:', message);
    return new Response(JSON.stringify({ error: `Function Error: ${message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});