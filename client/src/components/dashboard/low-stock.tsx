import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart } from 'lucide-react';

interface StockItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
}

interface LowStockProps {
  items?: StockItem[];
}

export default function LowStock({ items = [] }: LowStockProps) {
  // Determine color based on quantity
  const getQuantityColor = (quantity: number) => {
    if (quantity <= 3) return "destructive";
    if (quantity <= 8) return "warning";
    return "secondary";
  };

  return (
    <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <CardHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Low Stock Items</CardTitle>
          <Button variant="link" className="text-primary dark:text-primary-foreground p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant={getQuantityColor(item.quantity)}>
                  {item.quantity} left
                </Badge>
                <Button variant="ghost" size="icon" className="ml-4 text-primary dark:text-primary-foreground">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No low stock items found</p>
            </li>
          )}
        </ul>
      </CardContent>
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" className="w-full">
            Restock Items
          </Button>
        </div>
      )}
    </Card>
  );
}
