'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logOutAuth } from '@/features/auth/authSlice';
import { clearUserDetails } from '@/features/userDetails/userDetailsSlice';
import { clearCart } from '@/features/cart/cartSlice';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  LayoutDashboard,
  LogOut,
  User,
  Mail,
  Shield,
  Hash,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { AddressManagement } from '@/components/profile/address-management';
import { FavoriteItems } from '@/components/profile/favorite-items';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userDetails);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logOutAuth());
      dispatch(clearUserDetails());
      dispatch(clearCart());
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'US';
  };

  const menuItems = [
    {
      title: 'My Orders',
      icon: Package,
      description: 'View your order history',
      onClick: () => router.push('/orders'),
      show: true,
    },
    {
      title: 'Admin Dashboard',
      icon: LayoutDashboard,
      description: 'Manage your restaurant',
      onClick: () => router.push('/admin'),
      show: user.role === 'admin',
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      description: 'Manage payment options',
      onClick: () => toast.info('Payment methods coming soon'),
      show: true,
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Configure notifications',
      onClick: () => toast.info('Notifications settings coming soon'),
      show: true,
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help with your account',
      onClick: () => toast.info('Help center coming soon'),
      show: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-950">
      {/* Unified Header with Glassmorphism */}
      <PageHeader>
        <PageHeaderMain>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <h1 className="text-xl font-semibold">Profile</h1>

            <ModeToggle />
          </div>
        </PageHeaderMain>
      </PageHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                  {getInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 justify-center sm:justify-start pt-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                      <Shield className="h-3 w-3" />
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowEditDialog(true)}
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Address Management */}
        <div className="mb-6">
          <AddressManagement userId={user.id || ''} />
        </div>

        {/* Favorite Items */}
        <div className="mb-6">
          <FavoriteItems userId={user.id || ''} />
        </div>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <p className="font-medium">{user.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Type
                </Label>
                <p className="font-medium capitalize">{user.role}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  User ID
                </Label>
                <p className="font-mono text-sm text-muted-foreground">{user.id}</p>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-medium">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive order updates via email
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time order updates
                    </p>
                  </div>
                  <Switch id="push-notifications" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive offers and promotions
                    </p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuItems.filter(item => item.show).map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-between h-auto p-4 hover:bg-muted"
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="rounded-lg bg-muted p-2">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </div>
  );
}