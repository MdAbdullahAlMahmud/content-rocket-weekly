
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Send, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  topicTitle?: string;
  postId?: string;
}

const PostScheduler = ({ isOpen, onClose, content, topicTitle, postId }: PostSchedulerProps) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'scheduling' | 'success' | 'error'>('idle');
  const [postlyUrl, setPostlyUrl] = useState("");
  
  const { settings } = useSettings();
  const { updatePost } = usePosts();
  const { toast } = useToast();

  const handleScheduleToPostly = async () => {
    if (!settings?.postly_api_key) {
      toast({
        title: "Postly API Key Required",
        description: "Please add your Postly API key in Settings first.",
        variant: "destructive"
      });
      return;
    }

    if (!postId) {
      toast({
        title: "Post ID Missing",
        description: "Unable to schedule post without a valid post ID.",
        variant: "destructive"
      });
      return;
    }

    setIsScheduling(true);
    setScheduleStatus('scheduling');

    try {
      const { data, error } = await supabase.functions.invoke('post-to-postly', {
        body: {
          postId,
          content,
          scheduledDate: scheduledDate || null,
          scheduledTime: scheduledTime || null
        }
      });

      if (error) throw error;

      setScheduleStatus('success');
      setPostlyUrl(data.postlyData?.url || '');
      
      toast({
        title: "Success!",
        description: scheduledDate 
          ? "Post scheduled successfully via Postly" 
          : "Post published successfully via Postly"
      });

      // Close dialog after a brief delay
      setTimeout(() => {
        onClose();
        setScheduleStatus('idle');
      }, 2000);

    } catch (error: any) {
      console.error('Error scheduling to Postly:', error);
      setScheduleStatus('error');
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule post via Postly. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishNow = async () => {
    setScheduledDate("");
    setScheduledTime("");
    await handleScheduleToPostly();
  };

  const isPostlyConnected = !!settings?.postly_api_key;
  const isScheduled = scheduledDate && scheduledTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            Publish to LinkedIn via Postly
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPostlyConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">Postly Connection</span>
                </div>
                <Badge variant={isPostlyConnected ? "default" : "destructive"}>
                  {isPostlyConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              {!isPostlyConnected && (
                <p className="text-sm text-slate-600 mt-2">
                  Please add your Postly API key in Settings to publish posts.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Post Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 border">
                {topicTitle && (
                  <Badge variant="outline" className="mb-3">
                    {topicTitle}
                  </Badge>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 whitespace-pre-line">{content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Options */}
          {scheduleStatus === 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Schedule Date (Optional)
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm font-medium">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Schedule Time (Optional)
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePublishNow}
                    disabled={!isPostlyConnected || isScheduling}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isScheduling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Publish Now
                  </Button>
                  <Button
                    onClick={handleScheduleToPostly}
                    disabled={!isPostlyConnected || !isScheduled || isScheduling}
                    variant="outline"
                    className="flex-1"
                  >
                    {isScheduling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Schedule Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {scheduleStatus === 'scheduling' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="font-medium text-slate-900 mb-2">
                  {isScheduled ? 'Scheduling Post...' : 'Publishing Post...'}
                </h3>
                <p className="text-sm text-slate-600">
                  Connecting to Postly and processing your request...
                </p>
              </CardContent>
            </Card>
          )}

          {scheduleStatus === 'success' && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
                <h3 className="font-medium text-slate-900 mb-2">
                  {isScheduled ? 'Post Scheduled Successfully!' : 'Post Published Successfully!'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Your post has been {isScheduled ? 'scheduled' : 'published'} via Postly.
                </p>
                {postlyUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(postlyUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Postly
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {scheduleStatus === 'error' && (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <h3 className="font-medium text-slate-900 mb-2">Publishing Failed</h3>
                <p className="text-sm text-slate-600 mb-4">
                  There was an error publishing your post. Please try again.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleStatus('idle')}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostScheduler;
