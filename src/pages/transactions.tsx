import React, { useState } from "react";
import { useListTransactions, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function exportCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const [status, setStatus] = useState<string>("all");
  const { toast } = useToast();

  const { data: transactions, isLoading } = useListTransactions(
    { status: status === "all" ? undefined : status },
    { query: { queryKey: getListTransactionsQueryKey({ status: status === "all" ? undefined : status }) } }
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "expired": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleExport = () => {
    if (!transactions?.length) {
      toast({ title: "Tidak ada data", description: "Tidak ada transaksi untuk diekspor.", variant: "destructive" });
      return;
    }
    exportCSV(
      transactions.map((t) => ({
        ID: t.id,
        Referensi: t.merchantRef,
        "Telegram ID": t.telegramUserId,
        Produk: t.productName,
        Harga: t.price,
        Total: t.total,
        Status: t.status,
        Tanggal: t.createdAt,
        "Dibayar": t.paidAt ?? "-",
      })),
      `transaksi_${new Date().toISOString().split("T")[0]}.csv`
    );
    toast({ title: "Export berhasil", description: `${transactions.length} transaksi diekspor ke CSV.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {transactions && (
          <span className="text-sm text-muted-foreground">{transactions.length} transaksi</span>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Ref</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Memuat...</TableCell></TableRow>
            ) : transactions?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Tidak ada transaksi</TableCell></TableRow>
            ) : (
              transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">
                    {tx.id}
                    <div className="text-muted-foreground">{tx.merchantRef}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{tx.telegramUserId}</TableCell>
                  <TableCell>
                    <div className="font-medium">{tx.productName}</div>
                    <div className="text-xs text-muted-foreground">{formatIDR(tx.price)}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(tx.createdAt)}</TableCell>
                  <TableCell className="text-right font-medium">{formatIDR(tx.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(tx.status)}>
                      {tx.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
