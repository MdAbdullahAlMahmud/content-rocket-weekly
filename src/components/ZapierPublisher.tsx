
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Send, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  CheckCircle,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useSettings } from "@/hooks/useSettings";
import { useZapierUsage } from "@/hooks/useZapierUsage";
import { supabase } from "@/integrations/supabase/client";

interface ZapierPublisherProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  topicTitle?: string;
  postId?: string;
}

const ZapierPublisher = ({ isOpen, onClose, content, topicTitle, postId }: ZapierPublisherProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccessfully, setPublishedSuccessfully] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  const { toast } = useToast();
  const { updatePost } = usePosts();
  const { settings } = useSettings();
  const { usage, canUseZapier, getRemainingUsage, incrementUsage } = useZapierUsage();

  const handlePublish = async () => {
    if (!settings?.zapier_webhook_url) {
      toast({
        title: "Zapier Webhook Not Configured",
        description: "Please configure your Zapier webhook URL in Settings first.",
        variant: "destructive"
      });
      return;
    }

    if (!editedContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please provide content to publish.",
        variant: "destructive"
      });
      return;
    }

    if (!canUseZapier()) {
      toast({
        title: "Usage Limit Exceeded",
        description: "You've reached your monthly limit of 100 Zapier actions. It will reset next month.",
        variant: "destructive"
      });
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      toast({
        title: "Schedule Required",
        description: "Please provide both date and time for scheduled posting.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    console.log("Publishing to Zapier:", settings.zapier_webhook_url);

    try {
      if (isScheduled) {
        // Schedule the post
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        
        const { error: scheduleError } = await supabase
          .from('scheduled_posts')
          .insert({
            post_id: postId,
            scheduled_for: scheduledDateTime.toISOString(),
            zapier_webhook_url: settings.zapier_webhook_url,
            post_content: editedContent,
            topic_title: topicTitle,
            status: 'pending'
          });

        if (scheduleError) throw scheduleError;

        // Update post status
        if (postId) {
          await updatePost(postId, {
            content: editedContent,
            status: "scheduled",
            scheduled_date: scheduledDate,
            scheduled_time: scheduledTime
          });
        }

        setPublishedSuccessfully(true);
        toast({
          title: "Post Scheduled!",
          description: `Your post has been scheduled for ${scheduledDate} at ${scheduledTime}. It will be automatically sent to Zapier at that time.`,
        });
      } else {
        // Publish immediately
        const publishData = {
          content: editedContent,
          topic: topicTitle,
          timestamp: new Date().toISOString(),
          platform: "linkedin",
          source: "linkedin-ai-scheduler"
        };

        // Send to Zapier webhook
        const response = await fetch(settings.zapier_webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(publishData),
        });

        // Increment usage count
        await incrementUsage();

        // Update post status
        if (postId) {
          await updatePost(postId, {
            content: editedContent,
            status: "posted",
            posted_at: new Date().toISOString()
          });
        }

        setPublishedSuccessfully(true);
        toast({
          title: "Published via Zapier!",
          description: "Your post has been sent to Zapier. Check your Zap's history to confirm it was processed.",
        });
      }

      setTimeout(() => {
        onClose();
        setPublishedSuccessfully(false);
      }, 2000);

    } catch (error: any) {
      console.error("Error publishing to Zapier:", error);
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to send post to Zapier. Please check your webhook URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (!isPublishing) {
      onClose();
      setPublishedSuccessfully(false);
    }
  };

  // Set default date/time to current + 1 hour
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  // Initialize default values when switching to scheduled
  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (checked && !scheduledDate && !scheduledTime) {
      const { date, time } = getDefaultDateTime();
      setScheduledDate(date);
      setScheduledTime(time);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Publish via Zapier
          </DialogTitle>
          <DialogDescription>
            Send your post to LinkedIn through your Zapier automation
            {topicTitle && (
              <Badge variant="outline" className="ml-2">
                {topicTitle}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
          {/* Zapier Connection Status */}
          {!settings?.zapier_webhook_url ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Zapier webhook URL is not configured.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Setup Zapier
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Zapier webhook is configured and ready to use.
              </AlertDescription>
            </Alert>
          )}

          {/* Usage Limit Alert */}
          {usage && (
            <Alert className={!canUseZapier() ? "border-red-200 bg-red-50" : getRemainingUsage() <= 10 ? "border-yellow-200 bg-yellow-50" : ""}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Zapier Usage: {usage.usage_count}/{usage.limit_count} this month
                  </span>
                  <Badge variant={!canUseZapier() ? "destructive" : getRemainingUsage() <= 10 ? "secondary" : "default"}>
                    {getRemainingUsage()} remaining
                  </Badge>
                </div>
                {!canUseZapier() && (
                  <p className="text-sm text-red-700 mt-1">
                    You've reached your monthly limit. Resets on the 1st of next month.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Schedule Toggle */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <Switch
              id="schedule-mode"
              checked={isScheduled}
              onCheckedChange={handleScheduleToggle}
            />
            <Label htmlFor="schedule-mode" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule for later
            </Label>
          </div>

          {/* Scheduling Options */}
          {isScheduled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="schedule-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              {isScheduled && scheduledDate && scheduledTime && (
                <div className="col-span-2 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Scheduled for: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="zapier-content">Post Content</Label>
            <Textarea
              id="zapier-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={12}
              className="resize-none min-h-[300px]"
              placeholder="Your LinkedIn post content..."
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">How Zapier Publishing Works:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Your content will be sent to your configured Zapier webhook</li>
              <li>• Your Zap should handle posting to LinkedIn automatically</li>
              {isScheduled && <li>• Scheduled posts will be automatically sent at the specified time</li>}
              <li>• Check your Zap's history to confirm successful processing</li>
              <li>• Make sure your Zap is enabled and properly configured</li>
              <li>• Free plan includes 100 Zapier actions per month</li>
            </ul>
          </div>

          {publishedSuccessfully && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {isScheduled 
                  ? "Successfully scheduled! Your post will be sent automatically at the specified time."
                  : "Successfully sent to Zapier! Check your Zap's history for confirmation."
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !settings?.zapier_webhook_url || publishedSuccessfully || !canUseZapier()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isScheduled ? "Scheduling..." : "Publishing..."}
              </>
            ) : publishedSuccessfully ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isScheduled ? "Scheduled!" : "Published!"}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {isScheduled ? "Schedule with Zapier" : "Publish to Zapier"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZapierPublisher;
