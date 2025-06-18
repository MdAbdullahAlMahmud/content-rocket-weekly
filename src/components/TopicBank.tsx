
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Hash, Brain } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  usageCount: number;
}

const TopicBank = () => {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: "1",
      title: "Developer Career Growth",
      description: "Tips and insights for advancing in software development careers",
      category: "Career",
      priority: "high",
      usageCount: 5
    },
    {
      id: "2", 
      title: "React Best Practices",
      description: "Modern React patterns, hooks, and performance optimization techniques",
      category: "Technical",
      priority: "high",
      usageCount: 8
    },
    {
      id: "3",
      title: "Remote Work Productivity",
      description: "Strategies for staying productive while working remotely",
      category: "Productivity",
      priority: "medium",
      usageCount: 3
    },
    {
      id: "4",
      title: "AI in Software Development",
      description: "How AI tools are changing the way we code and build software",
      category: "Technology",
      priority: "high",
      usageCount: 6
    },
    {
      id: "5",
      title: "Team Leadership",
      description: "Leading development teams and fostering collaboration",
      category: "Leadership",
      priority: "medium",
      usageCount: 2
    }
  ]);

  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTopic = () => {
    if (newTopic.title && newTopic.description) {
      const topic: Topic = {
        id: Date.now().toString(),
        ...newTopic,
        usageCount: 0
      };
      setTopics([...topics, topic]);
      setNewTopic({ title: "", description: "", category: "", priority: "medium" });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteTopic = (id: string) => {
    setTopics(topics.filter(topic => topic.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Career": "bg-blue-100 text-blue-800",
      "Technical": "bg-purple-100 text-purple-800",
      "Productivity": "bg-green-100 text-green-800",
      "Technology": "bg-indigo-100 text-indigo-800",
      "Leadership": "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

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
                <select
                  id="priority"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTopic.priority}
                  onChange={(e) => setNewTopic({ ...newTopic, priority: e.target.value as "high" | "medium" | "low" })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTopic}>
                  Add Topic
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
              {new Set(topics.map(t => t.category)).size}
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
              {Math.round(topics.reduce((acc, t) => acc + t.usageCount, 0) / topics.length) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{topic.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">{topic.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getCategoryColor(topic.category)}>
                      {topic.category}
                    </Badge>
                    <Badge className={getPriorityColor(topic.priority)}>
                      {topic.priority} priority
                    </Badge>
                    <Badge variant="outline" className="bg-slate-50">
                      Used {topic.usageCount} times
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
        ))}
      </div>
    </div>
  );
};

export default TopicBank;
