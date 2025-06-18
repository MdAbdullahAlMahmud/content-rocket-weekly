
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Brain, BarChart3, Zap, ChevronRight, Check } from "lucide-react";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            🚀 AI-Powered Content Automation
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
            LinkedIn AI Scheduler
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Automate your LinkedIn presence with AI-generated content. Set your tone once, 
            then watch as quality posts are created and scheduled 3x per week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={() => setShowDashboard(true)}
            >
              Open Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">AI Content Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">Smart AI creates engaging LinkedIn posts from your topic bank with your unique voice.</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Auto Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">Posts automatically scheduled for Monday, Wednesday, Friday at optimal times.</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">Track performance, manage content, and optimize your LinkedIn strategy.</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Full Control</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">Review, edit, or regenerate any content before it goes live. You're always in control.</p>
            </CardContent>
          </Card>
        </div>

        {/* Process Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-16 border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Set Your Topics</h3>
              <p className="text-slate-600">Add topics to your knowledge bank that reflect your expertise and interests.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Creates Content</h3>
              <p className="text-slate-600">Every Sunday, AI generates 3 engaging posts for the week ahead.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Auto Published</h3>
              <p className="text-slate-600">Posts are automatically scheduled and published at optimal times.</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Why Choose AI Scheduler?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Save 5+ hours per week on content creation",
              "Maintain consistent LinkedIn presence",
              "AI learns and adapts to your voice",
              "Professional dashboard for full control",
              "Automated scheduling with Postly integration",
              "Built-in analytics and performance tracking"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
