import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  Calendar,
  User,
  Package,
  Clock,
  CreditCard
} from 'lucide-react';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
  });
  
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Filter orders based on search query
  const filteredOrders = orders?.filter(order => 
    order.id.toString().includes(searchQuery) ||
    order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading orders data</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all customer orders and track their status.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              className="pl-10 w-64" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>
      
      {/* Premium Feature: Orders Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <ShoppingCart className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Orders</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (orders?.length || 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Completed</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-50">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (orders?.filter(o => o.status === 'completed')?.length || 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 border-yellow-100 dark:border-yellow-900">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Processing</p>
                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-50">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (orders?.filter(o => o.status === 'processing' || o.status === 'pending')?.length || 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-violet-100 dark:border-violet-900">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900">
                <CreditCard className="h-5 w-5 text-violet-700 dark:text-violet-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Revenue</p>
                <h3 className="text-2xl font-bold text-violet-900 dark:text-violet-50">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            All orders placed by customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No orders found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        {order.customer?.name || 'Unknown Customer'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {formatDate(order.orderDate)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.totalAmount || 0)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Check className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* New Order Dialog - Mockup Only */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Enter the details for a new customer order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map(customer => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {formatCurrency(parseFloat(product.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" defaultValue="1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="pending">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "Order created",
                description: "The order has been successfully created.",
              });
              setIsDialogOpen(false);
            }}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}