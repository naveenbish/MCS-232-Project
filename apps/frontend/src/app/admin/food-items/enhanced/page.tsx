'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import { useGetFoodItemsQuery } from '@/services/food';
import {
  useCreateFoodItemMutation,
  useUpdateFoodItemMutation,
  useDeleteFoodItemMutation,
} from '@/services/adminFood';
import { useGetCategoriesQuery } from '@/services/food';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Download,
  Upload,
  Filter,
  Search,
  MoreVertical,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ChevronDown,
  Percent,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FoodItem, CreateFoodItemDto, UpdateFoodItemDto } from '@/types';

export default function EnhancedAdminFoodItemsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showBulkPriceDialog, setShowBulkPriceDialog] = useState(false);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState({ type: 'increase', value: 10 });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateFoodItemDto>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    preparationTime: 15,
    isVeg: false,
    isAvailable: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // Fetch data
  const { data: foodItemsData, isLoading, refetch } = useGetFoodItemsQuery({
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
  });
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createFoodItem, { isLoading: isCreating }] = useCreateFoodItemMutation();
  const [updateFoodItem, { isLoading: isUpdating }] = useUpdateFoodItemMutation();
  const [deleteFoodItem] = useDeleteFoodItemMutation();

  const foodItems = foodItemsData?.data || [];
  const categories = categoriesData?.data?.categories || [];

  // Filtered and sorted items
  const processedItems = useMemo(() => {
    let filtered = [...foodItems];

    // Apply filters
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(item =>
        availabilityFilter === 'available' ? item.isAvailable : !item.isAvailable
      );
    }

    if (vegFilter !== 'all') {
      filtered = filtered.filter(item =>
        vegFilter === 'veg' ? item.isVeg : !item.isVeg
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'category':
          compareValue = (a.category?.name || '').localeCompare(b.category?.name || '');
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [foodItems, availabilityFilter, vegFilter, sortBy, sortOrder]);

  // Statistics
  const statistics = useMemo(() => ({
    total: foodItems.length,
    available: foodItems.filter(i => i.isAvailable).length,
    veg: foodItems.filter(i => i.isVeg).length,
    nonVeg: foodItems.filter(i => !i.isVeg).length,
    avgPrice: foodItems.reduce((sum, i) => sum + i.price, 0) / (foodItems.length || 1),
  }), [foodItems]);

  const handleAdd = async () => {
    try {
      const result = await createFoodItem(formData as CreateFoodItemDto).unwrap();
      if (result.success) {
        toast.success('Food item created successfully');
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create food item');
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      const result = await updateFoodItem({
        id: editingItem.id,
        data: formData as UpdateFoodItemDto,
      }).unwrap();
      if (result.success) {
        toast.success('Food item updated successfully');
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update food item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFoodItem(id).unwrap();
      if (result.success) {
        toast.success('Food item deleted successfully');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete food item');
    }
  };

  const handleBulkDelete = async () => {
    let successCount = 0;
    let errorCount = 0;

    for (const itemId of selectedItems) {
      try {
        await deleteFoodItem(itemId).unwrap();
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} items successfully`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} items`);
    }

    setSelectedItems([]);
    setShowDeleteConfirm(false);
  };

  const handleBulkAvailabilityToggle = async (available: boolean) => {
    let successCount = 0;
    let errorCount = 0;

    for (const itemId of selectedItems) {
      const item = foodItems.find(i => i.id === itemId);
      if (!item) continue;

      try {
        await updateFoodItem({
          id: itemId,
          data: { isAvailable: available },
        }).unwrap();
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Updated ${successCount} items to ${available ? 'available' : 'unavailable'}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} items`);
    }

    setSelectedItems([]);
  };

  const handleBulkPriceAdjustment = async () => {
    let successCount = 0;
    let errorCount = 0;

    for (const itemId of selectedItems) {
      const item = foodItems.find(i => i.id === itemId);
      if (!item) continue;

      let newPrice = item.price;
      if (bulkPriceAdjustment.type === 'increase') {
        newPrice = item.price * (1 + bulkPriceAdjustment.value / 100);
      } else if (bulkPriceAdjustment.type === 'decrease') {
        newPrice = item.price * (1 - bulkPriceAdjustment.value / 100);
      } else if (bulkPriceAdjustment.type === 'fixed') {
        newPrice = bulkPriceAdjustment.value;
      }

      try {
        await updateFoodItem({
          id: itemId,
          data: { price: Math.round(newPrice * 100) / 100 },
        }).unwrap();
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Updated prices for ${successCount} items`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} items`);
    }

    setSelectedItems([]);
    setShowBulkPriceDialog(false);
  };

  const handleDuplicate = async (item: FoodItem) => {
    try {
      const result = await createFoodItem({
        ...item,
        name: `${item.name} (Copy)`,
        categoryId: item.categoryId,
      } as CreateFoodItemDto).unwrap();
      if (result.success) {
        toast.success('Item duplicated successfully');
      }
    } catch (error: any) {
      toast.error('Failed to duplicate item');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Description', 'Category', 'Price', 'Veg', 'Available', 'Prep Time'],
      ...processedItems.map(item => [
        item.id,
        item.name,
        item.description,
        item.category?.name || '',
        item.price,
        item.isVeg ? 'Yes' : 'No',
        item.isAvailable ? 'Yes' : 'No',
        item.preparationTime,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-items-export.csv';
    a.click();
    toast.success('Food items exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');

      // Skip header and process data
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue;

        const categoryName = values[3];
        const category = categories.find(c => c.name === categoryName);

        try {
          await createFoodItem({
            name: values[1],
            description: values[2],
            categoryId: category?.id || '',
            price: parseFloat(values[4]),
            isVeg: values[5].toLowerCase() === 'yes',
            isAvailable: values[6].toLowerCase() === 'yes',
            preparationTime: parseInt(values[7]),
            imageUrl: '',
          }).unwrap();
        } catch (error) {
          console.error('Failed to import item:', values[1]);
        }
      }

      toast.success('Import completed');
      setShowImportDialog(false);
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      imageUrl: '',
      preparationTime: 15,
      isVeg: false,
      isAvailable: true,
    });
  };

  const openEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      preparationTime: item.preparationTime,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader>
        <PageHeaderMain>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Food Items Management</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </PageHeaderMain>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vegetarian</CardTitle>
              <div className="w-4 h-4 border-2 border-green-600 rounded-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.veg}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-Veg</CardTitle>
              <div className="w-4 h-4 border-2 border-red-600 rounded-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.nonVeg}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(statistics.avgPrice)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search food items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={(v: any) => setAvailabilityFilter(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={vegFilter} onValueChange={(v: any) => setVegFilter(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="nonveg">Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-muted rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {selectedItems.length} item(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Availability</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleBulkAvailabilityToggle(true)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Mark as Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAvailabilityToggle(false)}>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Mark as Unavailable
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Pricing</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setShowBulkPriceDialog(true)}>
                          <Percent className="mr-2 h-4 w-4" />
                          Adjust Prices
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Food Items Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Food Items ({processedItems.length})</CardTitle>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                  <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === processedItems.length && processedItems.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(processedItems.map(i => i.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prep Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {processedItems.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category?.name || 'N/A'}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>
                          <Badge variant={item.isVeg ? 'success' : 'destructive'}>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.preparationTime} mins</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                updateFoodItem({
                                  id: item.id,
                                  data: { isAvailable: !item.isAvailable },
                                });
                              }}>
                                {item.isAvailable ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Mark Unavailable
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Mark Available
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bulk Price Adjustment Dialog */}
      <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Price Adjustment</DialogTitle>
            <DialogDescription>
              Adjust prices for {selectedItems.length} selected items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select
                value={bulkPriceAdjustment.type}
                onValueChange={(value) => setBulkPriceAdjustment({ ...bulkPriceAdjustment, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase by %</SelectItem>
                  <SelectItem value="decrease">Decrease by %</SelectItem>
                  <SelectItem value="fixed">Set Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {bulkPriceAdjustment.type === 'fixed' ? 'New Price' : 'Percentage'}
              </Label>
              <Input
                type="number"
                value={bulkPriceAdjustment.value}
                onChange={(e) => setBulkPriceAdjustment({
                  ...bulkPriceAdjustment,
                  value: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkPriceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkPriceAdjustment}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Food Items</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import food items in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">Choose CSV file</span>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImport}
                />
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                CSV should contain: Name, Description, Category, Price, Veg, Available, Prep Time
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog - Reuse from original */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Food Item</DialogTitle>
            <DialogDescription>Create a new food item for your menu</DialogDescription>
          </DialogHeader>
          {/* Form content same as original */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Burger"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Delicious burger with cheese and vegetables"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="99.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationTime">Preparation Time (mins)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVeg"
                  checked={formData.isVeg}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="isAvailable">Available</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Food Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}