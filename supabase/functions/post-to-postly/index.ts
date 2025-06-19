
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, content, scheduledDate, scheduledTime } = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's Postly API key
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('postly_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.postly_api_key) {
      throw new Error('Postly API key not found. Please add your Postly API key in Settings.');
    }

    // Post to Postly API
    const postlyResponse = await fetch('https://api.postly.io/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.postly_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        platforms: ['linkedin'],
        scheduled_at: scheduledDate && scheduledTime ? 
          `${scheduledDate}T${scheduledTime}:00.000Z` : undefined
      }),
    });

    if (!postlyResponse.ok) {
      const errorData = await postlyResponse.text();
      throw new Error(`Postly API error: ${errorData}`);
    }

    const postlyData = await postlyResponse.json();

    // Update the post in our database
    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({
        status: scheduledDate ? 'scheduled' : 'posted',
        postly_id: postlyData.id,
        posted_at: scheduledDate ? null : new Date().toISOString(),
        scheduled_date: scheduledDate || null,
        scheduled_time: scheduledTime || null,
      })
      .eq('id', postId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      postlyData,
      message: scheduledDate ? 'Post scheduled successfully' : 'Post published successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in post-to-postly function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
