
import { useEffect, useState } from 'react';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { defaultTopics } from '@/utils/defaultTopics';

export const useDefaultTopics = () => {
  const { topics, addTopic, loading } = useTopics();
  const { user } = useAuth();
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    const populateDefaultTopics = async () => {
      if (!user || loading || topics.length > 0 || isPopulating) return;
      
      setIsPopulating(true);
      
      try {
        // Add default topics one by one
        for (const topic of defaultTopics) {
          await addTopic(topic);
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Error populating default topics:', error);
      } finally {
        setIsPopulating(false);
      }
    };

    // Only populate if user exists, topics are loaded, and no topics exist
    if (user && !loading && topics.length === 0) {
      populateDefaultTopics();
    }
  }, [user, loading, topics.length, addTopic, isPopulating]);

  return { isPopulating };
};
