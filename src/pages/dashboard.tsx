import React from "react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRevenueChart, getGetRevenueChartQueryKey, useGetStockAlerts, getGetStockAlertsQueryKey } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { Users, Receipt, CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight, PackageOpen } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: chartData, isLoading: chartLoading } = useGetRevenueChart({ query: { queryKey: getGetRevenueChartQueryKey() } });
  const { data: alerts } = useGetStockAlerts({ query: { queryKey: getGetStockAlertsQueryKey() } });

  if (statsLoading) return <div className="p-6">Loading dashboard...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      </div>

      {alerts && alerts.totalAlerts > 0 && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stock Alerts</AlertTitle>
          <AlertDescription>
            You have {alerts.outOfStock.length} out of stock products and {alerts.lowStock.length} low stock products.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3"/>{formatIDR(stats.revenueToday)}</span> today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(stats.totalDepositVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3"/>{formatIDR(stats.depositVolumeToday)}</span> today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bannedUsers} banned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions + stats.pendingDeposits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingTransactions} txs / {stats.pendingDeposits} deposits
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue & Deposits (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatIDR(value)}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="deposits" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorDeposits)" name="Deposits" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-7 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary/20 p-2 rounded-full mr-4">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Transactions Today</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingTransactions} pending, {stats.totalTransactions} total</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-chart-2/20 p-2 rounded-full mr-4">
                    <CreditCard className="h-4 w-4 text-chart-2" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Deposits Today</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingDeposits} pending, {stats.totalDeposits} total</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-destructive/20 p-2 rounded-full mr-4">
                    <PackageOpen className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Low Stock Products</p>
                    <p className="text-sm text-muted-foreground">{stats.lowStockCount} products need attention</p>
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
