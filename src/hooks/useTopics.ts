
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTopics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching topics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTopic = async (topicData: Omit<Topic, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          ...topicData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setTopics(prev => [data, ...prev]);
      toast({
        title: "Topic added",
        description: "Your topic has been added successfully."
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error adding topic",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTopics(prev => prev.map(topic => topic.id === id ? data : topic));
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating topic",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTopics(prev => prev.filter(topic => topic.id !== id));
      toast({
        title: "Topic deleted",
        description: "Your topic has been deleted successfully."
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting topic",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [user]);

  return {
    topics,
    loading,
    addTopic,
    updateTopic,
    deleteTopic,
    refetch: fetchTopics
  };
};
