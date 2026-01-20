'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type OrderStatus = 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled';
export type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';

interface OrderFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: OrderStatus) => void;
  onDateRangeChange: (range: DateRange, customDates?: { from?: Date; to?: Date }) => void;
  onPriceRangeChange: (min?: number, max?: number) => void;
  activeFiltersCount?: number;
}

export function OrderFilters({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onPriceRangeChange,
  activeFiltersCount = 0
}: OrderFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<OrderStatus>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatusChange = (value: OrderStatus) => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value);
    if (value !== 'custom') {
      setCustomDateFrom(undefined);
      setCustomDateTo(undefined);
      onDateRangeChange(value);
    }
  };

  const handleCustomDateChange = () => {
    if (dateRange === 'custom') {
      onDateRangeChange('custom', { from: customDateFrom, to: customDateTo });
    }
  };

  const handlePriceRangeChange = () => {
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    onPriceRangeChange(min, max);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatus('all');
    setDateRange('all');
    setCustomDateFrom(undefined);
    setCustomDateTo(undefined);
    setMinPrice('');
    setMaxPrice('');
    onSearchChange('');
    onStatusChange('all');
    onDateRangeChange('all');
    onPriceRangeChange();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Orders</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search by order ID, restaurant, or items..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Order Status</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="processing">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Processing
                </div>
              </SelectItem>
              <SelectItem value="delivered">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Delivered
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Cancelled
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger id="date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateFrom ? format(customDateFrom, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateFrom}
                    onSelect={setCustomDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateTo ? format(customDateTo, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateTo}
                    onSelect={setCustomDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleCustomDateChange}
              className="col-span-2"
              size="sm"
            >
              Apply Date Range
            </Button>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Price Range Filter */}
        {showAdvanced && (
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <Button
              onClick={handlePriceRangeChange}
              size="sm"
              className="w-full"
            >
              Apply Price Range
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}