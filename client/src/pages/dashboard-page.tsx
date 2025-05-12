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
