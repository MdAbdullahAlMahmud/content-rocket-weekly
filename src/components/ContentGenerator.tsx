
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Sparkles
} from "lucide-react";

const ContentGenerator = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const topics = [
    "React Best Practices",
    "Developer Career Growth", 
    "Remote Work Productivity",
    "AI in Software Development",
    "Team Leadership"
  ];

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
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const sampleContent = `🚀 The future of software development is being reshaped by AI tools, and it's happening faster than most of us anticipated.

After spending the last few months experimenting with various AI coding assistants, I've noticed a fundamental shift in how we approach problem-solving:

✅ Instead of writing code from scratch, we're becoming prompt engineers
✅ Code reviews are evolving to include AI-generated suggestions
✅ Documentation is becoming more interactive and context-aware
✅ Debugging is getting smarter with AI-powered error detection

But here's what really excites me: AI isn't replacing developers - it's amplifying our creativity and freeing us to focus on higher-level architecture and user experience decisions.

The developers who thrive in this new landscape will be those who learn to collaborate effectively with AI tools while maintaining their critical thinking and problem-solving skills.

What's your experience with AI coding tools? Are you finding them helpful or overwhelming?

#AI #SoftwareDevelopment #FutureOfWork #TechTrends #Programming`;

      setGeneratedContent(sampleContent);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSchedule = () => {
    // Implementation for scheduling the post
    console.log("Scheduling post:", generatedContent);
  };

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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
        </div>
      </div>

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
              <div className="grid grid-cols-1 gap-2 mt-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedTopic === topic
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
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
              disabled={!selectedTopic || isGenerating}
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
                        {selectedTopic}
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
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button 
                    onClick={handleSchedule}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Post
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
