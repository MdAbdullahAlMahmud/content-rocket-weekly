
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ZapierUsage {
  usage_count: number;
  limit_count: number;
  month_year: string;
}

export const useZapierUsage = () => {
  const [usage, setUsage] = useState<ZapierUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsage = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_zapier_usage', { p_user_id: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setUsage(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching Zapier usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('increment_zapier_usage', { p_user_id: user.id });

      if (error) throw error;
      
      // Refresh usage data
      await fetchUsage();
      
      return data; // Returns true if under limit, false if over
    } catch (error: any) {
      console.error('Error incrementing Zapier usage:', error);
      return false;
    }
  };

  const canUseZapier = () => {
    if (!usage) return true;
    return usage.usage_count < usage.limit_count;
  };

  const getRemainingUsage = () => {
    if (!usage) return 100;
    return Math.max(0, usage.limit_count - usage.usage_count);
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return {
    usage,
    loading,
    fetchUsage,
    incrementUsage,
    canUseZapier,
    getRemainingUsage
  };
};
