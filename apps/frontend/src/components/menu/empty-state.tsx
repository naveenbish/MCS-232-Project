'use client';

import { UtensilsCrossed } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = 'No items found matching your criteria.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <UtensilsCrossed className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}
