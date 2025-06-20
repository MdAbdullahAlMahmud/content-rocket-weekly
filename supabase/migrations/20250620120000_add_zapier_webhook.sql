
-- Add zapier_webhook_url column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN zapier_webhook_url TEXT;
