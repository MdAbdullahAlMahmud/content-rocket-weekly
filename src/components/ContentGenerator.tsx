
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Wand2, 
  Save, 
  Archive,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useTopics } from "@/hooks/useTopics";
import TopicSelectionModal from "./TopicSelectionModal";

const ContentGenerator = () => {
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  
  const { toast } = useToast();
  const { addPost } = usePosts();
  const { topics } = useTopics();

  const handleGenerate = async () => {
    if (selectedTopics.length === 0 && !customPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select at least one topic or provide a custom prompt.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const topicTitles = selectedTopics.map(t => t.title).join(", ");
      const prompt = customPrompt || `Create LinkedIn content about: ${topicTitles}`;
      
      const mockContent = `🚀 Exciting insights on ${topicTitles}!

${customPrompt || `Here's what I've learned about ${topicTitles} and how it can transform your approach...`}

✨ Key takeaways:
• Innovation drives growth
• Collaboration amplifies success
• Continuous learning is essential

What's your experience with ${topicTitles}? I'd love to hear your thoughts!

#LinkedIn #Professional #Growth #Innovation`;

      setGeneratedContent(mockContent);
      
      toast({
        title: "Content Generated!",
        description: "Your LinkedIn post has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSaveAction = async (status: 'draft' | 'backlog') => {
    if (!generatedContent.trim()) {
      toast({
        title: "No Content",
        description: "Please generate content first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const topicId = selectedTopics.length > 0 ? selectedTopics[0].id : undefined;
      
      await addPost({
        content: generatedContent,
        status,
        topic_id: topicId,
        title: selectedTopics.length > 0 ? selectedTopics[0].title : undefined
      });

      const statusMessages = {
        draft: "Content saved as draft",
        backlog: "Content saved to backlog"
      };

      toast({
        title: "Success!",
        description: statusMessages[status]
      });

      // Reset form
      setGeneratedContent("");
      setSelectedTopics([]);
      setCustomPrompt("");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeSelectedTopic = (topicId: string) => {
    setSelectedTopics(prev => prev.filter(t => t.id !== topicId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Content Generator</h2>
        <p className="text-slate-600">Create engaging LinkedIn posts with AI assistance</p>
      </div>

      {/* Topic Selection */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Topic Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowTopicModal(true)}
              variant="outline"
              className="border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              {selectedTopics.length > 0 ? "Change Topics" : "Select Topics"}
            </Button>
            <span className="text-sm text-slate-600">
              {topics.length} topics available
            </span>
          </div>

          {selectedTopics.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Topics:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <Badge
                    key={topic.id}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                    onClick={() => removeSelectedTopic(topic.id)}
                  >
                    {topic.title} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Prompt */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Custom Prompt (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add specific instructions or context for your LinkedIn post..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (selectedTopics.length === 0 && !customPrompt.trim())}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 border">
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={12}
                className="resize-none border-0 bg-transparent focus:ring-0"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-between">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                className="text-purple-700 border-purple-300 hover:bg-purple-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveAction('draft')}
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Draft
                </Button>
                <Button
                  onClick={() => handleSaveAction('backlog')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Save to Backlog
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Selection Modal */}
      <TopicSelectionModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
      />
    </div>
  );
};

export default ContentGenerator;
