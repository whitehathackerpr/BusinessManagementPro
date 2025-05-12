import { useTheme } from '@/lib/theme-provider';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface StatItemProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
}

const StatItem = ({ title, value, change, icon, iconBgClass, iconTextClass }: StatItemProps) => {
  return (
    <div className="rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${iconBgClass}`}>
          <span className={iconTextClass}>{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
              {change !== 0 && (
                <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {change > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

interface StatsOverviewProps {
  stats?: {
    totalSales: number;
    newCustomers: number;
    inventoryItems: number;
    revenue: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!stats) return null;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatItem
        title="Total Sales"
        value={formatCurrency(stats.totalSales)}
        change={12.5}
        icon={<ShoppingCart className="h-6 w-6" />}
        iconBgClass={isDark ? 'bg-blue-900' : 'bg-blue-100'}
        iconTextClass={isDark ? 'text-blue-300' : 'text-blue-600'}
      />
      
      <StatItem
        title="New Customers"
        value={stats.newCustomers.toString()}
        change={8.2}
        icon={<Users className="h-6 w-6" />}
        iconBgClass={isDark ? 'bg-purple-900' : 'bg-purple-100'}
        iconTextClass={isDark ? 'text-purple-300' : 'text-purple-600'}
      />
      
      <StatItem
        title="Inventory Items"
        value={stats.inventoryItems.toString()}
        change={-3.1}
        icon={<Package className="h-6 w-6" />}
        iconBgClass={isDark ? 'bg-amber-900' : 'bg-amber-100'}
        iconTextClass={isDark ? 'text-amber-300' : 'text-amber-600'}
      />
      
      <StatItem
        title="Revenue"
        value={formatCurrency(stats.revenue)}
        change={14.2}
        icon={<DollarSign className="h-6 w-6" />}
        iconBgClass={isDark ? 'bg-green-900' : 'bg-green-100'}
        iconTextClass={isDark ? 'text-green-300' : 'text-green-600'}
      />
    </div>
  );
}
