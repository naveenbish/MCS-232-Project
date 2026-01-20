'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import { SidebarNav } from '@/components/admin/sidebar-nav';
import { MobileNav } from '@/components/admin/mobile-nav';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);

  // Redirect if not admin
  React.useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // Don't render anything until we confirm the user is an admin
  if (!user.id || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex h-full flex-col border-r bg-muted/40">
          <SidebarNav />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 md:hidden">
          <MobileNav />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">CraveCart Admin</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50/30 to-orange-100/30 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}