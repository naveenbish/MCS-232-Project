'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { logOutAuth } from '@/features/auth/authSlice';
import { clearUserDetails } from '@/features/userDetails/userDetailsSlice';
import { clearCart } from '@/features/cart/cartSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { ClientOnly } from '@/components/client-only';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Package,
  LogIn,
  User,
  LogOut,
  Settings,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuHeaderProps {
  cartItemCount: number;
  currentPage?: 'menu' | 'orders' | 'cart';
  showBackButton?: boolean;
}

export function MenuHeader({ cartItemCount, currentPage = 'menu', showBackButton = false }: MenuHeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userDetails);

  const handleLogout = () => {
    dispatch(logOutAuth());
    dispatch(clearUserDetails());
    dispatch(clearCart());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'orders':
        return 'My Orders';
      case 'cart':
        return 'Shopping Cart';
      default:
        return 'CraveCart Menu';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Button
              variant={currentPage === 'cart' ? 'default' : 'outline'}
              onClick={() => router.push('/cart')}
              className="relative cursor-pointer"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Orders Button */}
            <Button
              variant={currentPage === 'orders' ? 'default' : 'outline'}
              onClick={() => router.push('/orders')}
              className="cursor-pointer"
            >
              <Package className="mr-2 h-4 w-4" />
              My Orders
            </Button>

            {/* Dark Mode Toggle */}
            <ModeToggle />

            {/* Login/Profile Button */}
            <ClientOnly
              fallback={
                <Button variant="outline" size="icon" disabled>
                  <User className="h-4 w-4" />
                </Button>
              }
            >
              {user && user.id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="cursor-pointer">
                      <User className="h-4 w-4" />
                      <span className="sr-only">User Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">My Account</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/settings')}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push('/login')}
                  className="cursor-pointer"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
        </ClientOnly>
      </div>
    </div>
  );
}
