'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import {
  useGetInventoryQuery,
  useGetInventoryStatsQuery,
  useGetLowStockItemsQuery,
  useRestockInventoryMutation,
  useAdjustStockMutation,
  useUpdateInventoryMutation,
  useCreateInventoryMutation,
  useInitializeInventoryMutation,
} from '@/services/adminInventory';
import { useGetCategoriesQuery } from '@/services/food';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Archive,
  Clock,
  Database,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RestockDialogState {
  open: boolean;
  item: any | null;
  quantity: number;
  supplier: string;
  costPrice: number;
}

interface AdjustStockDialogState {
  open: boolean;
  item: any | null;
  adjustment: number;
  reason: string;
}

interface EditInventoryDialogState {
  open: boolean;
  item: any | null;
  formData: {
    minStock: number;
    maxStock: number;
    unit: string;
    supplier?: string;
    location?: string;
    notes?: string;
  };
}

export default function InventoryManagementPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [restockDialog, setRestockDialog] = useState<RestockDialogState>({
    open: false,
    item: null,
    quantity: 0,
    supplier: '',
    costPrice: 0,
  });

  const [adjustDialog, setAdjustDialog] = useState<AdjustStockDialogState>({
    open: false,
    item: null,
    adjustment: 0,
    reason: '',
  });

  const [editDialog, setEditDialog] = useState<EditInventoryDialogState>({
    open: false,
    item: null,
    formData: {
      minStock: 10,
      maxStock: 100,
      unit: 'units',
      supplier: '',
      location: '',
      notes: '',
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // API Queries
  const { data: inventoryData, isLoading, refetch } = useGetInventoryQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    categoryId: categoryFilter || undefined,
    stockStatus: stockFilter !== 'all' ? stockFilter as any : undefined,
  });

  const { data: statsData } = useGetInventoryStatsQuery();
  const { data: lowStockData } = useGetLowStockItemsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  // Mutations
  const [restockInventory, { isLoading: restocking }] = useRestockInventoryMutation();
  const [adjustStock, { isLoading: adjusting }] = useAdjustStockMutation();
  const [updateInventory, { isLoading: updating }] = useUpdateInventoryMutation();
  const [createInventory] = useCreateInventoryMutation();
  const [initializeInventory, { isLoading: initializing }] = useInitializeInventoryMutation();

  // Extract data
  const inventory = inventoryData?.data?.inventory || [];
  const pagination = inventoryData?.data?.pagination;
  const stats = statsData?.data?.stats;
  const lowStockItems = lowStockData?.data?.items || [];
  const categories = categoriesData?.data?.categories || [];

  // Update page if out of bounds
  useEffect(() => {
    if (pagination && currentPage > pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(1);
    }
  }, [pagination, currentPage]);

  const getStockStatusBadge = (status?: string, stockPercentage?: number) => {
    if (!status && stockPercentage !== undefined) {
      // Calculate status from percentage
      if (stockPercentage === 0) return <Badge variant="destructive">Out of Stock</Badge>;
      if (stockPercentage <= 25) return <Badge variant="destructive">Critical</Badge>;
      if (stockPercentage <= 50) return <Badge variant="secondary">Low</Badge>;
      if (stockPercentage >= 90) return <Badge variant="outline">Overstocked</Badge>;
      return <Badge variant="success">Optimal</Badge>;
    }

    switch (status) {
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      case 'optimal':
        return <Badge variant="success">Optimal</Badge>;
      case 'overstocked':
        return <Badge variant="outline">Overstocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRestock = async () => {
    if (!restockDialog.item || restockDialog.quantity <= 0) return;

    try {
      await restockInventory({
        foodItemId: restockDialog.item.foodItemId,
        data: {
          quantity: restockDialog.quantity,
          supplier: restockDialog.supplier || undefined,
          costPrice: restockDialog.costPrice || undefined,
        },
      }).unwrap();

      toast.success(`Restocked ${restockDialog.quantity} units of ${restockDialog.item.foodItem?.name}`);
      setRestockDialog({ open: false, item: null, quantity: 0, supplier: '', costPrice: 0 });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to restock item');
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustDialog.item || adjustDialog.adjustment === 0 || !adjustDialog.reason) return;

    try {
      await adjustStock({
        foodItemId: adjustDialog.item.foodItemId,
        data: {
          adjustment: adjustDialog.adjustment,
          reason: adjustDialog.reason,
        },
      }).unwrap();

      toast.success('Stock adjusted successfully');
      setAdjustDialog({ open: false, item: null, adjustment: 0, reason: '' });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to adjust stock');
    }
  };

  const handleUpdateInventory = async () => {
    if (!editDialog.item) return;

    try {
      await updateInventory({
        foodItemId: editDialog.item.foodItemId,
        data: editDialog.formData,
      }).unwrap();

      toast.success('Inventory updated successfully');
      setEditDialog({ open: false, item: null, formData: {
        minStock: 10,
        maxStock: 100,
        unit: 'units',
      }});
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update inventory');
    }
  };

  const handleInitializeInventory = async () => {
    try {
      const result = await initializeInventory().unwrap();
      toast.success(result.data?.message || 'Inventory initialized successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to initialize inventory');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Item', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Status', 'Supplier', 'Last Restocked'],
      ...inventory.map((item: any) => [
        item.foodItem?.name || '',
        item.foodItem?.category?.name || '',
        item.currentStock,
        item.minStock,
        item.maxStock,
        item.stockStatus || '',
        item.supplier || '',
        item.lastRestocked ? formatDate(new Date(item.lastRestocked)) : '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Inventory exported successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader>
          <PageHeaderMain>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </PageHeaderMain>
        </PageHeader>
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </main>
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
              <h1 className="text-2xl font-bold">Inventory Management</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {inventory.length === 0 && (
                <Button onClick={handleInitializeInventory} disabled={initializing}>
                  {initializing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Initialize Inventory
                </Button>
              )}
            </div>
          </div>
        </PageHeaderMain>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</div>
              <p className="text-xs text-muted-foreground">Need immediate restock</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.lowStock || 0}</div>
              <p className="text-xs text-muted-foreground">Below minimum</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimal Stock</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.optimal || 0}</div>
              <p className="text-xs text-muted-foreground">Good levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats?.totalValue || 0)}</div>
              <p className="text-xs text-muted-foreground">Inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {stats && stats.outOfStock > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Stock Alert</AlertTitle>
            <AlertDescription>
              {stats.outOfStock} items are out of stock and need immediate restocking.
            </AlertDescription>
          </Alert>
        )}

        {lowStockItems.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Low Stock Warning</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} items are running low and should be restocked soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="lowstock">Low Stock Items</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPage(1);
                  }}>
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
                  <Select value={stockFilter} onValueChange={(value) => {
                    setStockFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="optimal">Optimal</SelectItem>
                      <SelectItem value="overstocked">Overstocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage your stock levels and track inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Last Restocked</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No inventory items found.
                            {inventory.length === 0 && !searchQuery && !categoryFilter && (
                              <span className="block mt-2">
                                Click "Initialize Inventory" to get started.
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        inventory.map((item: any) => {
                          const stockPercentage = item.stockPercentage ||
                            (item.currentStock / item.maxStock) * 100;

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.foodItem?.name}</div>
                                  {item.foodItem?.price && (
                                    <div className="text-sm text-muted-foreground">
                                      Price: {formatPrice(item.foodItem.price)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{item.foodItem?.category?.name || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.currentStock}</span>
                                    <span className="text-sm text-muted-foreground">
                                      / {item.maxStock} {item.unit}
                                    </span>
                                  </div>
                                  <Progress value={stockPercentage} className="h-2" />
                                  <div className="text-xs text-muted-foreground">
                                    Min: {item.minStock} {item.unit}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getStockStatusBadge(item.stockStatus, stockPercentage)}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.supplier && <div>{item.supplier}</div>}
                                  {item.location && (
                                    <div className="text-muted-foreground">{item.location}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {item.lastRestocked
                                    ? formatDate(new Date(item.lastRestocked))
                                    : 'Never'}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setRestockDialog({
                                          open: true,
                                          item,
                                          quantity: 0,
                                          supplier: item.supplier || '',
                                          costPrice: item.costPrice || 0,
                                        });
                                      }}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Restock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setAdjustDialog({
                                          open: true,
                                          item,
                                          adjustment: 0,
                                          reason: '',
                                        });
                                      }}
                                    >
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Adjust Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditDialog({
                                          open: true,
                                          item,
                                          formData: {
                                            minStock: item.minStock,
                                            maxStock: item.maxStock,
                                            unit: item.unit,
                                            supplier: item.supplier || '',
                                            location: item.location || '',
                                            notes: item.notes || '',
                                          },
                                        });
                                      }}
                                    >
                                      <MoreVertical className="mr-2 h-4 w-4" />
                                      Edit Settings
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lowstock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Items that need restocking based on minimum stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No low stock items at the moment
                    </div>
                  ) : (
                    lowStockItems.map((item: any) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.food_name || item.foodItem?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Category: {item.category_name || item.foodItem?.category?.name}
                            </p>
                            <p className="text-sm">
                              Current: <span className="font-medium text-red-600">{item.current_stock || item.currentStock}</span> /
                              Min: {item.min_stock || item.minStock} {item.unit}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setRestockDialog({
                                open: true,
                                item,
                                quantity: 0,
                                supplier: item.supplier || '',
                                costPrice: item.cost_price || item.costPrice || 0,
                              });
                            }}
                          >
                            Restock Now
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Restock Dialog */}
      <Dialog open={restockDialog.open} onOpenChange={(open) => {
        if (!open) {
          setRestockDialog({ open: false, item: null, quantity: 0, supplier: '', costPrice: 0 });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock for {restockDialog.item?.foodItem?.name || restockDialog.item?.food_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <div className="text-2xl font-bold">
                {restockDialog.item?.currentStock || restockDialog.item?.current_stock || 0} / {restockDialog.item?.maxStock || restockDialog.item?.max_stock || 100} units
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockDialog.quantity}
                onChange={(e) => setRestockDialog({
                  ...restockDialog,
                  quantity: parseInt(e.target.value) || 0
                })}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={restockDialog.supplier}
                onChange={(e) => setRestockDialog({
                  ...restockDialog,
                  supplier: e.target.value
                })}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price per Unit (Optional)</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={restockDialog.costPrice}
                onChange={(e) => setRestockDialog({
                  ...restockDialog,
                  costPrice: parseFloat(e.target.value) || 0
                })}
                placeholder="Enter cost price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockDialog({ open: false, item: null, quantity: 0, supplier: '', costPrice: 0 })}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={restocking || restockDialog.quantity <= 0}>
              {restocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAdjustDialog({ open: false, item: null, adjustment: 0, reason: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust stock for {adjustDialog.item?.foodItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <div className="text-2xl font-bold">
                {adjustDialog.item?.currentStock || 0} {adjustDialog.item?.unit || 'units'}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustment">Adjustment (+/-)</Label>
              <Input
                id="adjustment"
                type="number"
                value={adjustDialog.adjustment}
                onChange={(e) => setAdjustDialog({
                  ...adjustDialog,
                  adjustment: parseInt(e.target.value) || 0
                })}
                placeholder="Enter adjustment (negative for reduction)"
              />
              <p className="text-sm text-muted-foreground">
                New stock: {(adjustDialog.item?.currentStock || 0) + adjustDialog.adjustment}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={adjustDialog.reason}
                onChange={(e) => setAdjustDialog({
                  ...adjustDialog,
                  reason: e.target.value
                })}
                placeholder="Enter reason for adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog({ open: false, item: null, adjustment: 0, reason: '' })}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={adjusting || adjustDialog.adjustment === 0 || !adjustDialog.reason}
            >
              {adjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adjust
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!open) {
          setEditDialog({ open: false, item: null, formData: {
            minStock: 10,
            maxStock: 100,
            unit: 'units',
          }});
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Settings</DialogTitle>
            <DialogDescription>
              Update settings for {editDialog.item?.foodItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={editDialog.formData.minStock}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    formData: {
                      ...editDialog.formData,
                      minStock: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">Maximum Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="1"
                  value={editDialog.formData.maxStock}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    formData: {
                      ...editDialog.formData,
                      maxStock: parseInt(e.target.value) || 1
                    }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={editDialog.formData.unit}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  formData: {
                    ...editDialog.formData,
                    unit: e.target.value
                  }
                })}
                placeholder="e.g., units, kg, lbs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Default Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={editDialog.formData.supplier}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  formData: {
                    ...editDialog.formData,
                    supplier: e.target.value
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location (Optional)</Label>
              <Input
                id="location"
                value={editDialog.formData.location}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  formData: {
                    ...editDialog.formData,
                    location: e.target.value
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={editDialog.formData.notes}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  formData: {
                    ...editDialog.formData,
                    notes: e.target.value
                  }
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, item: null, formData: {
              minStock: 10,
              maxStock: 100,
              unit: 'units',
            }})}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInventory} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}