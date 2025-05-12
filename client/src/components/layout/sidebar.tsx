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
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.fullName || user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
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
        
        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            {theme === 'dark' ? (
              <Moon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Sun className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
            <span className="text-sm">Dark Mode</span>
            <div className="ml-auto">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
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
