
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
  Calendar,
  Settings,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const ContentGenerator = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  
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

    if (!selectedTopic) {
      toast({
        title: "Topic Required",
        description: "Please select a topic to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      const prompt = `Create a LinkedIn post about "${selectedTopicData?.title}". 
      ${selectedTopicData?.description ? `Context: ${selectedTopicData.description}` : ''}
      ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}
      
      Tone: ${tone}
      Length: ${length}
      
      Make it engaging, professional, and suitable for LinkedIn. Include relevant emojis and hashtags.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt }
      });

      if (error) throw error;
      
      setGeneratedContent(data.generatedText);
      
      // Increment topic usage count
      if (selectedTopicData) {
        await supabase.rpc('increment_topic_usage', { 
          topic_id: selectedTopic 
        });
      }
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSchedule = async () => {
    if (!generatedContent) return;
    
    setIsScheduling(true);
    try {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      
      await addPost({
        topic_id: selectedTopic,
        title: selectedTopicData?.title,
        content: generatedContent,
        status: 'draft'
      });
      
      toast({
        title: "Post Saved",
        description: "Your generated content has been saved as a draft."
      });
      
      // Clear the form
      setGeneratedContent("");
      setSelectedTopic("");
      setCustomPrompt("");
      
    } catch (error: any) {
      toast({
        title: "Error Saving Post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
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
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
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
              <Label className="text-sm font-medium text-slate-700">Select Topic</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedTopic === topic.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="font-medium">{topic.title}</div>
                    {topic.description && (
                      <div className="text-xs text-slate-500 mt-1">{topic.description}</div>
                    )}
                  </button>
                ))}
                {topics.length === 0 && (
                  <div className="p-4 text-center text-slate-500">
                    No topics available. Create some topics first.
                  </div>
                )}
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
              disabled={!selectedTopic || isGenerating || !hasApiKey}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
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
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-white">
                        {topics.find(t => t.id === selectedTopic)?.title}
                      </Badge>
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

                <div className="flex gap-3">
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
                    onClick={handleSchedule}
                    disabled={isScheduling}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isScheduling ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No content generated yet</p>
                <p className="text-sm text-slate-400">Select a topic and click generate to create your first AI post</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentGenerator;
