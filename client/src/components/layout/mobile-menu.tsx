import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MoreHorizontal 
} from 'lucide-react';

export default function MobileMenu() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-around">
        <MobileMenuItem 
          href="/" 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          label="Dashboard" 
          active={location === '/'}
        />
        
        <MobileMenuItem 
          href="/users" 
          icon={<Users className="h-5 w-5" />} 
          label="Users" 
          active={location === '/users'}
        />
        
        <MobileMenuItem 
          href="/inventory" 
          icon={<Package className="h-5 w-5" />} 
          label="Inventory" 
          active={location === '/inventory'}
        />
        
        <MobileMenuItem 
          href="/more" 
          icon={<MoreHorizontal className="h-5 w-5" />} 
          label="More" 
          active={['/branches', '/customers', '/orders', '/analytics', '/settings'].includes(location)}
        />
      </div>
    </div>
  );
}

interface MobileMenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function MobileMenuItem({ href, icon, label, active }: MobileMenuItemProps) {
  return (
    <a 
      href={href} 
      className={`flex flex-col items-center py-2 px-4 ${
        active 
          ? 'text-primary dark:text-primary-foreground' 
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </a>
  );
}
