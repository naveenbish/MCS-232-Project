'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, MapPin, Edit2, Trash2, Home, Briefcase, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  userId: string;
}

export function AddressManagement({ userId }: AddressManagementProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    label: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  // Load addresses from localStorage for demo
  useEffect(() => {
    const savedAddresses = localStorage.getItem(`addresses_${userId}`);
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, [userId]);

  const saveAddresses = (newAddresses: Address[]) => {
    localStorage.setItem(`addresses_${userId}`, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const handleSaveAddress = () => {
    if (!formData.label || !formData.address || !formData.city || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    let newAddresses = [...addresses];

    if (editingAddress) {
      newAddresses = addresses.map(addr =>
        addr.id === editingAddress.id ? { ...formData, id: addr.id } as Address : addr
      );
      toast.success('Address updated successfully');
    } else {
      const newAddress: Address = {
        ...formData as Address,
        id: Date.now().toString(),
      };

      // If this is the first address or marked as default
      if (addresses.length === 0 || formData.isDefault) {
        newAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        newAddress.isDefault = true;
      }

      newAddresses.push(newAddress);
      toast.success('Address added successfully');
    }

    saveAddresses(newAddresses);
    setShowAddDialog(false);
    setEditingAddress(null);
    resetForm();
  };

  const handleDeleteAddress = (id: string) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      toast.error('Cannot delete default address. Please set another address as default first.');
      return;
    }

    const newAddresses = addresses.filter(addr => addr.id !== id);
    saveAddresses(newAddresses);
    toast.success('Address deleted successfully');
  };

  const handleSetDefault = (id: string) => {
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(newAddresses);
    toast.success('Default address updated');
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {addresses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No addresses saved yet</p>
                <p className="text-sm">Add your first delivery address</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={address.isDefault ? 'border-primary' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getIcon(address.type)}
                              <span className="font-semibold">{address.label}</span>
                              {address.isDefault && (
                                <Badge variant="default" className="ml-2">
                                  <Check className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {address.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {address.address}
                            </p>
                            {address.landmark && (
                              <p className="text-sm text-muted-foreground mb-1">
                                Landmark: {address.landmark}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Phone: {address.phone}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefault(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingAddress(address);
                                setFormData(address);
                                setShowAddDialog(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingAddress(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Update your delivery address' : 'Add a new delivery address'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Address Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Mom's House"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House/Flat No., Building Name, Street"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near landmark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {addresses.length > 0 && !editingAddress && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="default">Set as default address</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}