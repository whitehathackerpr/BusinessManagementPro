import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ShoppingCart, 
  UserPlus, 
  DollarSign, 
  Package,
  User,
  MessageCircle,
  LogIn,
  LogOut,
  Edit,
  Trash,
  Plus
} from 'lucide-react';

interface Activity {
  id: number;
  userId: number;
  activity: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  user?: {
    username: string;
    fullName?: string;
  };
}

interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  // Format activity timestamp
  const formatActivityTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return timestamp;
    }
  };

  // Get icon based on activity type
  const getActivityIcon = (activity: Activity) => {
    const { entityType, activity: activityType } = activity;
    
    if (activityType.includes('logged in')) return <LogIn className="h-5 w-5" />;
    if (activityType.includes('logged out')) return <LogOut className="h-5 w-5" />;
    
    switch (entityType) {
      case 'order':
        return <ShoppingCart className="h-5 w-5" />;
      case 'user':
        return activityType.includes('created') || activityType.includes('registered') 
          ? <UserPlus className="h-5 w-5" /> 
          : <User className="h-5 w-5" />;
      case 'payment':
        return <DollarSign className="h-5 w-5" />;
      case 'inventory':
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'message':
        return <MessageCircle className="h-5 w-5" />;
      default:
        if (activityType.includes('created')) return <Plus className="h-5 w-5" />;
        if (activityType.includes('updated')) return <Edit className="h-5 w-5" />;
        if (activityType.includes('deleted')) return <Trash className="h-5 w-5" />;
        return <Edit className="h-5 w-5" />;
    }
  };

  // Get background color for activity icon
  const getIconBgColor = (activity: Activity) => {
    const { entityType, activity: activityType } = activity;
    
    if (activityType.includes('logged in')) return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
    if (activityType.includes('logged out')) return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    
    switch (entityType) {
      case 'order':
        return 'bg-primary-light bg-opacity-20 text-primary-dark dark:text-primary-light';
      case 'user':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
      case 'payment':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'inventory':
      case 'product':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300';
      default:
        if (activityType.includes('created')) return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
        if (activityType.includes('updated')) return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
        if (activityType.includes('deleted')) return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</CardTitle>
        <Button variant="link" className="text-primary dark:text-primary-foreground p-0">
          View All
        </Button>
      </div>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index < activities.length - 1 && (
                  <span 
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" 
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${getIconBgColor(activity)}`}>
                      {getActivityIcon(activity)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.activity}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {activity.user && (
                          <>
                            By <span className="font-medium text-primary dark:text-primary-foreground">
                              {activity.user.fullName || activity.user.username}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>{formatActivityTime(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {activities.length === 0 && (
            <li className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}
