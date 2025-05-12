import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/lib/theme-provider';
import { 
  ChevronLeft,
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  UserRound, 
  ShoppingCart,
  LineChart,
  Settings,
  Moon,
  Sun,
  Truck
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Apply glassmorphism effect
  const glassBg = "bg-opacity-70 backdrop-blur-md backdrop-saturate-150 dark:bg-opacity-70";

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    
      <aside 
        className={`
          ${open ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          fixed md:static inset-y-0 left-0 z-50 md:z-30
          w-64 ${glassBg} bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-primary dark:text-primary-foreground flex items-center">
            <Building2 className="mr-2 h-6 w-6" />
            BIZ_MANAGE_PRO
          </h1>
          <button 
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            onClick={() => setOpen(false)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
        
        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.fullName || user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            
            <div className="mt-3">
              {user.role === 'admin' && (
                <div className="flex items-center px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="ml-2 text-xs font-semibold text-red-700 dark:text-red-300">Administrator</span>
                </div>
              )}
              {user.role === 'manager' && (
                <div className="flex items-center px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="ml-2 text-xs font-semibold text-blue-700 dark:text-blue-300">Manager</span>
                </div>
              )}
              {user.role === 'user' && (
                <div className="flex items-center px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="ml-2 text-xs font-semibold text-green-700 dark:text-green-300">Staff Member</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-1">
            <NavLink href="/" icon={<LayoutDashboard className="mr-3 h-5 w-5" />} active={location === '/'}>
              Dashboard
            </NavLink>
            
            <NavLink href="/users" icon={<Users className="mr-3 h-5 w-5" />} active={location === '/users'}>
              User Management
            </NavLink>
            
            <NavLink href="/branches" icon={<Building2 className="mr-3 h-5 w-5" />} active={location === '/branches'}>
              Branch Management
            </NavLink>
            
            <NavLink href="/inventory" icon={<Package className="mr-3 h-5 w-5" />} active={location === '/inventory'}>
              Inventory
            </NavLink>
            
            <NavLink href="/customers" icon={<UserRound className="mr-3 h-5 w-5" />} active={location === '/customers'}>
              Customers
            </NavLink>
            
            <NavLink href="/suppliers" icon={<Truck className="mr-3 h-5 w-5" />} active={location === '/suppliers'}>
              Suppliers
            </NavLink>
            
            <NavLink href="/orders" icon={<ShoppingCart className="mr-3 h-5 w-5" />} active={location === '/orders'}>
              Orders
            </NavLink>
            
            <NavLink href="/analytics" icon={<LineChart className="mr-3 h-5 w-5" />} active={location === '/analytics'}>
              Analytics
            </NavLink>
            
            <NavLink href="/settings" icon={<Settings className="mr-3 h-5 w-5" />} active={location === '/settings'}>
              Settings
            </NavLink>
          </div>
        </nav>
        
        {/* Premium Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-950 dark:to-blue-950 p-3 rounded-lg border border-violet-200 dark:border-violet-900 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {theme === 'dark' ? (
                    <div className="p-2 bg-indigo-900 rounded-full text-indigo-100 shadow-lg border border-indigo-800 transition-all duration-300">
                      <Moon className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600 shadow-md border border-amber-200 transition-all duration-300">
                      <Sun className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Perfect for night work' : 'Easier on the eyes in daylight'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={theme === 'dark'} 
                    onChange={toggleTheme}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 
                      peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-md after:transition-all
                      peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500
                      peer-checked:after:border-white peer-checked:after:bg-white">
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, icon, active, children }: NavLinkProps) {
  const baseClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200";
  const activeClasses = "text-primary dark:text-primary-foreground bg-primary-light bg-opacity-10 dark:bg-primary-dark dark:bg-opacity-20 border-l-4 border-primary dark:border-primary-foreground";
  const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
  
  return (
    <Link href={href}>
      <a className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
        {icon}
        {children}
      </a>
    </Link>
  );
}
