
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Calendar, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Target,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LinkedIn AI Scheduler
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Content Creation
          </Badge>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Automate Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}LinkedIn Content
            </span>
            <br />
            Strategy with AI
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Transform your professional presence with intelligent content generation, 
            automated scheduling, and data-driven insights. Never run out of engaging 
            LinkedIn posts again.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              Start Creating Content
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">AI Content Generation</CardTitle>
              <CardDescription>
                Create engaging LinkedIn posts instantly with our advanced AI that understands your industry and audience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Industry-specific content
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multiple content formats
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Brand voice consistency
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Scheduling</CardTitle>
              <CardDescription>
                Optimize your posting schedule with AI-driven timing recommendations for maximum engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Optimal posting times
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automated publishing
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Content calendar view
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Topic Management</CardTitle>
              <CardDescription>
                Organize your content strategy with intelligent topic banks and trend-based suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Topic categorization
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Trend analysis
                </li>
                <li className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Content planning
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">10x</div>
              <div className="text-slate-600">Faster Content Creation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">85%</div>
              <div className="text-slate-600">Time Saved Weekly</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">3x</div>
              <div className="text-slate-600">Higher Engagement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
              <div className="text-slate-600">Automated Posting</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your LinkedIn Strategy?</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Join thousands of professionals who are already using AI to grow their LinkedIn presence.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={handleGetStarted}
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
