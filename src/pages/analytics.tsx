import React, { useState } from "react";
import {
  useGetRevenueChart, getGetRevenueChartQueryKey,
  useGetTopProducts, getGetTopProductsQueryKey,
  useGetStockAlerts, getGetStockAlertsQueryKey,
  useGetPerProductStats, getGetPerProductStatsQueryKey,
} from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Package } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Analytics() {
  const [chartType, setChartType] = useState<"revenue" | "perProduct">("revenue");

  const { data: chartData, isLoading: chartLoading } = useGetRevenueChart({ query: { queryKey: getGetRevenueChartQueryKey() } });
  const { data: topProducts, isLoading: topLoading } = useGetTopProducts({ query: { queryKey: getGetTopProductsQueryKey() } });
  const { data: alerts, isLoading: alertsLoading } = useGetStockAlerts({ query: { queryKey: getGetStockAlertsQueryKey() } });
  const { data: perProduct, isLoading: perProductLoading } = useGetPerProductStats({ query: { queryKey: getGetPerProductStatsQueryKey() } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
      </div>

      {/* Chart toggle */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {chartType === "revenue" ? "Revenue vs Deposit (30 Hari)" : "Statistik Per Produk"}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={chartType === "revenue" ? "default" : "outline"} onClick={() => setChartType("revenue")}>
              Gabungan
            </Button>
            <Button size="sm" variant={chartType === "perProduct" ? "default" : "outline"} onClick={() => setChartType("perProduct")}>
              Per Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartType === "revenue" ? (
            chartLoading ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">Memuat grafik...</div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip formatter={(v: number) => formatIDR(v)} labelFormatter={(l) => new Date(l).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="deposits" stroke="#10b981" fillOpacity={1} fill="url(#colorDeposits)" name="Deposit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )
          ) : (
            perProductLoading ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">Memuat grafik...</div>
            ) : !perProduct?.length ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">Belum ada data produk.</div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perProduct} margin={{ top: 10, right: 10, left: 40, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="productName" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-35} textAnchor="end" interval={0} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip formatter={(v: number, name: string) => name === "totalRevenue" ? [formatIDR(v), "Revenue"] : [v, name === "totalSold" ? "Terjual" : "Stok"]} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                    <Legend formatter={(v) => v === "totalRevenue" ? "Revenue" : v === "totalSold" ? "Terjual" : "Stok"} />
                    <Bar yAxisId="left" dataKey="totalRevenue" name="totalRevenue" radius={[4, 4, 0, 0]}>
                      {perProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                    <Bar yAxisId="right" dataKey="totalSold" name="totalSold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Per produk tabel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Detail Per Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {perProductLoading ? (
              <p className="text-muted-foreground text-sm">Memuat...</p>
            ) : !perProduct?.length ? (
              <p className="text-muted-foreground text-sm">Belum ada data.</p>
            ) : (
              <div className="space-y-3">
                {perProduct.map((p, i) => (
                  <div key={p.productId} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div>
                        <div className="font-medium text-sm">{p.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.productId}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-sm font-medium">{formatIDR(p.totalRevenue)}</div>
                      <div className="text-xs text-muted-foreground">{p.totalSold} terjual · {p.stockAvailable} stok</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Top 10 Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Memuat...</div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topProducts} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis dataKey="productName" type="category" width={100} tickFormatter={(v) => v.length > 13 ? v.slice(0, 13) + "..." : v} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} formatter={(v: number, name: string) => name === "totalRevenue" ? [formatIDR(v), "Revenue"] : [v, "Terjual"]} />
                    <Bar dataKey="totalSold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="totalSold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Peringatan Stok
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Memuat...</div>
          ) : alerts?.totalAlerts === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Semua produk stoknya cukup.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(alerts?.outOfStock?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> Stok Habis
                  </h4>
                  {alerts!.outOfStock.map((a) => (
                    <div key={a.productId} className="flex justify-between items-center p-3 border border-destructive/20 bg-destructive/5 rounded-md">
                      <div>
                        <div className="font-medium text-sm">{a.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.productId}</div>
                      </div>
                      <Badge variant="destructive">0 tersisa</Badge>
                    </div>
                  ))}
                </div>
              )}
              {(alerts?.lowStock?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-amber-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Stok Menipis
                  </h4>
                  {alerts!.lowStock.map((a) => (
                    <div key={a.productId} className="flex justify-between items-center p-3 border border-amber-500/20 bg-amber-500/5 rounded-md">
                      <div>
                        <div className="font-medium text-sm">{a.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.productId}</div>
                      </div>
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30">{a.availableKeys} tersisa</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
