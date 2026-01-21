'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { FoodItem, CreateFoodItemDto, UpdateFoodItemDto } from '@/types';

export default function AdminFoodItemsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState<Partial<CreateFoodItemDto>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    isVeg: false,
    availabilityStatus: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // Fetch data
  const { data: foodItemsData, isLoading } = useGetFoodItemsQuery({
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
  });
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createFoodItem, { isLoading: isCreating }] = useCreateFoodItemMutation();
  const [updateFoodItem, { isLoading: isUpdating }] = useUpdateFoodItemMutation();
  const [deleteFoodItem] = useDeleteFoodItemMutation();

  const foodItems = foodItemsData?.data || [];
  const categories = categoriesData?.data?.categories || [];

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
    if (!confirm('Are you sure you want to delete this food item?')) return;

    try {
      const result = await deleteFoodItem(id).unwrap();
      if (result.success) {
        toast.success('Food item deleted successfully');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete food item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      image: '',
      isVeg: false,
      availabilityStatus: true,
    });
  };

  const openEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      categoryId: item.categoryId,
      image: item.image || '',
      isVeg: item.isVeg || false,
      availabilityStatus: item.availabilityStatus,
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
                className="gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Food Items Management</h1>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Food Item
            </Button>
          </div>
        </PageHeaderMain>
      </PageHeader>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Food Items ({foodItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category?.name || 'N/A'}</TableCell>
                    <TableCell>{formatPrice(item.price)}</TableCell>
                    <TableCell>
                      <Badge variant={item.isVeg ? 'success' : 'destructive'}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.availabilityStatus ? 'default' : 'secondary'}>
                        {item.availabilityStatus ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Food Item</DialogTitle>
            <DialogDescription>
              Create a new food item for your menu
            </DialogDescription>
          </DialogHeader>
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
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                placeholder="99.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                  id="availabilityStatus"
                  checked={formData.availabilityStatus}
                  onCheckedChange={(checked) => setFormData({ ...formData, availabilityStatus: checked })}
                />
                <Label htmlFor="availabilityStatus">Available</Label>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
            <DialogDescription>
              Update the food item details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isVeg"
                  checked={formData.isVeg}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                />
                <Label htmlFor="edit-isVeg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-availabilityStatus"
                  checked={formData.availabilityStatus}
                  onCheckedChange={(checked) => setFormData({ ...formData, availabilityStatus: checked })}
                />
                <Label htmlFor="edit-availabilityStatus">Available</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Food Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}