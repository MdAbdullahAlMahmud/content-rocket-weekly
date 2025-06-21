
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending scheduled posts that are due
    const now = new Date().toISOString();
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${scheduledPosts?.length || 0} posts ready to send`);

    const results = [];

    for (const scheduledPost of scheduledPosts || []) {
      try {
        console.log(`Processing scheduled post: ${scheduledPost.id}`);

        // Check Zapier usage limit
        const { data: usageData, error: usageError } = await supabase
          .rpc('get_zapier_usage', { p_user_id: scheduledPost.user_id });

        if (usageError) {
          console.error('Error checking usage:', usageError);
          continue;
        }

        const usage = usageData?.[0];
        if (usage && usage.usage_count >= usage.limit_count) {
          console.log(`User ${scheduledPost.user_id} has exceeded Zapier limit`);
          
          // Mark as failed due to limit
          await supabase
            .from('scheduled_posts')
            .update({ status: 'failed' })
            .eq('id', scheduledPost.id);
          
          results.push({
            id: scheduledPost.id,
            status: 'failed',
            reason: 'Usage limit exceeded'
          });
          continue;
        }

        // Send to Zapier
        const zapierPayload = {
          content: scheduledPost.post_content,
          topic: scheduledPost.topic_title,
          timestamp: new Date().toISOString(),
          platform: "linkedin",
          source: "linkedin-ai-scheduler",
          scheduled: true,
          originalScheduledTime: scheduledPost.scheduled_for
        };

        const zapierResponse = await fetch(scheduledPost.zapier_webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(zapierPayload),
        });

        // Increment usage count
        const canProceed = await supabase.rpc('increment_zapier_usage', { 
          p_user_id: scheduledPost.user_id 
        });

        // Update scheduled post status
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduledPost.id);

        // Update the original post status if it exists
        if (scheduledPost.post_id) {
          await supabase
            .from('posts')
            .update({ 
              status: 'posted',
              posted_at: new Date().toISOString()
            })
            .eq('id', scheduledPost.post_id);
        }

        results.push({
          id: scheduledPost.id,
          status: 'sent',
          zapierStatus: zapierResponse.ok ? 'success' : 'warning'
        });

        console.log(`Successfully sent scheduled post: ${scheduledPost.id}`);

      } catch (error) {
        console.error(`Error processing scheduled post ${scheduledPost.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({ status: 'failed' })
          .eq('id', scheduledPost.id);

        results.push({
          id: scheduledPost.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in schedule-posts function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
