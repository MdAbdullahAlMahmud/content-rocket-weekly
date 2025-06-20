import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Tag, 
  Plus, 
  Check,
  Filter,
  X
} from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useToast } from "@/hooks/use-toast";

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopics: any[];
  onTopicsChange: (topics: any[]) => void;
}

const TopicSelectionModal = ({ isOpen, onClose, selectedTopics, onTopicsChange }: TopicSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bulkTopics, setBulkTopics] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedTopics.map(t => t.id));
  
  const { topics, addTopic } = useTopics();
  const { toast } = useToast();

  const categories = useMemo(() => {
    const cats = [...new Set(topics.map(topic => topic.category))];
    return ["all", ...cats];
  }, [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           topic.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [topics, searchTerm, selectedCategory]);

  const handleTopicToggle = (topicId: string) => {
    setTempSelected(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredTopics.map(topic => topic.id);
    setTempSelected(prev => {
      const filtered = prev.filter(id => !allFilteredIds.includes(id));
      return [...filtered, ...allFilteredIds];
    });
  };

  const handleDeselectAll = () => {
    const allFilteredIds = filteredTopics.map(topic => topic.id);
    setTempSelected(prev => prev.filter(id => !allFilteredIds.includes(id)));
  };

  const handleBulkAdd = async () => {
    if (!bulkTopics.trim()) return;

    const topicLines = bulkTopics.split('\n').filter(line => line.trim());
    const newTopics = [];

    for (const line of topicLines) {
      const parts = line.split('|').map(part => part.trim());
      const title = parts[0];
      const description = parts[1] || "";
      const category = parts[2] || "General";

      if (title) {
        newTopics.push({ title, description, category });
      }
    }

    try {
      for (const topic of newTopics) {
        await addTopic(topic);
      }
      
      toast({
        title: "Topics Added",
        description: `Successfully added ${newTopics.length} topics.`
      });
      
      setBulkTopics("");
      setShowBulkAdd(false);
    } catch (error) {
      toast({
        title: "Error Adding Topics",
        description: "Failed to add some topics. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApply = () => {
    const selectedTopicObjects = topics.filter(topic => tempSelected.includes(topic.id));
    onTopicsChange(selectedTopicObjects);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedTopics.map(t => t.id));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-500" />
            Select Topics ({tempSelected.length} selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md text-sm bg-white min-w-[120px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredTopics.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Select All ({filteredTopics.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={tempSelected.length === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Deselect All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Bulk Add
            </Button>
          </div>

          {/* Bulk Add Section */}
          {showBulkAdd && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <Label className="text-sm font-medium mb-2 block">
                Bulk Add Topics (Format: Title | Description | Category)
              </Label>
              <Textarea
                placeholder="Social Media Marketing | Tips for better engagement | Marketing&#10;LinkedIn Strategy | How to optimize your profile | Professional&#10;Content Creation | AI tools for creators | Technology"
                value={bulkTopics}
                onChange={(e) => setBulkTopics(e.target.value)}
                rows={4}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleBulkAdd} size="sm">
                  Add Topics
                </Button>
                <Button
                  onClick={() => {
                    setBulkTopics("");
                    setShowBulkAdd(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Topics List */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">No topics found</p>
                  <p className="text-sm text-slate-400">
                    {searchTerm ? "Try different search terms" : "Add some topics to get started"}
                  </p>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50 ${
                      tempSelected.includes(topic.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                    }`}
                    onClick={() => handleTopicToggle(topic.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={tempSelected.includes(topic.id)}
                        onChange={() => handleTopicToggle(topic.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{topic.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {topic.category}
                          </Badge>
                          {topic.usage_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Used {topic.usage_count}x
                            </Badge>
                          )}
                        </div>
                        {topic.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="text-sm text-slate-600">
              {tempSelected.length} topic{tempSelected.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopicSelectionModal;
