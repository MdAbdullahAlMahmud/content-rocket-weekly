
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Settings as SettingsIcon, 
  Key, 
  Save, 
  Eye, 
  EyeOff,
  ExternalLink,
  AlertCircle,
  Zap,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useZapierUsage } from "@/hooks/useZapierUsage";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const { usage, loading: usageLoading } = useZapierUsage();
  const [openaiKey, setOpenaiKey] = useState("");
  const [postlyKey, setPostlyKey] = useState("");
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showPostlyKey, setShowPostlyKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updates: any = {};
    
    if (openaiKey.trim()) {
      updates.openai_api_key = openaiKey.trim();
    }
    
    if (postlyKey.trim()) {
      updates.postly_api_key = postlyKey.trim();
    }

    if (zapierWebhookUrl.trim()) {
      updates.zapier_webhook_url = zapierWebhookUrl.trim();
    }

    if (Object.keys(updates).length > 0) {
      await updateSettings(updates);
      setOpenaiKey("");
      setPostlyKey("");
      setZapierWebhookUrl("");
    }
    setSaving(false);
  };

  const usagePercentage = usage ? (usage.usage_count / usage.limit_count) * 100 : 0;
  const remainingUsage = usage ? usage.limit_count - usage.usage_count : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Manage your API keys and account preferences</p>
      </div>

      {/* Zapier Usage Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Zapier Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">Loading usage data...</div>
            </div>
          ) : usage ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Monthly Usage</span>
                <span className="text-sm text-slate-600">
                  {usage.usage_count} / {usage.limit_count} actions
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className="h-3"
                // @ts-ignore
                indicatorClassName={usagePercentage > 90 ? "bg-red-500" : usagePercentage > 70 ? "bg-yellow-500" : "bg-green-500"}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  Current Month: {usage.month_year}
                </span>
                <span className={`font-medium ${remainingUsage <= 10 ? 'text-red-600' : remainingUsage <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {remainingUsage} remaining
                </span>
              </div>
              {usagePercentage > 90 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    You're approaching your monthly limit. Usage resets on the 1st of each month.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-slate-600">
              No usage data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            API Keys & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API keys are encrypted and stored securely. They are only used for generating content and posting to your connected services.
            </AlertDescription>
          </Alert>

          {/* OpenAI API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai-key" className="text-sm font-medium text-slate-700">
                OpenAI API Key
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Key
              </Button>
            </div>
            <div className="relative">
              <Input
                id="openai-key"
                type={showOpenaiKey ? "text" : "password"}
                placeholder={settings?.openai_api_key ? "••••••••••••••••••••••••••••••••••••••••••••••••••••" : "sk-..."}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              >
                {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Used for generating content with AI. Required for the Content Generator to work.
            </p>
          </div>

          <Separator />

          {/* Postly API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="postly-key" className="text-sm font-medium text-slate-700">
                Postly API Key
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://postly.com/api', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Key
              </Button>
            </div>
            <div className="relative">
              <Input
                id="postly-key"
                type={showPostlyKey ? "text" : "password"}
                placeholder={settings?.postly_api_key ? "••••••••••••••••••••••••••••••••••••••••••••••••••••" : "Enter your Postly API key"}
                value={postlyKey}
                onChange={(e) => setPostlyKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPostlyKey(!showPostlyKey)}
              >
                {showPostlyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Used for automatically posting content to your social media accounts through Postly.
            </p>
          </div>

          <Separator />

          {/* Zapier Webhook URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="zapier-webhook" className="text-sm font-medium text-slate-700">
                <Zap className="h-4 w-4 inline mr-1" />
                Zapier Webhook URL
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Webhook
              </Button>
            </div>
            <Input
              id="zapier-webhook"
              type="url"
              placeholder={settings?.zapier_webhook_url ? "https://hooks.zapier.com/hooks/catch/..." : "https://hooks.zapier.com/hooks/catch/..."}
              value={zapierWebhookUrl}
              onChange={(e) => setZapierWebhookUrl(e.target.value)}
            />
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Setup Instructions:</h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Create a new Zap in Zapier</li>
                <li>Add "Webhooks by Zapier" as the trigger</li>
                <li>Choose "Catch Hook" and copy the webhook URL</li>
                <li>Add "LinkedIn" as the action to post content</li>
                <li>Paste the webhook URL above and save</li>
              </ol>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving || (!openaiKey.trim() && !postlyKey.trim() && !zapierWebhookUrl.trim())}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? (
              <>
                <SettingsIcon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings?.openai_api_key ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">OpenAI</span>
              </div>
              <div className="flex items-center gap-2">
                {settings?.openai_api_key && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                <span className={`text-sm ${settings?.openai_api_key ? 'text-green-600' : 'text-red-600'}`}>
                  {settings?.openai_api_key ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings?.postly_api_key ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">Postly</span>
              </div>
              <div className="flex items-center gap-2">
                {settings?.postly_api_key && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                <span className={`text-sm ${settings?.postly_api_key ? 'text-green-600' : 'text-red-600'}`}>
                  {settings?.postly_api_key ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings?.zapier_webhook_url ? 'bg-green-500' : 'bg-red-500'}`} />
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Zapier</span>
              </div>
              <div className="flex items-center gap-2">
                {settings?.zapier_webhook_url && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                <span className={`text-sm ${settings?.zapier_webhook_url ? 'text-green-600' : 'text-red-600'}`}>
                  {settings?.zapier_webhook_url ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
