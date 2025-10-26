import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface DeepLResponse {
  translations: {
    detected_source_language: string;
    text: string;
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
    const { word, sourceLanguage, targetLanguage, context } = await req.json();

    const deepLKey = Deno.env.get('DEEPL_API_KEY');
    if (!deepLKey) throw new Error('DeepL API key not found in secrets.');

    const langCodeMap: { [key: string]: string } = {
      English: 'EN', Spanish: 'ES', French: 'FR', German: 'DE', Italian: 'IT',
    };

    const apiUrl = deepLKey.endsWith(':fx')
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    const deepLResponse = await fetch(apiUrl, {
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
      const errorBody = await deepLResponse.text();
      console.error('DeepL API Error:', errorBody);
      throw new Error(`DeepL API request failed with status ${deepLResponse.status}: ${errorBody}`);
    }

    const deepLData: DeepLResponse = await deepLResponse.json();
    const primaryTranslation = deepLData?.translations?.[0]?.text;

    if (!primaryTranslation) {
      throw new Error('Invalid response structure from DeepL API.');
    }

    const translationPayload = { primaryTranslation };

    return new Response(JSON.stringify(translationPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Edge function error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});