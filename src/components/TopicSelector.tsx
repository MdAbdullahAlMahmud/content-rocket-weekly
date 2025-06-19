
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, X, Star, Clock } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";

interface TopicSelectorProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
}

const TopicSelector = ({ selectedTopics, onTopicsChange }: TopicSelectorProps) => {
  const { topics } = useTopics();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  // Filter topics based on search and other criteria
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showFavorites) {
      return matchesSearch && topic.priority === 'high';
    }
    if (showRecent) {
      return matchesSearch && topic.usage_count > 0;
    }
    
    return matchesSearch;
  });

  // Group topics by category
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const category = topic.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(topic);
    return acc;
  }, {} as Record<string, typeof topics>);

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      onTopicsChange(selectedTopics.filter(id => id !== topicId));
    } else {
      onTopicsChange([...selectedTopics, topicId]);
    }
  };

  const removeSelectedTopic = (topicId: string) => {
    onTopicsChange(selectedTopics.filter(id => id !== topicId));
  };

  const clearAllTopics = () => {
    onTopicsChange([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700">Select Topics</Label>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-2 mt-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowRecent(false);
            }}
          >
            <Star className="h-4 w-4 mr-1" />
            Favorites
          </Button>
          <Button
            variant={showRecent ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowRecent(!showRecent);
              setShowFavorites(false);
            }}
          >
            <Clock className="h-4 w-4 mr-1" />
            Recent
          </Button>
        </div>

        {/* Selected Topics */}
        {selectedTopics.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Selected ({selectedTopics.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTopics}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map(topicId => {
                const topic = topics.find(t => t.id === topicId);
                return topic ? (
                  <Badge
                    key={topicId}
                    variant="default"
                    className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                  >
                    {topic.title}
                    <button
                      onClick={() => removeSelectedTopic(topicId)}
                      className="ml-2 hover:bg-blue-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Topics by Category */}
      <Card className="max-h-64 overflow-y-auto">
        <CardContent className="p-4">
          {Object.keys(groupedTopics).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No topics found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTopics).map(([category, categoryTopics]) => (
                <div key={category}>
                  <h4 className="font-medium text-slate-900 mb-2 text-sm">{category}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categoryTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`p-3 text-left rounded-lg border transition-all text-sm ${
                          selectedTopics.includes(topic.id)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{topic.title}</div>
                            {topic.description && (
                              <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {topic.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {topic.priority === 'high' && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            {topic.usage_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {topic.usage_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicSelector;
