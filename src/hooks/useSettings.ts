
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id: string;
  user_id: string;
  openai_api_key?: string;
  postly_api_key?: string;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Pick<UserSettings, 'openai_api_key' | 'postly_api_key'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings' as any)
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      toast({
        title: "Settings updated",
        description: "Your API keys have been saved successfully."
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};
