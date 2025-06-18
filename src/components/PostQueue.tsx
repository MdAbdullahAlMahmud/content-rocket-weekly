
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Edit, 
  Trash2,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  topic: string;
  status: "generated" | "scheduled" | "posted" | "failed";
  scheduledDate: string;
  scheduledTime: string;
  postlyId?: string;
  linkedinUrl?: string;
  createdAt: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

const PostQueue = () => {
  const [posts] = useState<Post[]>([
    {
      id: "1",
      content: "🚀 Just discovered an amazing React pattern that has completely changed how I approach component composition...\n\nThe compound component pattern allows you to create flexible, reusable components that maintain clean APIs while giving users maximum control over rendering.\n\nHere's what makes it powerful:\n✅ Separation of concerns\n✅ Flexible composition\n✅ Clean prop drilling solution\n✅ Better developer experience\n\nHave you used this pattern in your projects? What's your favorite React pattern?\n\n#React #WebDevelopment #JavaScript #Frontend",
      topic: "React Best Practices",
      status: "posted",
      scheduledDate: "2024-01-15",
      scheduledTime: "10:00",
      postlyId: "px_123456",
      linkedinUrl: "https://linkedin.com/posts/...",
      createdAt: "2024-01-14",
      engagement: { likes: 42, comments: 8, shares: 5 }
    },
    {
      id: "2", 
      content: "💡 Career growth isn't just about technical skills...\n\nAfter 5 years in tech, I've learned that the most successful developers master these 'soft' skills:\n\n🎯 Communication - Explaining complex concepts simply\n🤝 Collaboration - Working effectively with diverse teams\n📈 Business thinking - Understanding the 'why' behind features\n🔄 Adaptability - Embracing change and new technologies\n⚡ Problem-solving - Breaking down complex challenges\n\nTechnical skills get you in the door, but these skills accelerate your career.\n\nWhich skill has had the biggest impact on your career?\n\n#CareerGrowth #SoftwareDevelopment #ProfessionalDevelopment",
      topic: "Developer Career Growth",
      status: "scheduled",
      scheduledDate: "2024-01-17",
      scheduledTime: "10:00",
      postlyId: "px_123457",
      createdAt: "2024-01-14"
    },
    {
      id: "3",
      content: "🏠 Remote work productivity secrets from 3 years of distributed teams...\n\nWorking remotely taught me that productivity isn't about hours logged - it's about intentional habits:\n\n⏰ Time blocking - Dedicated focus periods for deep work\n🎯 Clear boundaries - Physical and mental separation of work/life\n📱 Async communication - Respect for different schedules\n🌱 Continuous learning - Investing in skills during flexible hours\n💪 Health first - Regular breaks and movement\n\nThe key? Treat remote work as a skill to develop, not just a location change.\n\nWhat's your best remote work tip?\n\n#RemoteWork #Productivity #WorkFromHome #DistributedTeams",
      topic: "Remote Work Productivity", 
      status: "generated",
      scheduledDate: "2024-01-19",
      scheduledTime: "10:00",
      createdAt: "2024-01-14"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "generated": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted": return <CheckCircle className="h-4 w-4" />;
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "generated": return <RefreshCw className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterPostsByStatus = (status: string) => {
    if (status === "all") return posts;
    return posts.filter(post => post.status === status);
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(post.status)}>
                {getStatusIcon(post.status)}
                <span className="ml-1 capitalize">{post.status}</span>
              </Badge>
              <Badge variant="outline" className="bg-slate-50">
                {post.topic}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.scheduledDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.scheduledTime}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            {post.status === "generated" && (
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {post.linkedinUrl && (
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-line">
              {post.content}
            </p>
          </div>
          
          {post.engagement && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>👍 {post.engagement.likes}</span>
              <span>💬 {post.engagement.comments}</span>
              <span>🔄 {post.engagement.shares}</span>
            </div>
          )}
          
          {post.postlyId && (
            <div className="text-xs text-slate-500">
              Postly ID: {post.postlyId}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Post Queue</h2>
          <p className="text-slate-600">Manage your scheduled and published LinkedIn posts</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Posts
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-slate-600">Posted</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {posts.filter(p => p.status === "posted").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-600">Scheduled</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {posts.filter(p => p.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-slate-600">Generated</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {posts.filter(p => p.status === "generated").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-slate-600">Failed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {posts.filter(p => p.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">All Posts</TabsTrigger>
          <TabsTrigger value="generated" className="data-[state=active]:bg-white">Generated</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-white">Scheduled</TabsTrigger>
          <TabsTrigger value="posted" className="data-[state=active]:bg-white">Posted</TabsTrigger>
          <TabsTrigger value="failed" className="data-[state=active]:bg-white">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="mt-6">
          <div className="grid gap-4">
            {filterPostsByStatus("generated").map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="grid gap-4">
            {filterPostsByStatus("scheduled").map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posted" className="mt-6">
          <div className="grid gap-4">
            {filterPostsByStatus("posted").map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <div className="grid gap-4">
            {filterPostsByStatus("failed").map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostQueue;
