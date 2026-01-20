'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={selectedCategory === '' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('')}
        className="whitespace-nowrap cursor-pointer"
      >
        All
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="whitespace-nowrap cursor-pointer"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
