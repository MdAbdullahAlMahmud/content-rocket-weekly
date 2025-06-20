
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Wand2, 
  RefreshCw, 
  Copy, 
  Check, 
  Save,
  Send,
  Sparkles,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import TopicSelector from "./TopicSelector";
import PostScheduler from "./PostScheduler";
import TopicSelectionModal from "./TopicSelectionModal";

const ContentGenerator = () => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPostId, setGeneratedPostId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  
  const { topics } = useTopics();
  const { settings } = useSettings();
  const { addPost } = usePosts();
  const { toast } = useToast();

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "inspirational", label: "Inspirational" },
    { value: "educational", label: "Educational" },
    { value: "personal", label: "Personal" }
  ];

  const lengthOptions = [
    { value: "short", label: "Short (150-200 words)" },
    { value: "medium", label: "Medium (200-300 words)" },
    { value: "long", label: "Long (300-400 words)" }
  ];

  const handleGenerate = async () => {
    if (!settings?.openai_api_key) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please add your OpenAI API key in Settings first.",
        variant: "destructive"
      });
      return;
    }

    if (selectedTopics.length === 0) {
      toast({
        title: "Topic Required",
        description: "Please select at least one topic to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Connecting to OpenAI...");
    
    try {
      const selectedTopicData = topics.find(t => selectedTopics.includes(t.id));
      
      setGenerationStatus("Generating content...");
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          topicId: selectedTopics[0],
          topicTitle: selectedTopicData?.title,
          topicDescription: selectedTopicData?.description,
          tone,
          length,
          customPrompt
        }
      });

      if (error) throw error;
      
      setGeneratedContent(data.content);
      setGeneratedPostId(data.postId);
      setGenerationStatus("Content generated successfully!");
      
      toast({
        title: "Content Generated",
        description: "Your LinkedIn post has been created successfully!"
      });
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
      setGenerationStatus("");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationStatus(""), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard."
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!generatedContent) return;
    
    setIsSaving(true);
    try {
      const selectedTopicData = topics.find(t => selectedTopics.includes(t.id));
      
      await addPost({
        topic_id: selectedTopics[0],
        title: selectedTopicData?.title,
        content: generatedContent,
        status: 'draft'
      });
      
      toast({
        title: "Draft Saved",
        description: "Your generated content has been saved as a draft."
      });
      
      setGeneratedContent("");
      setGeneratedPostId(null);
      setSelectedTopics([]);
      setCustomPrompt("");
      
    } catch (error: any) {
      toast({
        title: "Error Saving Draft",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToPostly = () => {
    if (!generatedContent || !generatedPostId) {
      toast({
        title: "No Content to Publish",
        description: "Please generate content first.",
        variant: "destructive"
      });
      return;
    }
    setShowScheduler(true);
  };

  const getSelectedTopicTitle = () => {
    if (selectedTopics.length === 0) return "";
    const topic = topics.find(t => t.id === selectedTopics[0]);
    return topic?.title || "";
  };

  const getSelectedTopicTitles = () => {
    return selectedTopics.map(id => {
      const topic = topics.find(t => t.id === id);
      return topic?.title || "";
    }).filter(Boolean);
  };

  const handleTopicSelection = (topicIds: string[]) => {
    setSelectedTopics(topicIds);
    setShowTopicModal(false);
  };

  const removeSelectedTopic = (topicId: string) => {
    setSelectedTopics(prev => prev.filter(id => id !== topicId));
  };

  const hasApiKey = !!settings?.openai_api_key;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Generator</h2>
          <p className="text-slate-600">Create AI-powered LinkedIn posts from your topics</p>
        </div>
      </div>

      {!hasApiKey && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please add your OpenAI API key in Settings to start generating content.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generation Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Selected Topics ({selectedTopics.length})
              </Label>
              
              <div className="space-y-3">
                {/* Selected Topics Display */}
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedTopicTitles().map((title, index) => (
                      <Badge 
                        key={selectedTopics[index]} 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-red-100 hover:text-red-800 hover:border-red-200 transition-colors"
                        onClick={() => removeSelectedTopic(selectedTopics[index])}
                      >
                        {title} ×
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Topic Selection Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowTopicModal(true)}
                  className="w-full justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedTopics.length === 0 ? "Select Topics" : "Add More Topics"}
                </Button>
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium text-slate-700">
                Custom Prompt (Optional)
              </Label>
              <Textarea
                id="prompt"
                placeholder="Add specific instructions or context for the AI..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Tone Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Tone</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      tone === option.value
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Length</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLength(option.value)}
                    className={`p-2 text-left rounded-lg border text-sm transition-all ${
                      length === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={selectedTopics.length === 0 || isGenerating || !hasApiKey}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {generationStatus || "Generating..."}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {getSelectedTopicTitles().map((title, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {title}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="bg-white capitalize">
                        {tone}
                      </Badge>
                      <Badge variant="outline" className="bg-white capitalize">
                        {length}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="flex-shrink-0"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-line">{generatedContent}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating || !hasApiKey}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button 
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Draft
                  </Button>
                  <Button 
                    onClick={handlePublishToPostly}
                    disabled={!generatedContent || !generatedPostId}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No content generated yet</p>
                <p className="text-sm text-slate-400">Select topics and click generate to create your first AI post</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic Selection Modal */}
      <TopicSelectionModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        selectedTopics={selectedTopics}
        onTopicsChange={handleTopicSelection}
      />

      {/* Post Scheduler Modal */}
      <PostScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        content={generatedContent}
        topicTitle={getSelectedTopicTitle()}
        postId={generatedPostId}
      />
    </div>
  );
};

export default ContentGenerator;
