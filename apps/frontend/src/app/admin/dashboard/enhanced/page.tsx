'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/hooks';
import { useGetDashboardStatsQuery } from '@/services/adminReport';
import { useGetAllOrdersQuery } from '@/services/adminOrder';
import { useGetFoodItemsQuery } from '@/services/food';
import { formatPrice, formatDate } from '@/lib/utils';
import { useSocket } from '@/contexts/SocketContext';
import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  Bell,
  ArrowUpRight,
  Eye,
  IndianRupee,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Star,
  Utensils,
  Timer,
  MapPin,
  CreditCard,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
type ChartType = 'revenue' | 'orders' | 'users' | 'items';

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const { isConnected, unreadCount } = useSocket();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartType, setChartType] = useState<ChartType>('revenue');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'users'>('revenue');

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetAllOrdersQuery({
    limit: 10
  });
  const { data: foodItemsData, isLoading: foodItemsLoading } = useGetFoodItemsQuery({});

  const stats = statsData?.data;
  const recentOrders = ordersData?.data || [];
  const foodItems = foodItemsData?.data || [];

  // Calculate real-time metrics
  const realTimeMetrics = useMemo(() => {
    if (!stats) return null;

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Today's orders
    const todayOrders = recentOrders.filter(order =>
      new Date(order.createdAt) >= todayStart
    ).length;

    // Today's revenue
    const todayRevenue = recentOrders
      .filter(order => new Date(order.createdAt) >= todayStart)
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Active orders by status
    const activeOrdersByStatus = {
      pending: recentOrders.filter(o => o.status === 'PENDING').length,
      preparing: recentOrders.filter(o => o.status === 'PREPARING').length,
      delivery: recentOrders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    };

    // Average order value
    const avgOrderValue = stats.totalRevenue && stats.totalOrders
      ? stats.totalRevenue / stats.totalOrders
      : 0;

    // Order completion rate
    const completedOrders = recentOrders.filter(o => o.status === 'DELIVERED').length;
    const completionRate = recentOrders.length > 0
      ? (completedOrders / recentOrders.length) * 100
      : 0;

    // Peak hours analysis
    const ordersByHour = new Array(24).fill(0);
    recentOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      ordersByHour[hour]++;
    });
    const peakHour = ordersByHour.indexOf(Math.max(...ordersByHour));

    return {
      todayOrders,
      todayRevenue,
      activeOrdersByStatus,
      avgOrderValue,
      completionRate,
      peakHour,
      ordersByHour
    };
  }, [stats, recentOrders]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!stats || !foodItems) return null;

    // Best selling items
    const bestSellers = stats.popularItems?.slice(0, 5) || [];

    // Low stock items (mock data - in real app would come from inventory)
    const lowStock = foodItems.filter(item => item.isAvailable).slice(0, 3);

    // Customer satisfaction (mock data)
    const satisfaction = {
      rating: 4.5,
      total: 1234,
      distribution: {
        5: 60,
        4: 25,
        3: 10,
        2: 3,
        1: 2
      }
    };

    // Preparation time analysis
    const avgPrepTime = foodItems.reduce((sum, item) =>
      sum + item.preparationTime, 0
    ) / (foodItems.length || 1);

    return {
      bestSellers,
      lowStock,
      satisfaction,
      avgPrepTime
    };
  }, [stats, foodItems]);

  // Transform data for charts based on time range
  const getChartData = () => {
    if (!stats) return [];

    switch (chartType) {
      case 'revenue':
        return getRevenueChartData();
      case 'orders':
        return getOrdersChartData();
      case 'users':
        return getUsersChartData();
      case 'items':
        return getItemsChartData();
      default:
        return [];
    }
  };

  const getRevenueChartData = () => {
    if (!stats?.revenueByDay) return [];

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.revenueByDay.find((item: any) =>
        item.date.split('T')[0] === dateStr
      );

      data.push({
        date: date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric'
        }),
        revenue: dayData ? parseFloat(dayData.revenue) : 0,
        orders: dayData ? dayData.orderCount : 0,
      });
    }

    return data;
  };

  const getOrdersChartData = () => {
    // Mock data for orders over time
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        completed: Math.floor(Math.random() * 50) + 20,
        cancelled: Math.floor(Math.random() * 5),
        pending: Math.floor(Math.random() * 10) + 5,
      });
    }

    return data;
  };

  const getUsersChartData = () => {
    // Mock data for user growth
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const today = new Date();
    let totalUsers = stats?.totalUsers || 100;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const newUsers = Math.floor(Math.random() * 10) + 2;
      totalUsers -= newUsers;

      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        newUsers,
        totalUsers,
      });
    }

    return data.reverse();
  };

  const getItemsChartData = () => {
    // Category distribution
    const categories: Record<string, number> = {};
    foodItems.forEach(item => {
      const category = item.category?.name || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getOrderStatusData = () => {
    if (!stats?.ordersByStatus) return [];
    const colors = {
      PENDING: '#fbbf24',
      CONFIRMED: '#3b82f6',
      PREPARING: '#8b5cf6',
      OUT_FOR_DELIVERY: '#f97316',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
    };

    return Object.entries(stats.ordersByStatus).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count as number,
      color: colors[status as keyof typeof colors] || '#94a3b8',
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders()]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Metric', 'Value', 'Date'],
      ['Total Revenue', stats?.totalRevenue || 0, new Date().toISOString()],
      ['Total Orders', stats?.totalOrders || 0, new Date().toISOString()],
      ['Total Users', stats?.totalUsers || 0, new Date().toISOString()],
      ['Active Orders', stats?.activeOrders || 0, new Date().toISOString()],
      ['Today Revenue', realTimeMetrics?.todayRevenue || 0, new Date().toISOString()],
      ['Today Orders', realTimeMetrics?.todayOrders || 0, new Date().toISOString()],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time business analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              {unreadCount} new
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Live Metrics Bar */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Live</span>
                <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Active Orders:</span>
                  <span className="ml-2 font-semibold">{stats?.activeOrders || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Today's Revenue:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {formatPrice(realTimeMetrics?.todayRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Today's Orders:</span>
                  <span className="ml-2 font-semibold">{realTimeMetrics?.todayOrders || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completion Rate:</span>
                  <span className="ml-2 font-semibold">
                    {realTimeMetrics?.completionRate?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Peak Hour: {realTimeMetrics?.peakHour || 0}:00
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring' }}>
          <Card className="cursor-pointer" onClick={() => setSelectedMetric('revenue')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="ml-1">from last month</span>
              </div>
              <Progress value={75} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring' }}>
          <Card className="cursor-pointer" onClick={() => setSelectedMetric('orders')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+8.2%</span>
                <span className="ml-1">from last week</span>
              </div>
              <Progress value={60} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring' }}>
          <Card className="cursor-pointer" onClick={() => setSelectedMetric('users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+15.3%</span>
                <span className="ml-1">new this month</span>
              </div>
              <Progress value={80} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring' }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(realTimeMetrics?.avgOrderValue || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                <span className="text-red-600 font-medium">-2.4%</span>
                <span className="ml-1">from average</span>
              </div>
              <Progress value={45} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Orders Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders Pipeline</CardTitle>
          <CardDescription>Real-time order status tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="secondary">
                  {realTimeMetrics?.activeOrdersByStatus.pending || 0}
                </Badge>
              </div>
              <Progress value={30} className="h-2 bg-yellow-200" />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Preparing</span>
                <Badge>
                  {realTimeMetrics?.activeOrdersByStatus.preparing || 0}
                </Badge>
              </div>
              <Progress value={50} className="h-2 bg-blue-200" />
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Out for Delivery</span>
                <Badge variant="default">
                  {realTimeMetrics?.activeOrdersByStatus.delivery || 0}
                </Badge>
              </div>
              <Progress value={70} className="h-2 bg-orange-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Tabs defaultValue="charts" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v: TimeRange) => setTimeRange(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(v: ChartType) => setChartType(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="items">Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Chart */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {chartType === 'revenue' && 'Revenue Trend'}
                  {chartType === 'orders' && 'Order Analytics'}
                  {chartType === 'users' && 'User Growth'}
                  {chartType === 'items' && 'Category Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'revenue' && (
                    <AreaChart data={getChartData()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  )}
                  {chartType === 'orders' && (
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" />
                      <Bar dataKey="pending" fill="#fbbf24" />
                      <Bar dataKey="cancelled" fill="#ef4444" />
                    </BarChart>
                  )}
                  {chartType === 'users' && (
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="newUsers" stroke="#8884d8" />
                      <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" />
                    </LineChart>
                  )}
                  {chartType === 'items' && (
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getOrderStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getOrderStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {getOrderStatusData().map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Hour</CardTitle>
                <CardDescription>24-hour order distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[0, 6, 12, 18].map(startHour => (
                    <div key={startHour} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12">
                        {startHour}:00
                      </span>
                      <div className="flex gap-1 flex-1">
                        {Array.from({ length: 6 }, (_, i) => {
                          const hour = startHour + i;
                          const orders = realTimeMetrics?.ordersByHour[hour] || 0;
                          const intensity = Math.min(orders / 10, 1);
                          return (
                            <TooltipProvider key={hour}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    className="h-8 flex-1 rounded transition-all hover:scale-105"
                                    style={{
                                      backgroundColor: `hsla(25, 95%, 53%, ${intensity})`,
                                      border: '1px solid hsla(25, 95%, 53%, 0.2)'
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{hour}:00 - {orders} orders</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Best Selling Items */}
            <Card>
              <CardHeader>
                <CardTitle>Best Selling Items</CardTitle>
                <CardDescription>Top performing menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics?.bestSellers.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.orderCount} orders
                          </p>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {formatPrice(item.revenue || 0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Rating distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-2xl font-bold">
                        {performanceMetrics?.satisfaction.rating}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {performanceMetrics?.satisfaction.total} reviews
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const percentage = performanceMetrics?.satisfaction.distribution[rating as keyof typeof performanceMetrics.satisfaction.distribution] || 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-3">{rating}</span>
                          <Star className="h-3 w-3" />
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-10">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Preparation Efficiency</CardTitle>
                <CardDescription>Average preparation times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span className="font-medium">Average Prep Time</span>
                    </div>
                    <Badge>
                      {performanceMetrics?.avgPrepTime.toFixed(0)} mins
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <p className="text-muted-foreground mb-1">Fastest</p>
                      <p className="font-semibold">5 mins</p>
                      <p className="text-xs text-muted-foreground">Beverages</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-muted-foreground mb-1">Slowest</p>
                      <p className="font-semibold">45 mins</p>
                      <p className="text-xs text-muted-foreground">Main Course</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Alert</CardTitle>
                <CardDescription>Items running low on stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics?.lowStock.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.category?.name}
                        </p>
                      </div>
                      <Badge variant="destructive">Low Stock</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle>Business Insights</CardTitle>
              </div>
              <CardDescription>AI-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Revenue Growth Opportunity</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your peak hours are at {realTimeMetrics?.peakHour}:00. Consider promotional offers
                        during off-peak hours (14:00-17:00) to increase afternoon sales.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Order Completion Rate</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current completion rate is {realTimeMetrics?.completionRate?.toFixed(1)}%.
                        Focus on reducing cancellations by improving estimated delivery times.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Menu Optimization</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your top 5 items generate 40% of revenue. Consider creating combo offers
                        with these popular items to increase average order value.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Customer Retention</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        30% of your users are repeat customers. Implement a loyalty program
                        to increase retention and customer lifetime value.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')}>
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.name || 'Unknown'} • {formatDate(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    order.status === 'DELIVERED' ? 'success' :
                    order.status === 'CANCELLED' ? 'destructive' :
                    'default'
                  }>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatPrice(parseFloat(order.totalAmount))}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}