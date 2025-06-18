
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
    const { postId, scheduledDate, scheduledTime } = await req.json();
    
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

    // Get user's Postly API key
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('postly_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.postly_api_key) {
      throw new Error('Postly API key not found. Please add it in Settings.');
    }

    // Get the post content
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    console.log('Posting to Postly:', { postId, content: post.content.substring(0, 50) + '...' });

    // Prepare the post data for Postly
    const postData = {
      content: post.content,
      platforms: ['linkedin'], // Default to LinkedIn
      ...(scheduledDate && scheduledTime && {
        scheduled_at: `${scheduledDate}T${scheduledTime}:00Z`
      })
    };

    // Call Postly API (Note: This is a placeholder - adjust based on actual Postly API)
    const response = await fetch('https://api.postly.com/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.postly_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Postly API error:', errorData);
      throw new Error(`Postly API error: ${response.status}`);
    }

    const postlyResponse = await response.json();
    console.log('Postly response:', postlyResponse);

    // Update the post with Postly information
    const updateData: any = {
      postly_id: postlyResponse.id,
      status: scheduledDate ? 'scheduled' : 'posted',
      ...(scheduledDate && { scheduled_date: scheduledDate }),
      ...(scheduledTime && { scheduled_time: scheduledTime }),
      ...(!scheduledDate && { posted_at: new Date().toISOString() })
    };

    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      postlyId: postlyResponse.id,
      status: updateData.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in post-to-postly function:', error);
    
    // Mark post as failed if we have a postId
    try {
      const { postId } = await req.json();
      if (postId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', postId);
      }
    } catch (updateError) {
      console.error('Error marking post as failed:', updateError);
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to post to Postly' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
