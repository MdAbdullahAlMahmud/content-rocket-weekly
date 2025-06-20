
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Send, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";

interface ZapierPublisherProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  topicTitle?: string;
  postId?: string;
}

const ZapierPublisher = ({ isOpen, onClose, content, topicTitle, postId }: ZapierPublisherProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [additionalData, setAdditionalData] = useState("");
  
  const { settings } = useSettings();
  const { updatePost } = usePosts();
  const { toast } = useToast();

  const handlePublish = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter your Zapier webhook URL.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    setPublishStatus('publishing');

    try {
      const payload = {
        content,
        topicTitle,
        postId,
        timestamp: new Date().toISOString(),
        additionalData: additionalData || null,
        source: "LinkedIn AI Scheduler"
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      // Update post status
      if (postId) {
        await updatePost(postId, { 
          status: 'posted',
          posted_at: new Date().toISOString()
        });
      }

      setPublishStatus('success');
      
      toast({
        title: "Published to Zapier!",
        description: "Your post has been sent to Zapier. Check your Zap's history to confirm it was triggered."
      });

      // Close dialog after a brief delay
      setTimeout(() => {
        onClose();
        setPublishStatus('idle');
        setWebhookUrl("");
        setAdditionalData("");
      }, 2000);

    } catch (error: any) {
      console.error('Error publishing to Zapier:', error);
      setPublishStatus('error');
      toast({
        title: "Publishing Failed",
        description: "Failed to send post to Zapier. Please check the webhook URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const isZapierConfigured = !!settings?.zapier_webhook_url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Publish via Zapier
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isZapierConfigured ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="font-medium">Zapier Webhook</span>
                </div>
                <Badge variant={isZapierConfigured ? "default" : "secondary"}>
                  {isZapierConfigured ? 'Configured' : 'Manual Setup'}
                </Badge>
              </div>
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

          {/* Webhook Configuration */}
          {publishStatus === 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zapier Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook" className="text-sm font-medium">
                    Zapier Webhook URL *
                  </Label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl || settings?.zapier_webhook_url || ""}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Create a Zap with a "Catch Hook" trigger to get this URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="additional" className="text-sm font-medium">
                    Additional Data (Optional)
                  </Label>
                  <Textarea
                    id="additional"
                    placeholder="Any additional data you want to send to Zapier..."
                    value={additionalData}
                    onChange={(e) => setAdditionalData(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Zapier Integration Help</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Create a new Zap in your Zapier account</li>
                    <li>• Use "Webhooks by Zapier" as the trigger</li>
                    <li>• Select "Catch Hook" and copy the webhook URL</li>
                    <li>• Connect to LinkedIn, Twitter, or any other app as the action</li>
                  </ul>
                </div>

                <Button
                  onClick={handlePublish}
                  disabled={!webhookUrl.trim() || isPublishing}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing to Zapier...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Publish via Zapier
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {publishStatus === 'publishing' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                <h3 className="font-medium text-slate-900 mb-2">
                  Publishing to Zapier...
                </h3>
                <p className="text-sm text-slate-600">
                  Sending your post data to the Zapier webhook...
                </p>
              </CardContent>
            </Card>
          )}

          {publishStatus === 'success' && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
                <h3 className="font-medium text-slate-900 mb-2">
                  Published Successfully!
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Your post has been sent to Zapier. Check your Zap's history to see the trigger.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://zapier.com/app/history", '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Zap History
                </Button>
              </CardContent>
            </Card>
          )}

          {publishStatus === 'error' && (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <h3 className="font-medium text-slate-900 mb-2">Publishing Failed</h3>
                <p className="text-sm text-slate-600 mb-4">
                  There was an error sending your post to Zapier. Please check your webhook URL and try again.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPublishStatus('idle')}
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

export default ZapierPublisher;
