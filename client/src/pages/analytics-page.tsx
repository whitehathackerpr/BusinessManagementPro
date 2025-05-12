import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics', timePeriod],
  });
  
  // Use mock data since the real data might not be available
  // In a real app, you would use data from the API
  const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
    { name: 'Aug', value: 4200 },
    { name: 'Sep', value: 3800 },
    { name: 'Oct', value: 5100 },
    { name: 'Nov', value: 4900 },
    { name: 'Dec', value: 6200 },
  ];
  
  const customerData = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 120 },
    { name: 'Mar', value: 130 },
    { name: 'Apr', value: 138 },
    { name: 'May', value: 150 },
    { name: 'Jun', value: 170 },
    { name: 'Jul', value: 190 },
    { name: 'Aug', value: 205 },
    { name: 'Sep', value: 218 },
    { name: 'Oct', value: 230 },
    { name: 'Nov', value: 242 },
    { name: 'Dec', value: 260 },
  ];
  
  const productCategoriesData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Books', value: 200 },
    { name: 'Home', value: 150 },
    { name: 'Sports', value: 100 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const branchPerformanceData = [
    { name: 'New York', sales: 4000, customers: 240, orders: 200 },
    { name: 'Los Angeles', sales: 3000, customers: 180, orders: 150 },
    { name: 'Chicago', sales: 2000, customers: 120, orders: 100 },
    { name: 'Houston', sales: 2780, customers: 160, orders: 130 },
    { name: 'Phoenix', sales: 1890, customers: 100, orders: 80 },
  ];
  
  // Calculate percentage change for KPIs
  const getSalesChange = () => {
    // Normally you would calculate this from API data
    return 12.5;
  };
  
  const getCustomerChange = () => {
    return 8.3;
  };
  
  const getOrdersChange = () => {
    return -3.2;
  };
  
  const getRevenueChange = () => {
    return 15.7;
  };
  
  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading analytics data</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Advanced business analytics and insights.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Select defaultValue={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="default" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-purple-100 dark:border-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Sales</p>
                <h3 className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-50">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : '$289,450'}
                </h3>
                <p className={`mt-1 text-sm ${getSalesChange() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                  {getSalesChange() >= 0 ? 
                    <ArrowUpRight className="inline-block h-3 w-3 mr-1" /> : 
                    <ArrowDownRight className="inline-block h-3 w-3 mr-1" />}
                  {Math.abs(getSalesChange())}% from previous {timePeriod}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/60">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-100 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Customers</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-50">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : '8,924'}
                </h3>
                <p className={`mt-1 text-sm ${getCustomerChange() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                  {getCustomerChange() >= 0 ? 
                    <ArrowUpRight className="inline-block h-3 w-3 mr-1" /> : 
                    <ArrowDownRight className="inline-block h-3 w-3 mr-1" />}
                  {Math.abs(getCustomerChange())}% from previous {timePeriod}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/60">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 border-yellow-100 dark:border-yellow-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Orders</p>
                <h3 className="mt-2 text-3xl font-bold text-yellow-900 dark:text-yellow-50">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : '3,782'}
                </h3>
                <p className={`mt-1 text-sm ${getOrdersChange() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                  {getOrdersChange() >= 0 ? 
                    <ArrowUpRight className="inline-block h-3 w-3 mr-1" /> : 
                    <ArrowDownRight className="inline-block h-3 w-3 mr-1" />}
                  {Math.abs(getOrdersChange())}% from previous {timePeriod}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/60">
                <ShoppingBag className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Revenue</p>
                <h3 className="mt-2 text-3xl font-bold text-green-900 dark:text-green-50">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : '$128,230'}
                </h3>
                <p className={`mt-1 text-sm ${getRevenueChange() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                  {getRevenueChange() >= 0 ? 
                    <ArrowUpRight className="inline-block h-3 w-3 mr-1" /> : 
                    <ArrowDownRight className="inline-block h-3 w-3 mr-1" />}
                  {Math.abs(getRevenueChange())}% from previous {timePeriod}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/60">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
      
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                  <LineChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Sales Trend
                </CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          color: '#333'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Sales by Category
                </CardTitle>
                <CardDescription>Distribution of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productCategoriesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {productCategoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Customer Growth
                </CardTitle>
                <CardDescription>Monthly customer acquisition</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Branch Performance
                </CardTitle>
                <CardDescription>Comparison of branches</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
                      <Bar dataKey="customers" fill="#00C49F" name="Customers" />
                      <Bar dataKey="orders" fill="#FFBB28" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Other tabs would be implemented similarly */}
        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Analytics</CardTitle>
              <CardDescription>
                Comprehensive analysis of sales performance and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  This feature is part of the premium analytics package.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>
                Detailed customer analytics and segmentation data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  This feature is part of the premium analytics package.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Analysis of top-performing products and inventory trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  This feature is part of the premium analytics package.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}