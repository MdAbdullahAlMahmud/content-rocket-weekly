
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Brain, 
  CheckCircle,
  ArrowLeft,
  Settings as SettingsIcon
} from "lucide-react";
import TopicBank from "@/components/TopicBank";
import PostQueue from "@/components/PostQueue";
import ContentGenerator from "@/components/ContentGenerator";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTopics } from "@/hooks/useTopics";
import { usePosts } from "@/hooks/usePosts";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  onBack: () => void;
}

const Dashboard = ({ onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { topics } = useTopics();
  const { posts } = usePosts();
  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab topics={topics} posts={posts} />;
      case "topics":
        return <TopicBank />;
      case "posts":
        return <PostQueue />;
      case "generate":
        return <ContentGenerator />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab topics={topics} posts={posts} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      LinkedIn AI Scheduler
                    </h1>
                    <p className="text-sm text-slate-600">Automate your LinkedIn content strategy</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Connected
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('settings')}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const OverviewTab = ({ topics, posts }: { topics: any[], posts: any[] }) => {
  const thisWeekPosts = posts.filter(post => {
    if (!post.scheduled_date) return false;
    const postDate = new Date(post.scheduled_date);
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return postDate >= weekStart && postDate < weekEnd;
  });

  const successfulPosts = posts.filter(p => p.status === "posted").length;
  const totalAttemptedPosts = posts.filter(p => p.status === "posted" || p.status === "failed").length;
  const successRate = totalAttemptedPosts > 0 ? Math.round((successfulPosts / totalAttemptedPosts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{thisWeekPosts.length} Posts</div>
            <p className="text-xs text-slate-600 mt-1">Scheduled this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Topics Ready</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{topics.length} Topics</div>
            <p className="text-xs text-slate-600 mt-1">In your knowledge bank</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{successRate}%</div>
            <p className="text-xs text-slate-600 mt-1">Posts published successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50">
                <div className={`w-2 h-2 rounded-full ${
                  post.status === 'posted' ? 'bg-green-500' : 
                  post.status === 'scheduled' ? 'bg-blue-500' :
                  post.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Post {post.status === 'posted' ? 'published' : 
                           post.status === 'scheduled' ? 'scheduled' :
                           post.status === 'failed' ? 'failed' : 'generated'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600">No activity yet. Start by creating some topics and generating content!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Manage your account and application preferences</p>
      </div>
      
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Settings panel coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
