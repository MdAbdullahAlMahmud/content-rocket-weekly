
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Brain, 
  CheckCircle,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TopicBank from "@/components/TopicBank";
import PostQueue from "@/components/PostQueue";
import ContentGenerator from "@/components/ContentGenerator";
import Settings from "@/components/Settings";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTopics } from "@/hooks/useTopics";
import { usePosts } from "@/hooks/usePosts";
import { useDefaultTopics } from "@/hooks/useDefaultTopics";

interface DashboardProps {
  onBack: () => void;
}

const Dashboard = ({ onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { topics } = useTopics();
  const { posts } = usePosts();
  const { isPopulating } = useDefaultTopics();

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
        return <Settings />;
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
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    LinkedIn AI Scheduler
                  </h1>
                  <p className="text-sm text-slate-600">Automate your LinkedIn content strategy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isPopulating && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Setting up topics...
                  </Badge>
                )}
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

  // Calculate total engagement
  const totalEngagement = posts.reduce((acc, post) => ({
    likes: acc.likes + (post.engagement_likes || 0),
    comments: acc.comments + (post.engagement_comments || 0),
    shares: acc.shares + (post.engagement_shares || 0)
  }), { likes: 0, comments: 0, shares: 0 });

  // Post status distribution for pie chart
  const statusData = [
    { name: 'Posted', value: posts.filter(p => p.status === 'posted').length, color: '#10B981' },
    { name: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, color: '#3B82F6' },
    { name: 'Generated', value: posts.filter(p => p.status === 'generated').length, color: '#F59E0B' },
    { name: 'Backlog', value: posts.filter(p => p.status === 'backlog').length, color: '#8B5CF6' },
    { name: 'Draft', value: posts.filter(p => p.status === 'draft').length, color: '#6B7280' },
    { name: 'Failed', value: posts.filter(p => p.status === 'failed').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Real weekly activity data based on actual posts
  const getWeeklyData = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    return weekDays.map((day, index) => {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + index);
      
      const dayPosts = posts.filter(post => {
        const postDate = post.scheduled_date ? new Date(post.scheduled_date) : new Date(post.created_at);
        return postDate.toDateString() === currentDay.toDateString();
      });
      
      const dayEngagement = dayPosts.reduce((acc, post) => 
        acc + (post.engagement_likes || 0) + (post.engagement_comments || 0) + (post.engagement_shares || 0), 0
      );
      
      return {
        day,
        posts: dayPosts.length,
        engagement: dayEngagement
      };
    });
  };

  const weeklyData = getWeeklyData();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{thisWeekPosts.length}</div>
            <p className="text-xs text-slate-600 mt-1">Posts scheduled</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Topics Ready</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{topics.length}</div>
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

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalEngagement.likes + totalEngagement.comments + totalEngagement.shares}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {totalEngagement.likes} likes • {totalEngagement.comments} comments • {totalEngagement.shares} shares
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Post Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Post Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No posts yet</p>
                  <p className="text-sm text-slate-400">Create some content to see the distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#3B82F6" name="Posts" />
                  <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity with Content Preview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  post.status === 'posted' ? 'bg-green-500' : 
                  post.status === 'scheduled' ? 'bg-blue-500' :
                  post.status === 'backlog' ? 'bg-purple-500' :
                  post.status === 'generated' ? 'bg-yellow-500' :
                  post.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-slate-900">
                      Post {post.status === 'posted' ? 'published' : 
                             post.status === 'scheduled' ? 'scheduled' :
                             post.status === 'backlog' ? 'added to backlog' :
                             post.status === 'failed' ? 'failed' : 'generated'}
                    </p>
                    {post.topics?.title && (
                      <Badge variant="outline" className="text-xs">
                        {post.topics.title}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString()}
                  </p>
                  <div className="bg-white rounded-md p-3 border border-slate-200">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  {(post.engagement_likes > 0 || post.engagement_comments > 0 || post.engagement_shares > 0) && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>👍 {post.engagement_likes}</span>
                      <span>💬 {post.engagement_comments}</span>
                      <span>🔄 {post.engagement_shares}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No activity yet. Start by creating some topics and generating content!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
