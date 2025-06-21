
-- Create table to track Zapier usage
CREATE TABLE public.zapier_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-06')
  usage_count INTEGER NOT NULL DEFAULT 0,
  limit_count INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.zapier_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own zapier usage" 
  ON public.zapier_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own zapier usage" 
  ON public.zapier_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zapier usage" 
  ON public.zapier_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_zapier_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
  current_usage INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Insert or update usage record
  INSERT INTO public.zapier_usage (user_id, month_year, usage_count)
  VALUES (p_user_id, current_month, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    usage_count = zapier_usage.usage_count + 1,
    updated_at = NOW();
  
  -- Check if usage exceeds limit
  SELECT usage_count INTO current_usage
  FROM public.zapier_usage
  WHERE user_id = p_user_id AND month_year = current_month;
  
  RETURN current_usage <= 100;
END;
$$;

-- Create function to get current usage
CREATE OR REPLACE FUNCTION public.get_zapier_usage(p_user_id UUID)
RETURNS TABLE(usage_count INTEGER, limit_count INTEGER, month_year TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Insert record if it doesn't exist
  INSERT INTO public.zapier_usage (user_id, month_year, usage_count)
  VALUES (p_user_id, current_month, 0)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN QUERY
  SELECT zu.usage_count, zu.limit_count, zu.month_year
  FROM public.zapier_usage zu
  WHERE zu.user_id = p_user_id AND zu.month_year = current_month;
END;
$$;

-- Create table for scheduled posts
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  zapier_webhook_url TEXT NOT NULL,
  post_content TEXT NOT NULL,
  topic_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scheduled posts" 
  ON public.scheduled_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts" 
  ON public.scheduled_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" 
  ON public.scheduled_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_zapier_usage_updated_at
  BEFORE UPDATE ON public.zapier_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
