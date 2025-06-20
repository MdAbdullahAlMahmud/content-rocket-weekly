
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  topic_id?: string;
  title?: string;
  content: string;
  status: 'generated' | 'scheduled' | 'posted' | 'failed' | 'draft' | 'backlog';
  scheduled_date?: string;
  scheduled_time?: string;
  posted_at?: string;
  postly_id?: string;
  linkedin_url?: string;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  created_at: string;
  updated_at: string;
  topics?: {
    title: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          topics (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData: Omit<Post, 'id' | 'engagement_likes' | 'engagement_comments' | 'engagement_shares' | 'created_at' | 'updated_at' | 'topics'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchPosts(); // Refetch to get related data
      toast({
        title: "Post added",
        description: "Your post has been added successfully."
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error adding post",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchPosts(); // Refetch to get updated data
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    addPost,
    updatePost,
    deletePost,
    refetch: fetchPosts
  };
};
