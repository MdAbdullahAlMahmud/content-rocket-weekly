
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { topicId, topicTitle, topicDescription, tone, length, customPrompt, userContext } = parsedBody;
    
    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get user's OpenAI API key
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key) {
      throw new Error('OpenAI API key not found. Please add it in Settings.');
    }

    // Build the prompt with proper context
    let systemPrompt = 'You are a professional LinkedIn content creator. Create engaging, authentic posts that drive engagement and provide value to the audience.';
    
    if (userContext) {
      systemPrompt += ` The user's professional context: ${userContext}`;
    }

    let userPrompt = '';
    
    // If custom prompt is provided, use it as the primary instruction
    if (customPrompt && customPrompt.trim()) {
      userPrompt = customPrompt;
      
      // Add topic context if available
      if (topicTitle) {
        userPrompt += ` Focus on the topic: "${topicTitle}".`;
      }
      if (topicDescription) {
        userPrompt += ` Topic context: ${topicDescription}`;
      }
    } else {
      // Use topic-based generation
      userPrompt = `Create a professional LinkedIn post about "${topicTitle}".`;
      if (topicDescription) {
        userPrompt += ` Context: ${topicDescription}`;
      }
    }

    userPrompt += ` The tone should be ${tone}.`;
    
    const lengthInstructions = {
      short: "Keep it concise, around 150-200 words.",
      medium: "Make it medium length, around 200-300 words.",
      long: "Make it comprehensive, around 300-400 words."
    };
    
    userPrompt += ` ${lengthInstructions[length as keyof typeof lengthInstructions] || lengthInstructions.medium}`;
    userPrompt += " Include relevant emojis and hashtags. Make it engaging and suitable for LinkedIn.";

    console.log('Generating content with system prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Content generated successfully');

    // Save the generated post to database
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        topic_id: topicId,
        content: generatedContent,
        status: 'generated'
      })
      .select()
      .single();

    if (postError) {
      console.error('Error saving post:', postError);
      throw postError;
    }

    // Update topic usage count
    if (topicId) {
      await supabase.rpc('increment_topic_usage', { topic_id: topicId });
    }

    return new Response(JSON.stringify({ 
      content: generatedContent,
      postId: post.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
