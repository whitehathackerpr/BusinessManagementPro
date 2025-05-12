import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import StatsOverview from '@/components/dashboard/stats-overview';
import SalesChart from '@/components/dashboard/sales-chart';
import ProductsChart from '@/components/dashboard/products-chart';
import RecentOrders from '@/components/dashboard/recent-orders';
import LowStock from '@/components/dashboard/low-stock';
import BranchPerformance from '@/components/dashboard/branch-performance';
import RecentActivity from '@/components/dashboard/recent-activity';
import { Skeleton } from '@/components/ui/skeleton';
import { DownloadIcon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
  });

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading dashboard data</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Select defaultValue="month">
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
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Premium Feature: Welcome Banner with Tips */}
      <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="relative px-6 py-5 sm:px-8 sm:py-7">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 md:max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 mb-3">
                <span className="mr-1">✨</span> Premium Feature
              </div>
              <h2 className="text-xl font-bold text-white md:text-2xl">Welcome to BIZ_MANAGE_PRO Premium</h2>
              <p className="mt-2 text-blue-100">Enjoy advanced analytics, customizable dashboards, and priority customer support.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 transition-colors">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule Demo
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 transition-colors">
                View Guide
              </Button>
            </div>
          </div>
          
          {/* Tips Carousel */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-medium text-white">Quick Tip</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100">Use keyboard shortcuts (Press "?" to view) for faster navigation in your dashboard.</p>
            </div>
            
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-medium text-white">New Feature</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100">Try our new AI-powered inventory forecasting to predict stock needs before they arise.</p>
            </div>
            
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="ml-3 text-sm font-medium text-white">Did You Know?</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100">You can customize your reports and export them in various formats including PDF, CSV and Excel.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsOverview stats={data?.stats} />
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </>
        ) : (
          <>
            <SalesChart />
            <ProductsChart />
          </>
        )}
      </div>
      
      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </>
        ) : (
          <>
            <RecentOrders orders={data?.recentOrders} className="lg:col-span-2" />
            <LowStock items={data?.lowStockItems} />
          </>
        )}
      </div>
      
      {/* Branch Performance */}
      {isLoading ? (
        <Skeleton className="h-72 mb-6 rounded-xl" />
      ) : (
        <BranchPerformance branches={data?.branchPerformance} className="mb-6" />
      )}
      
      {/* Recent Activity */}
      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <RecentActivity activities={data?.recentActivities} />
      )}
    </AppLayout>
  );
}
