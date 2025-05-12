import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/lib/theme-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  Lock,
  Bell,
  Palette,
  Globe,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(160).optional(),
  username: z.string().min(2, { message: "Username must be at least 2 characters." })
    .max(30, { message: "Username must not be longer than 30 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only include letters, numbers, underscores, and hyphens.",
    }),
});

// Company profile form schema
const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  phoneNumber: z.string().min(5, { message: "Please enter a valid phone number." }),
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
  inventoryAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Security settings schema
const securityFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Appearance settings schema
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  colorScheme: z.enum(["blue", "green", "violet", "rose", "amber"]),
  fontSize: z.enum(["sm", "md", "lg", "xl"]),
});

// Define the type based on the schema
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type CompanyFormValues = z.infer<typeof companyFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
      bio: '',
    },
  });

  // Company form
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: '',
      website: '',
      taxId: '',
      address: '',
      phoneNumber: '',
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      orderUpdates: true,
      inventoryAlerts: true,
      marketingEmails: false,
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "system",
      colorScheme: "blue",
      fontSize: "md",
    },
  });

  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest('PATCH', '/api/user/profile', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message,
      });
    },
  });

  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  function onCompanySubmit(data: CompanyFormValues) {
    toast({
      title: 'Company settings updated',
      description: 'Your company profile has been successfully updated.',
    });
  }

  function onNotificationSubmit(data: NotificationFormValues) {
    toast({
      title: 'Notification settings updated',
      description: 'Your notification preferences have been saved.',
    });
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    toast({
      title: 'Password updated',
      description: 'Your password has been successfully changed.',
    });
  }

  function onAppearanceSubmit(data: AppearanceFormValues) {
    setTheme(data.theme);
    toast({
      title: 'Appearance settings updated',
      description: 'Your appearance preferences have been saved.',
    });
  }

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col space-y-1 p-2">
                <Button 
                  variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === 'company' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('company')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Company
                </Button>
                <Button 
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button 
                  variant={activeTab === 'appearance' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('appearance')}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Appearance
                </Button>
                <Button 
                  variant={activeTab === 'security' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('security')}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Security
                </Button>
                <Button 
                  variant={activeTab === 'help' ? 'default' : 'ghost'} 
                  className="justify-start" 
                  onClick={() => setActiveTab('help')}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a little bit about yourself"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Maximum 160 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Company Settings */}
          {activeTab === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
                <CardDescription>
                  Manage your company information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={companyForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID / VAT Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Company address"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications for important updates.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                              <FormDescription>
                                Receive push notifications in your browser.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="orderUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Order Updates</FormLabel>
                              <FormDescription>
                                Get notified for new orders and status changes.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="inventoryAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Inventory Alerts</FormLabel>
                              <FormDescription>
                                Get notified when products are low in stock.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Marketing Emails</FormLabel>
                              <FormDescription>
                                Receive emails about new features and promotions.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Save Preferences</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how BIZ_MANAGE_PRO looks for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={appearanceForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose between light, dark, or system theme.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={appearanceForm.control}
                        name="colorScheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Accent</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a color accent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="violet">Violet</SelectItem>
                                <SelectItem value="rose">Rose</SelectItem>
                                <SelectItem value="amber">Amber</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the primary color for your interface.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={appearanceForm.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Size</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a font size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sm">Small</SelectItem>
                                <SelectItem value="md">Medium</SelectItem>
                                <SelectItem value="lg">Large</SelectItem>
                                <SelectItem value="xl">Extra Large</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Adjust the font size for better readability.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Save Preferences</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Update Password</Button>
                    </div>
                  </form>
                </Form>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <h4 className="text-base font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Protect your account with 2FA.
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Support */}
          {activeTab === 'help' && (
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Find help resources and contact support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse our comprehensive documentation to learn how to use BIZ_MANAGE_PRO effectively.
                  </p>
                  <Button variant="outline" className="mt-2">
                    <FileText className="mr-2 h-4 w-4" />
                    View Documentation
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Need help? Our support team is ready to assist you.
                  </p>
                  <Button variant="default" className="mt-2">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                  <div className="space-y-4 mt-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="text-base font-medium">How do I add a new product?</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Go to Inventory, click on "Add New Product" and fill in the required details.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="text-base font-medium">How do I manage users?</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Navigate to User Management to add, edit or remove users from your organization.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="text-base font-medium">Can I export reports?</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Yes, you can export reports to CSV or PDF from the Analytics page using the export button.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}