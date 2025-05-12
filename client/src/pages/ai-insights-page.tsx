import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AppLayout from '@/components/layout/app-layout';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  PieChart,
  BarChart3,
  LineChart,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart,
  Activity,
  Boxes,
  Users,
  RefreshCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

// Types for insights data
interface BusinessInsightMetric {
  name: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'stable';
}

interface BusinessInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'opportunity';
  metrics?: BusinessInsightMetric[];
  tags?: string[];
}

interface BusinessRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  potentialImpact: string;
  implementation: string;
  tags?: string[];
}

interface BusinessInsightsResponse {
  insights: BusinessInsight[];
  recommendations: BusinessRecommendation[];
  summary: string;
  analysisDate: string;
}

// Component for individual insight card
const InsightCard = ({ insight }: { insight: BusinessInsight }) => {
  let bgColor = '';
  let icon = null;
  
  // Set colors and icons based on insight type
  switch (insight.type) {
    case 'positive':
      bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900';
      icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      break;
    case 'negative':
      bgColor = 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-100 dark:border-red-900';
      icon = <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      break;
    case 'opportunity':
      bgColor = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900';
      icon = <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      break;
    default:
      bgColor = 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-100 dark:border-gray-900';
      icon = <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
  }
  
  return (
    <Card className={`${bgColor} hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {icon}
            <CardTitle className="text-lg ml-2">{insight.title}</CardTitle>
          </div>
          <Badge 
            variant={insight.type === 'positive' ? 'default' : 
                   insight.type === 'negative' ? 'destructive' : 
                   insight.type === 'opportunity' ? 'outline' : 'secondary'}
            className="capitalize"
          >
            {insight.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{insight.description}</p>
        
        {insight.metrics && insight.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {insight.metrics.map((metric, idx) => (
              <div key={idx} className="flex flex-col p-2 bg-white/40 dark:bg-gray-900/40 rounded-md">
                <span className="text-xs text-gray-500 dark:text-gray-400">{metric.name}</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold">{metric.value}</span>
                  {metric.trend && metric.change && (
                    <span className={`ml-2 text-xs flex items-center ${
                      metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                      metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                       metric.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {insight.tags && insight.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {insight.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for individual recommendation card
const RecommendationCard = ({ recommendation }: { recommendation: BusinessRecommendation }) => {
  let priorityColor = '';
  
  // Set colors based on priority
  switch (recommendation.priority) {
    case 'high':
      priorityColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      break;
    case 'medium':
      priorityColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      break;
    case 'low':
      priorityColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      break;
  }
  
  return (
    <Card className="bg-white dark:bg-gray-950/50 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          <Badge className={`capitalize ${priorityColor}`}>
            {recommendation.priority} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{recommendation.description}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">Potential Impact</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation.potentialImpact}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-1">Implementation</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation.implementation}</p>
          </div>
        </div>
        
        {recommendation.tags && recommendation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {recommendation.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('overall');
  const [timespan, setTimespan] = useState('month');
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  
  // Define mutation for generating insights
  const insightsMutation = useMutation({
    mutationFn: async ({ dataType, timespan }: { dataType: string, timespan: string }) => {
      const res = await apiRequest('POST', '/api/insights', { dataType, timespan });
      return await res.json();
    },
    onSuccess: (data) => {
      // Update cache for each data type
      queryClient.setQueryData(['/api/insights', activeTab, timespan], data);
    }
  });
  
  // Define query for fetching insights
  const { data, isLoading, error } = useQuery<BusinessInsightsResponse>({
    queryKey: ['/api/insights', activeTab, timespan],
    enabled: false, // We'll trigger this manually
  });
  
  // Trigger the mutation when the component mounts or when the tab/timespan changes
  useEffect(() => {
    insightsMutation.mutate({ dataType: activeTab, timespan });
  }, [activeTab, timespan]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle timespan change
  const handleTimespanChange = (value: string) => {
    setTimespan(value);
  };
  
  // Handle regenerate
  const handleRegenerate = () => {
    setIsRegenerateDialogOpen(false);
    insightsMutation.mutate({ dataType: activeTab, timespan });
  };
  
  // Helper for formatting date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Get the right icon for the current tab
  const getTabIcon = () => {
    switch (activeTab) {
      case 'sales':
        return <BarChart3 className="h-5 w-5 mr-2" />;
      case 'inventory':
        return <Boxes className="h-5 w-5 mr-2" />;
      case 'customers':
        return <Users className="h-5 w-5 mr-2" />;
      case 'overall':
      default:
        return <Activity className="h-5 w-5 mr-2" />;
    }
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            AI Business Insights
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            AI-powered analysis and recommendations for optimizing your business operations.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select defaultValue={timespan} onValueChange={handleTimespanChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timespan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(true)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Regenerate Insights
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overall" className="flex items-center justify-center">
            <Activity className="h-4 w-4 mr-2" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center justify-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center justify-center">
            <Boxes className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center justify-center">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Loading State */}
      {insightsMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium">Generating AI Insights...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Our AI is analyzing your business data to provide valuable insights and recommendations.
          </p>
        </div>
      )}
      
      {/* Error State */}
      {insightsMutation.isError && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-500">Failed to Generate Insights</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {insightsMutation.error instanceof Error ? insightsMutation.error.message : 'An error occurred while generating insights.'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => insightsMutation.mutate({ dataType: activeTab, timespan })}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
      
      {/* Success State */}
      {insightsMutation.isSuccess && insightsMutation.data && (
        <>
          {/* Summary Card */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {getTabIcon()}
                <h3 className="text-xl font-semibold">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Business Summary
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300">
                {insightsMutation.data.summary}
              </p>
              
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Analysis generated: {formatDate(insightsMutation.data.analysisDate)}
                </span>
                <span className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by Claude AI
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Insights Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Key Insights
            </h3>
            
            {insightsMutation.data.insights && insightsMutation.data.insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insightsMutation.data.insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No insights available.</p>
            )}
          </div>
          
          {/* Recommendations */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Recommendations
            </h3>
            
            {insightsMutation.data.recommendations && insightsMutation.data.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insightsMutation.data.recommendations.map((recommendation, index) => (
                  <RecommendationCard key={index} recommendation={recommendation} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recommendations available.</p>
            )}
          </div>
        </>
      )}
      
      {/* Regenerate Dialog */}
      <AlertDialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate AI Insights?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate new insights and recommendations based on your current business data.
              This process may take a moment to complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}