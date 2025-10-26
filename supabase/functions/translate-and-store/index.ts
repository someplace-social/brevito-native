import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the structure of the DeepL API response
interface DeepLResponse {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
}

// CORS headers for preflight and response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { word, sourceLanguage, targetLanguage, context } = await req.json();
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Check if translation already exists in the database
    const { data: existingTranslation, error: selectError } = await supabaseClient
      .from('word_translations')
      .select('translation')
      .eq('word', word.toLowerCase())
      .eq('source_language', sourceLanguage)
      .eq('target_language', targetLanguage)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingTranslation) {
      return new Response(JSON.stringify(existingTranslation.translation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. If not, call DeepL API
    const deepLKey = Deno.env.get('DEEPL_API_KEY');
    if (!deepLKey) throw new Error('DeepL API key not found.');

    const langCodeMap: { [key: string]: string } = {
      English: 'EN', Spanish: 'ES', French: 'FR', German: 'DE', Italian: 'IT',
    };

    const deepLResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deepLKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [word],
        source_lang: langCodeMap[sourceLanguage],
        target_lang: langCodeMap[targetLanguage],
        context: context,
      }),
    });

    if (!deepLResponse.ok) {
      throw new Error(`DeepL API request failed with status ${deepLResponse.status}`);
    }

    const deepLData: DeepLResponse = await deepLResponse.json();
    const primaryTranslation = deepLData?.translations?.[0]?.text;

    if (!primaryTranslation) {
      throw new Error('Invalid response from DeepL API.');
    }

    const translationPayload = { primaryTranslation };

    // 3. Store the new translation in the database
    const { error: insertError } = await supabaseClient
      .from('word_translations')
      .insert({
        word: word.toLowerCase(),
        source_language: sourceLanguage,
        target_language: targetLanguage,
        context: context,
        translation: translationPayload,
      });

    if (insertError) {
      // It's possible another user requested the same word. Ignore duplicate errors.
      if (insertError.code !== '23505') { 
        throw insertError;
      }
    }

    // 4. Return the new translation to the client
    return new Response(JSON.stringify(translationPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});