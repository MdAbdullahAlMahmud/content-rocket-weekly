
-- Fix the ambiguous column reference in get_zapier_usage function
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
