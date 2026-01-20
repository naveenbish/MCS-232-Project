'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  FolderOpen,
  ChartBar,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Users,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks';
import { logOutAuth } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: Package,
  },
  {
    title: 'Menu Management',
    href: '#',
    icon: UtensilsCrossed,
    children: [
      {
        title: 'Food Items',
        href: '/admin/food-items',
        icon: UtensilsCrossed,
      },
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: FolderOpen,
      },
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Archive,
  },
  {
    title: 'Reports & Analytics',
    href: '/admin/reports',
    icon: ChartBar,
  },
];

interface SidebarNavProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

export function SidebarNav({ collapsed = false, onCollapsedChange, onMobileClose }: SidebarNavProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logOutAuth());
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const [expanded, setExpanded] = React.useState(false);

    // Safety check for icon
    if (!Icon) {
      console.warn(`Missing icon for navigation item: ${item.title}`);
    }

    React.useEffect(() => {
      if (hasChildren && item.children) {
        const childActive = item.children.some(child => isActive(child.href));
        if (childActive) {
          setExpanded(true);
        }
      }
    }, [pathname, hasChildren, item.children]);

    if (hasChildren) {
      return (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-muted/50',
              level > 0 && 'pl-9'
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4" />}
              {!collapsed && <span>{item.title}</span>}
            </div>
            {!collapsed && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  expanded && 'rotate-90'
                )}
              />
            )}
          </button>
          {expanded && !collapsed && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink key={child.href} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-muted/50',
          active && 'bg-muted text-primary',
          level > 0 && 'pl-9'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          {!collapsed && <span className="text-xl">CraveCart Admin</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}