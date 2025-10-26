// v1.7: Add detailed logging for debugging Gemini API response
import { serve } from 'http';
import { createClient } from 'supabase';

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
    console.log(`[START] Analyzing word: ${word} (${sourceLanguage} -> ${targetLanguage})`);

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
      console.log(`[CACHE] Found existing analysis for "${word}"`);
      return new Response(JSON.stringify(existingAnalysis.analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`[API_CALL] No cache found. Calling Gemini API for "${word}".`);
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
            "exampleSentence": "A simple example sentence in ${sourceLanguage} that MUST contain the exact word '${word}'.",
            "exampleTranslation": "The translation of the example sentence in ${targetLanguage}."
          }
        ]
      }
      If there are multiple common meanings (e.g., noun and verb), include a separate object for each in the "analysis" array.
    `;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${genAIKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const geminiData = await geminiResponse.json();
    console.log('[API_RESPONSE] Raw Gemini Data:', JSON.stringify(geminiData, null, 2));

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API request failed with status ${geminiResponse.status}. Details: ${JSON.stringify(geminiData)}`);
    }
    
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error(`Invalid response structure from Gemini API. Full response: ${JSON.stringify(geminiData)}`);
    }
    console.log('[API_RESPONSE] Extracted Raw Text:', rawText);

    let newAnalysis: WordAnalysis;
    try {
      newAnalysis = JSON.parse(rawText.trim().replace(/```json|```/g, ''));
    } catch (parseError) {
      console.error('[PARSE_ERROR] Failed to parse Gemini response:', parseError.message);
      throw new Error(`Failed to parse JSON from Gemini response. Raw text: ${rawText}`);
    }

    console.log(`[DB_INSERT] Storing new analysis for "${word}".`);
    await supabaseAdmin
      .from('word_analysis')
      .insert({
        word: lowerCaseWord,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        analysis: newAnalysis,
      });

    console.log(`[SUCCESS] Successfully processed and stored analysis for "${word}".`);
    return new Response(JSON.stringify(newAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[FATAL_ERROR] Edge function error:', message);
    return new Response(JSON.stringify({ error: `Function Error: ${message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});