'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';

interface VegFilterProps {
  isVegOnly: boolean;
  onChange: (checked: boolean) => void;
}

export function VegFilter({ isVegOnly, onChange }: VegFilterProps) {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <Switch
        id="veg-only"
        checked={isVegOnly}
        onCheckedChange={onChange}
      />
      <Label htmlFor="veg-only" className="flex items-center gap-1.5 cursor-pointer">
        <Leaf className="h-4 w-4 text-green-600" />
        <span className="whitespace-nowrap">Veg Only</span>
      </Label>
    </div>
  );
}
