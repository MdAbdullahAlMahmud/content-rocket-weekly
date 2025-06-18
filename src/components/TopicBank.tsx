
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Hash, Brain, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopics } from "@/hooks/useTopics";

const TopicBank = () => {
  const { topics, loading, addTopic, deleteTopic } = useTopics();
  
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "high" | "medium" | "low"
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTopic = async () => {
    if (newTopic.title && newTopic.description) {
      setIsSubmitting(true);
      const result = await addTopic(newTopic);
      if (result?.error === null) {
        setNewTopic({ title: "", description: "", category: "", priority: "medium" });
        setIsAddDialogOpen(false);
      }
      setIsSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    await deleteTopic(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Career": "bg-blue-100 text-blue-800 border-blue-200",
      "Technical": "bg-purple-100 text-purple-800 border-purple-200",
      "Productivity": "bg-green-100 text-green-800 border-green-200",
      "Technology": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Leadership": "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const uniqueCategories = Array.from(new Set(topics.map(t => t.category))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Topic Bank</h2>
          <p className="text-slate-600">Manage your content topics for AI generation</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., React Best Practices"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this topic covers..."
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Technical, Career, Productivity"
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTopic.priority} onValueChange={(value: "high" | "medium" | "low") => setNewTopic({ ...newTopic, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTopic} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Topic"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-600">Total Topics</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{topics.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-slate-600">High Priority</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {topics.filter(t => t.priority === "high").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-500" />
              <span className="text-sm text-slate-600">Categories</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {uniqueCategories.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-slate-600">Avg Usage</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {topics.length > 0 ? Math.round(topics.reduce((acc, t) => acc + t.usage_count, 0) / topics.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4">
        {topics.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No topics yet</h3>
              <p className="text-slate-600 mb-4">Create your first topic to start generating content</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Topic
              </Button>
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
            <Card key={topic.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{topic.title}</h3>
                    <p className="text-slate-600 text-sm mb-3">{topic.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.category && (
                        <Badge className={getCategoryColor(topic.category)}>
                          {topic.category}
                        </Badge>
                      )}
                      <Badge className={getPriorityColor(topic.priority)}>
                        {topic.priority} priority
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50">
                        Used {topic.usage_count} times
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TopicBank;
