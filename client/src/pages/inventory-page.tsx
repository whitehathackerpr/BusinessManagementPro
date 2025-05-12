import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertInventorySchema, insertProductSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Loader2, 
  Plus,
  AlertCircle,
  RefreshCw,
  Tag,
  Bookmark
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  categoryId: number;
  inStock: boolean;
  minStockLevel: number | null;
  category?: {
    id: number;
    name: string;
  };
}

interface Inventory {
  id: number;
  productId: number;
  branchId: number;
  quantity: number;
  lastUpdated: string;
  product?: Product;
  branch?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Branch {
  id: number;
  name: string;
}

// Form types for Inventory and Products
type ProductFormValues = typeof insertProductSchema._type;
type InventoryFormValues = typeof insertInventorySchema._type;

export default function InventoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  // Fetch inventory, products, categories and branches
  const { data: inventory, isLoading: isLoadingInventory, error: inventoryError } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/product-categories'],
  });

  const { data: branches, isLoading: isLoadingBranches } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  // Forms for products and inventory
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      price: '',
      categoryId: 0,
      minStockLevel: 10,
    },
  });

  const inventoryForm = useForm<InventoryFormValues>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      productId: 0,
      branchId: 0,
      quantity: 0,
    },
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormValues) => {
      const res = await apiRequest('POST', '/api/products', {
        ...productData,
        price: parseFloat(productData.price.toString()),
        categoryId: parseInt(productData.categoryId.toString()),
        minStockLevel: parseInt(productData.minStockLevel?.toString() || '10'),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      setOpenProductDialog(false);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: { id: number; data: ProductFormValues }) => {
      const res = await apiRequest('PUT', `/api/products/${productData.id}`, {
        ...productData.data,
        price: parseFloat(productData.data.price.toString()),
        categoryId: parseInt(productData.data.categoryId.toString()),
        minStockLevel: parseInt(productData.data.minStockLevel?.toString() || '10'),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      setOpenProductDialog(false);
      productForm.reset();
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Inventory mutations
  const createInventoryMutation = useMutation({
    mutationFn: async (inventoryData: InventoryFormValues) => {
      const res = await apiRequest('POST', '/api/inventory', {
        ...inventoryData,
        productId: parseInt(inventoryData.productId.toString()),
        branchId: parseInt(inventoryData.branchId.toString()),
        quantity: parseInt(inventoryData.quantity.toString()),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
      });
      setOpenInventoryDialog(false);
      inventoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async (inventoryData: { id: number; data: InventoryFormValues }) => {
      const res = await apiRequest('PUT', `/api/inventory/${inventoryData.id}`, {
        ...inventoryData.data,
        productId: parseInt(inventoryData.data.productId.toString()),
        branchId: parseInt(inventoryData.data.branchId.toString()),
        quantity: parseInt(inventoryData.data.quantity.toString()),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
      });
      setOpenInventoryDialog(false);
      inventoryForm.reset();
      setEditingInventory(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter products and inventory by search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredInventory = inventory?.filter(item => 
    item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format price
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  // Handle form submissions
  const onProductSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const onInventorySubmit = (data: InventoryFormValues) => {
    if (editingInventory) {
      updateInventoryMutation.mutate({ id: editingInventory.id, data });
    } else {
      createInventoryMutation.mutate(data);
    }
  };

  // Open dialogs for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId,
      minStockLevel: product.minStockLevel || 10,
    });
    setOpenProductDialog(true);
  };

  const handleEditInventory = (item: Inventory) => {
    setEditingInventory(item);
    inventoryForm.reset({
      productId: item.productId,
      branchId: item.branchId,
      quantity: item.quantity,
    });
    setOpenInventoryDialog(true);
  };

  // Open dialogs for creating
  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      name: '',
      sku: '',
      description: '',
      price: '',
      categoryId: categories?.[0]?.id || 0,
      minStockLevel: 10,
    });
    setOpenProductDialog(true);
  };

  const handleAddInventory = () => {
    setEditingInventory(null);
    inventoryForm.reset({
      productId: products?.[0]?.id || 0,
      branchId: branches?.[0]?.id || 0,
      quantity: 0,
    });
    setOpenInventoryDialog(true);
  };

  // Error handling
  if (inventoryError && productsError) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading inventory data</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {inventoryError.message || productsError.message}
          </p>
        </div>
      </AppLayout>
    );
  }

  const isLoading = isLoadingInventory || isLoadingProducts || isLoadingCategories || isLoadingBranches;

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your products and inventory across all branches
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              className="pl-10" 
              placeholder="Search products or inventory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Product Dialog */}
          <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
            <DialogTrigger asChild>
              <Button 
                variant={activeTab === 'products' ? 'default' : 'outline'} 
                onClick={() => {
                  setActiveTab('products');
                  handleAddProduct();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Update the product details below.' 
                    : 'Fill in the information below to create a new product.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Wireless Headphones" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="WH-BT100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="High-quality wireless headphones with noise cancellation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="99.99" 
                              step="0.01" 
                              min="0"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value?.toString()}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                              {!categories?.length && (
                                <SelectItem value="0" disabled>No categories available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock Level</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            min="0"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {(createProductMutation.isPending || updateProductMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Inventory Dialog */}
          <Dialog open={openInventoryDialog} onOpenChange={setOpenInventoryDialog}>
            <DialogTrigger asChild>
              <Button 
                variant={activeTab === 'inventory' ? 'default' : 'outline'} 
                onClick={() => {
                  setActiveTab('inventory');
                  handleAddInventory();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingInventory ? 'Edit Inventory' : 'Add Inventory'}</DialogTitle>
                <DialogDescription>
                  {editingInventory 
                    ? 'Update the inventory details below.' 
                    : 'Fill in the information below to add inventory.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...inventoryForm}>
                <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)} className="space-y-4">
                  <FormField
                    control={inventoryForm.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                            {!products?.length && (
                              <SelectItem value="0" disabled>No products available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={inventoryForm.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches?.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                              </SelectItem>
                            ))}
                            {!branches?.length && (
                              <SelectItem value="0" disabled>No branches available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={inventoryForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="0"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createInventoryMutation.isPending || updateInventoryMutation.isPending}
                    >
                      {(createInventoryMutation.isPending || updateInventoryMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingInventory ? 'Update Inventory' : 'Add Inventory'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage stock levels across all branches
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredInventory?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory?.map((item) => {
                        const product = item.product;
                        const minStockLevel = product?.minStockLevel || 10;
                        const isLowStock = item.quantity <= minStockLevel;
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{product?.name || 'Unknown Product'}</TableCell>
                            <TableCell>{product?.sku || 'N/A'}</TableCell>
                            <TableCell>{item.branch?.name || `Branch ${item.branchId}`}</TableCell>
                            <TableCell>
                              <span className={isLowStock ? 'text-destructive' : ''}>
                                {item.quantity}
                              </span>
                              {isLowStock && (
                                <AlertCircle className="h-4 w-4 inline ml-2 text-destructive" />
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={isLowStock ? 'destructive' : (item.quantity > minStockLevel * 2 ? 'success' : 'warning')}>
                                {isLowStock ? 'Low Stock' : (item.quantity > minStockLevel * 2 ? 'Well Stocked' : 'Adequate')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditInventory(item)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Quantity
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredInventory?.length || 0} of {inventory?.length || 0} items
                </span>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
          
          {/* Low Stock Card */}
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that need to be restocked soon
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  filteredInventory?.filter(item => item.quantity <= (item.product?.minStockLevel || 10)).map(item => (
                    <div key={item.id} className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm">{item.product?.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <Tag className="h-3 w-3 inline mr-1" /> {item.product?.sku} - {item.branch?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-destructive font-bold">{item.quantity} left</span>
                        <button 
                          onClick={() => handleEditInventory(item)} 
                          className="block text-xs text-primary dark:text-primary-foreground mt-1"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && filteredInventory?.filter(item => item.quantity <= (item.product?.minStockLevel || 10)).length === 0 && (
                  <div className="col-span-full p-8 text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">All items are well stocked</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>
                            {categories?.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>{product.minStockLevel || 10}</TableCell>
                          <TableCell>
                            <Badge variant={product.inStock ? 'success' : 'destructive'}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredProducts?.length || 0} of {products?.length || 0} products
                </span>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
          
          {/* Categories Card */}
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mt-6">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Manage product categorization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoadingCategories ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))
                ) : categories?.length === 0 ? (
                  <div className="col-span-full p-8 text-center">
                    <Bookmark className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                    <Button className="mt-4" variant="outline" size="sm">
                      Add Category
                    </Button>
                  </div>
                ) : (
                  categories?.map(category => (
                    <div key={category.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {category.description || 'No description'}
                      </p>
                      <div className="mt-3">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {filteredProducts?.filter(p => p.categoryId === category.id).length || 0} products
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
