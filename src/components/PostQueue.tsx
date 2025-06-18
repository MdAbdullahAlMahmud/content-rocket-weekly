
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
  RefreshCw,
  Loader2
} from "lucide-react";
import { usePosts } from "@/hooks/usePosts";

const PostQueue = () => {
  const { posts, loading, deletePost } = usePosts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted": return "bg-green-100 text-green-800 border-green-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "generated": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft": return "bg-purple-100 text-purple-800 border-purple-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted": return <CheckCircle className="h-4 w-4" />;
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "generated": return <RefreshCw className="h-4 w-4" />;
      case "draft": return <Edit className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterPostsByStatus = (status: string) => {
    if (status === "all") return posts;
    return posts.filter(post => post.status === status);
  };

  const handleDeletePost = async (id: string) => {
    await deletePost(id);
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(post.status)}>
                {getStatusIcon(post.status)}
                <span className="ml-1 capitalize">{post.status}</span>
              </Badge>
              {post.topics?.title && (
                <Badge variant="outline" className="bg-slate-50">
                  {post.topics.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {post.scheduled_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.scheduled_date).toLocaleDateString()}
                </span>
              )}
              {post.scheduled_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.scheduled_time}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            {(post.status === "generated" || post.status === "draft") && (
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {post.linkedin_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={post.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeletePost(post.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
          
          {(post.engagement_likes > 0 || post.engagement_comments > 0 || post.engagement_shares > 0) && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>👍 {post.engagement_likes}</span>
              <span>💬 {post.engagement_comments}</span>
              <span>🔄 {post.engagement_shares}</span>
            </div>
          )}
          
          {post.postly_id && (
            <div className="text-xs text-slate-500">
              Postly ID: {post.postly_id}
            </div>
          )}
          
          <div className="text-xs text-slate-500">
            Created: {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <h2 className="text-2xl font-bold text-slate-900">Post Queue</h2>
          <p className="text-slate-600">Manage your scheduled and published LinkedIn posts</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Posts
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Edit className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-slate-600">Drafts</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {posts.filter(p => p.status === "draft").length}
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

      {/* Content */}
      {posts.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts yet</h3>
            <p className="text-slate-600 mb-4">Start generating content to see your posts here</p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">All Posts</TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-white">Drafts</TabsTrigger>
            <TabsTrigger value="generated" className="data-[state=active]:bg-white">Generated</TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-white">Scheduled</TabsTrigger>
            <TabsTrigger value="posted" className="data-[state=active]:bg-white">Posted</TabsTrigger>
            <TabsTrigger value="failed" className="data-[state=active]:bg-white">Failed</TabsTrigger>
          </TabsList>

          {["all", "draft", "generated", "scheduled", "posted", "failed"].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="grid gap-4">
                {filterPostsByStatus(status).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default PostQueue;
