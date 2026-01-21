'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import { useGetCategoriesQuery, useGetFoodItemsQuery } from '@/services/food';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateFoodItemMutation,
} from '@/services/adminFood';
import { toast } from 'sonner';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Eye, Package } from 'lucide-react';
import type { Category, CreateCategoryDto, UpdateCategoryDto, FoodItem } from '@/types';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [selectedItemForAssign, setSelectedItemForAssign] = useState<FoodItem | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<CreateCategoryDto>>({
    name: '',
    description: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // Fetch categories
  const { data: categoriesData, isLoading } = useGetCategoriesQuery();
  const { data: foodItemsData, refetch: refetchFoodItems } = useGetFoodItemsQuery(
    viewingCategory ? { categoryId: viewingCategory.id, limit: 100 } : undefined,
    { skip: !viewingCategory }
  );
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateFoodItem, { isLoading: isUpdatingItem }] = useUpdateFoodItemMutation();

  const categories = categoriesData?.data?.categories || [];
  const categoryItems = foodItemsData?.data || [];

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    try {
      const result = await createCategory(formData as CreateCategoryDto).unwrap();
      if (result.success) {
        toast.success('Category created successfully');
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create category');
    }
  };

  const handleEdit = async () => {
    if (!editingCategory) return;

    try {
      const result = await updateCategory({
        id: editingCategory.id,
        data: formData as UpdateCategoryDto,
      }).unwrap();
      if (result.success) {
        toast.success('Category updated successfully');
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All food items in this category will need to be reassigned.')) return;

    try {
      const result = await deleteCategory(id).unwrap();
      if (result.success) {
        toast.success('Category deleted successfully');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const openItemsDialog = (category: Category) => {
    setViewingCategory(category);
    setIsItemsDialogOpen(true);
  };

  const openAssignDialog = (item: FoodItem) => {
    setSelectedItemForAssign(item);
    setNewCategoryId(item.categoryId);
    setIsAssignDialogOpen(true);
  };

  const handleAssignCategory = async () => {
    if (!selectedItemForAssign || !newCategoryId) return;

    try {
      const result = await updateFoodItem({
        id: selectedItemForAssign.id,
        data: { categoryId: newCategoryId },
      }).unwrap();
      if (result.success) {
        toast.success('Item category updated successfully');
        setIsAssignDialogOpen(false);
        setSelectedItemForAssign(null);
        refetchFoodItems();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update item category');
    }
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
              <h1 className="text-2xl font-bold">Categories Management</h1>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </PageHeaderMain>
      </PageHeader>

      <main className="container mx-auto px-4 py-8">
        {/* Categories Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Active categories in menu</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => openItemsDialog(category)}
                      >
                        {category._count?.foodItems || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openItemsDialog(category)}
                          className="cursor-pointer"
                          title="View Items"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                          className="cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive cursor-pointer"
                          title="Delete Category"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing food items
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Beverages"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Refreshing drinks and beverages"
              />
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
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                'Update Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={(open: boolean) => {
        setIsItemsDialogOpen(open);
        if (!open) setViewingCategory(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items in &quot;{viewingCategory?.name}&quot;
            </DialogTitle>
            <DialogDescription>
              {categoryItems.length} food item(s) in this category
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {categoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items in this category yet.</p>
                <p className="text-sm mt-2">Add items from the Food Items management page.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryItems.map((item: FoodItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p>{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={item.availabilityStatus ? 'default' : 'secondary'}>
                          {item.availabilityStatus ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignDialog(item)}
                          className="cursor-pointer"
                        >
                          Change Category
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Category Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={(open: boolean) => {
        setIsAssignDialogOpen(open);
        if (!open) setSelectedItemForAssign(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Category</DialogTitle>
            <DialogDescription>
              Move &quot;{selectedItemForAssign?.name}&quot; to a different category
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Category</Label>
              <Select
                value={newCategoryId}
                onValueChange={setNewCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignCategory}
              disabled={isUpdatingItem || !newCategoryId || newCategoryId === selectedItemForAssign?.categoryId}
            >
              {isUpdatingItem ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}