
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2,
  Save,
  Send,
  Zap
} from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import PostScheduler from "./PostScheduler";
import ZapierPublisher from "./ZapierPublisher";

const PostQueue = () => {
  const { posts, loading, deletePost, updatePost } = usePosts();
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showZapierPublisher, setShowZapierPublisher] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [publishingPlatform, setPublishingPlatform] = useState<string>("");

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
    try {
      await deletePost(id);
      toast({
        title: "Post deleted",
        description: "The post has been removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    setIsEditing(true);
    try {
      await updatePost(editingPost, { content: editContent });
      setEditingPost(null);
      setEditContent("");
      toast({
        title: "Post updated",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handlePublish = (post: any, platform: string) => {
    setSelectedPost(post);
    setPublishingPlatform(platform);
    
    if (platform === "postly") {
      setShowScheduler(true);
    } else if (platform === "zapier") {
      setShowZapierPublisher(true);
    }
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
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
          <div className="flex gap-2 flex-wrap">
            {/* Preview Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Post Preview</DialogTitle>
                  <DialogDescription>
                    {post.topics?.title && `Topic: ${post.topics.title}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-slate-700 whitespace-pre-line">{post.content}</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            {(post.status === "generated" || post.status === "draft") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditPost(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription>
                      Make changes to your post content below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditingPost(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit} disabled={isEditing}>
                        {isEditing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Publishing Options */}
            {(post.status === "generated" || post.status === "draft") && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handlePublish(post, "postly")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Postly
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish(post, "zapier")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Zapier
                </Button>
              </div>
            )}

            {/* External Link */}
            {post.linkedin_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={post.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {/* Delete Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

      {/* Modals */}
      {selectedPost && (
        <>
          <PostScheduler
            isOpen={showScheduler}
            onClose={() => {
              setShowScheduler(false);
              setSelectedPost(null);
            }}
            content={selectedPost.content}
            topicTitle={selectedPost.topics?.title}
            postId={selectedPost.id}
          />
          
          <ZapierPublisher
            isOpen={showZapierPublisher}
            onClose={() => {
              setShowZapierPublisher(false);
              setSelectedPost(null);
            }}
            content={selectedPost.content}
            topicTitle={selectedPost.topics?.title}
            postId={selectedPost.id}
          />
        </>
      )}
    </div>
  );
};

export default PostQueue;
