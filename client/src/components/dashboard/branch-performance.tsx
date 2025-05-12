import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BranchInfo {
  id: number;
  name: string;
  revenue: number;
  growth: number;
  percentage: number;
}

interface BranchPerformanceProps {
  branches?: BranchInfo[];
  className?: string;
}

export default function BranchPerformance({ branches = [], className = '' }: BranchPerformanceProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const metrics = ['Sales', 'Revenue', 'Growth'];
  
  return (
    <Card className={`bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Branch Performance</CardTitle>
        <div className="flex space-x-2">
          {metrics.map((metric, index) => (
            <Button 
              key={metric}
              variant={index === 1 ? "default" : "ghost"} 
              size="sm"
            >
              {metric}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {branch.name}
              </h4>
              <span className={`flex items-center text-xs font-medium ${
                branch.growth > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {branch.growth > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(branch.growth)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(branch.revenue)}
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${branch.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No branch performance data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
