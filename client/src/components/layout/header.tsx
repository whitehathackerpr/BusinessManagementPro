import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, 
  Search, 
  Bell, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  openSidebar: () => void;
}

export default function Header({ openSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Apply glassmorphism effect
  const glassBg = "bg-opacity-70 backdrop-blur-md backdrop-saturate-150 dark:bg-opacity-70";

  return (
    <header className={`${glassBg} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20`}>
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={openSidebar} 
            className="text-gray-500 dark:text-gray-400"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-3 text-lg font-medium text-primary dark:text-primary-foreground">
            BIZ_MANAGE_PRO
          </h1>
        </div>
        
        {/* Search bar - visible on desktop */}
        <div className="hidden md:block">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              className="pl-10 bg-gray-100 dark:bg-gray-800" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-500 dark:text-gray-400">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
          </Button>
          
          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-4 text-gray-500 dark:text-gray-400">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user && (
                <>
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold">{user.fullName || user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <div className="flex items-center pt-1">
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Administrator
                          </span>
                        )}
                        {user.role === 'manager' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Manager
                          </span>
                        )}
                        {user.role === 'user' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Staff Member
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User avatar - visible on desktop */}
          {user && (
            <div className="hidden md:flex ml-4 relative">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
