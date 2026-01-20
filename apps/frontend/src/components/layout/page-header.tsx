'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function PageHeader({
  children,
  className,
  sticky = true
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
        sticky && "sticky top-0 z-50",
        className
      )}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </header>
  );
}

interface PageHeaderMainProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderMain({ children, className }: PageHeaderMainProps) {
  return (
    <div className={cn("py-4", className)}>
      {children}
    </div>
  );
}

interface PageHeaderFiltersProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderFilters({ children, className }: PageHeaderFiltersProps) {
  return (
    <div className={cn("pb-4 -mt-2", className)}>
      {children}
    </div>
  );
}