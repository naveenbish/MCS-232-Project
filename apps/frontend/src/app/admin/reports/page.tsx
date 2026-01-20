'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks';
import {
  useGetSalesReportQuery,
  useGetUserReportQuery,
  useGetOrderReportQuery,
  useGetPaymentReportQuery,
} from '@/services/adminReport';
import { formatPrice } from '@/lib/utils';
import { PageHeader, PageHeaderMain } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReportsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userDetails);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  // Redirect if not admin
  useEffect(() => {
    if (user.id && user.role !== 'admin') {
      router.push('/menu');
    }
  }, [user, router]);

  // Prepare query params
  const reportParams = {
    startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    groupBy,
  };

  // Fetch reports
  const { data: salesReport, isLoading: isSalesLoading } = useGetSalesReportQuery(reportParams);
  const { data: userReport, isLoading: isUserLoading } = useGetUserReportQuery(reportParams);
  const { data: orderReport, isLoading: isOrderLoading } = useGetOrderReportQuery(reportParams);
  const { data: paymentReport, isLoading: isPaymentLoading } = useGetPaymentReportQuery(reportParams);

  const sales = salesReport?.data;
  const users = userReport?.data;
  const orders = orderReport?.data;
  const payments = paymentReport?.data;

  const exportReport = (type: string) => {
    // In a real implementation, this would generate and download a CSV/PDF
    toast.info(`Export ${type} report feature coming soon`);
  };

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
              <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            </div>
            <Button
              onClick={() => exportReport('all')}
              className="gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </PageHeaderMain>
      </PageHeader>

      <main className="container mx-auto px-4 py-8">
        {/* Date Range and Group By Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label>Date Range</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="date"
                    value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="date"
                    value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="w-full sm:w-[200px]">
                <Label>Group By</Label>
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Sales Report */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSalesLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {formatPrice(sales?.totalRevenue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sales?.percentageChange && sales.percentageChange > 0 ? (
                          <span className="text-green-600">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            +{sales.percentageChange}% from last period
                          </span>
                        ) : (
                          <span className="text-red-600">
                            <TrendingDown className="h-3 w-3 inline mr-1" />
                            {sales?.percentageChange}% from last period
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSalesLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{sales?.totalOrders || 0}</div>
                      <p className="text-xs text-muted-foreground">Orders in period</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSalesLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {formatPrice(sales?.averageOrderValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Per order</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sales Chart would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Report */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {isOrderLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{orders?.totalOrders || 0}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  {isOrderLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {orders?.completedOrders || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                  {isOrderLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">
                      {orders?.cancelledOrders || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {isOrderLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {orders?.averageDeliveryTime || 0} mins
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isOrderLoading ? (
                  <Skeleton className="h-[200px]" />
                ) : (
                  <div className="space-y-4">
                    {orders?.statusBreakdown?.map((status: any) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{status.status}</span>
                          <span className="text-sm text-muted-foreground">
                            ({status.percentage}%)
                          </span>
                        </div>
                        <span className="text-sm font-bold">{status.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Report */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isUserLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{users?.totalUsers || 0}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isUserLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {users?.newUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isUserLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{users?.activeUsers || 0}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Growth Chart would go here */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Report */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isPaymentLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatPrice(payments?.totalAmount || 0)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Successful</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isPaymentLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {payments?.successfulPayments || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isPaymentLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">
                      {payments?.failedPayments || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {isPaymentLoading ? (
                  <Skeleton className="h-[200px]" />
                ) : (
                  <div className="space-y-4">
                    {payments?.methodBreakdown?.map((method: any) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{method.method}</span>
                          <span className="text-sm text-muted-foreground">
                            ({method.percentage}%)
                          </span>
                        </div>
                        <span className="text-sm font-bold">{formatPrice(method.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Add missing import
import { toast } from 'sonner';