
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Send, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useSettings } from "@/hooks/useSettings";

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
  
  const { toast } = useToast();
  const { updatePost } = usePosts();
  const { settings } = useSettings();

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

    setIsPublishing(true);
    console.log("Publishing to Zapier:", settings.zapier_webhook_url);

    try {
      // Send to Zapier webhook
      const response = await fetch(settings.zapier_webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS issues
        body: JSON.stringify({
          content: editedContent,
          topic: topicTitle,
          timestamp: new Date().toISOString(),
          platform: "linkedin",
          source: "linkedin-ai-scheduler"
        }),
      });

      // Update post status if we have a postId
      if (postId) {
        await updatePost(postId, {
          status: "posted",
          content: editedContent,
          posted_at: new Date().toISOString()
        });
      }

      setPublishedSuccessfully(true);
      toast({
        title: "Published via Zapier!",
        description: "Your post has been sent to Zapier. Check your Zap's history to confirm it was processed.",
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setPublishedSuccessfully(false);
      }, 2000);

    } catch (error) {
      console.error("Error publishing to Zapier:", error);
      toast({
        title: "Publishing Failed",
        description: "Failed to send post to Zapier. Please check your webhook URL and try again.",
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
              <li>• Check your Zap's history to confirm successful processing</li>
              <li>• Make sure your Zap is enabled and properly configured</li>
            </ul>
          </div>

          {publishedSuccessfully && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully sent to Zapier! Check your Zap's history for confirmation.
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
            disabled={isPublishing || !settings?.zapier_webhook_url || publishedSuccessfully}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : publishedSuccessfully ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Published!
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Publish to Zapier
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZapierPublisher;
