import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Branch, insertBranchSchema } from '@shared/schema';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Loader2, 
  Phone, 
  User,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BranchFormValues = typeof insertBranchSchema._type;

export default function BranchesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Fetch branches
  const { data: branches, isLoading, error } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  // Form for creating/editing branches
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(insertBranchSchema),
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      manager: '',
    },
  });

  // Create branch mutation
  const createBranchMutation = useMutation({
    mutationFn: async (branchData: BranchFormValues) => {
      const res = await apiRequest('POST', '/api/branches', branchData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update branch mutation
  const updateBranchMutation = useMutation({
    mutationFn: async (branchData: { id: number; data: BranchFormValues }) => {
      const res = await apiRequest('PUT', `/api/branches/${branchData.id}`, branchData.data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });
      setOpenDialog(false);
      form.reset();
      setEditingBranch(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete branch mutation
  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: number) => {
      await apiRequest('DELETE', `/api/branches/${branchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter branches by search query
  const filteredBranches = branches?.filter(branch => 
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.manager && branch.manager.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle form submission
  const onSubmit = (data: BranchFormValues) => {
    if (editingBranch) {
      updateBranchMutation.mutate({ id: editingBranch.id, data });
    } else {
      createBranchMutation.mutate(data);
    }
  };

  // Open dialog for editing a branch
  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      address: branch.address,
      phoneNumber: branch.phoneNumber || '',
      manager: branch.manager || '',
    });
    setOpenDialog(true);
  };

  // Open dialog for creating a new branch
  const handleAddBranch = () => {
    setEditingBranch(null);
    form.reset({
      name: '',
      address: '',
      phoneNumber: '',
      manager: '',
    });
    setOpenDialog(true);
  };

  // Delete branch confirmation
  const handleDeleteBranch = (branchId: number) => {
    // In a real app, you'd show a confirmation dialog first
    if (window.confirm('Are you sure you want to delete this branch?')) {
      deleteBranchMutation.mutate(branchId);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading branches</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Management</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your business locations and their details
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              className="pl-10" 
              placeholder="Search branches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddBranch}>
                <Building2 className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                <DialogDescription>
                  {editingBranch 
                    ? 'Update the branch details below.' 
                    : 'Fill in the information below to create a new branch.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Name</FormLabel>
                        <FormControl>
                          <Input placeholder="New York Branch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Broadway, New York, NY 10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (212) 555-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Manager</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                    >
                      {(createBranchMutation.isPending || updateBranchMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingBranch ? 'Update Branch' : 'Create Branch'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <CardContent className="p-6 flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ))
        ) : filteredBranches?.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 col-span-3">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No branches found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Create your first branch to get started with managing your business locations.
              </p>
              <Button onClick={handleAddBranch}>
                <Building2 className="h-4 w-4 mr-2" />
                Add Your First Branch
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBranches?.map((branch) => (
            <Card key={branch.id} className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex justify-between items-start p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-primary-light bg-opacity-20 flex items-center justify-center mr-3">
                    <Building2 className="h-5 w-5 text-primary dark:text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{branch.name}</h3>
                    <Badge variant={branch.active ? 'success' : 'destructive'}>
                      {branch.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
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
                    <DropdownMenuItem onClick={() => handleEditBranch(branch)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{branch.address}</span>
                  </div>
                  
                  {branch.phoneNumber && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{branch.phoneNumber}</span>
                    </div>
                  )}
                  
                  {branch.manager && (
                    <div className="flex items-start">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Manager: {branch.manager}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <Card className="bg-white dark:bg-gray-900 backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <CardTitle>All Branches</CardTitle>
          <CardDescription>
            {filteredBranches?.length || 0} branch{filteredBranches?.length !== 1 ? 'es' : ''} in total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredBranches?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches?.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>{branch.manager || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={branch.active ? 'success' : 'destructive'}>
                          {branch.active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handleEditBranch(branch)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
      </Card>
    </AppLayout>
  );
}
