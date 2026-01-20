'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FoodSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
      <CardContent className="pt-6 pb-0">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-16" />
      </CardFooter>
    </Card>
  );
}

export function FoodSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FoodSkeleton key={i} />
      ))}
    </div>
  );
}
