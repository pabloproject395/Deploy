import React, { useState } from "react";
import {
  useListUsers, getListUsersQueryKey,
  useTopupUser, useBanUser,
  useGetUserTransactions, useBatchTopup,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Ban, CheckCircle, Wallet, History, Users2, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Users() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const { data: users, isLoading } = useListUsers(
    { search: search || undefined, sortBy: sortBy as any, order: order as any },
    { query: { queryKey: getListUsersQueryKey({ search: search || undefined, sortBy: sortBy as any, order: order as any }) } }
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const topupMut = useTopupUser();
  const banMut = useBanUser();

  const handleTopup = (userId: number, amount: number, note: string, closeDialog: () => void) => {
    topupMut.mutate({ id: userId, data: { amount, note } }, {
      onSuccess: () => {
        toast({ title: "Top up berhasil", description: `Saldo +${formatIDR(amount)} ditambahkan.` });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        closeDialog();
      },
      onError: () => toast({ title: "Gagal", description: "Top up gagal.", variant: "destructive" }),
    });
  };

  const handleToggleBan = (userId: number, currentBanned: boolean) => {
    banMut.mutate({ id: userId, data: { banned: !currentBanned } }, {
      onSuccess: () => {
        toast({ title: "Berhasil", description: `User ${!currentBanned ? "dibanned" : "di-unban"}.` });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: () => toast({ title: "Gagal", description: "Aksi gagal.", variant: "destructive" }),
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) setOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(field); setOrder("desc"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <BatchTopupDialog onRefresh={() => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari ID, username, nama..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Tanggal Daftar</SelectItem>
            <SelectItem value="balance">Saldo</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setOrder(o => o === "asc" ? "desc" : "asc")}>
          <ArrowUpDown className="h-4 w-4 mr-1" /> {order === "asc" ? "A→Z" : "Z→A"}
        </Button>
        {users && <span className="text-sm text-muted-foreground">{users.length} user</span>}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort("createdAt")}>Telegram ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort("balance")}>Saldo</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Memuat...</TableCell></TableRow>
            ) : users?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Tidak ada user</TableCell></TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.telegramId}</TableCell>
                  <TableCell>
                    <div className="font-medium">{user.firstName || "Unknown"}</div>
                    {user.username && <div className="text-xs text-muted-foreground">@{user.username}</div>}
                  </TableCell>
                  <TableCell className="font-medium">{formatIDR(user.balance)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.banned
                      ? <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Banned</Badge>
                      : <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktif</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <HistoryDialog userId={user.id} userName={user.firstName || user.telegramId} />
                    <TopUpDialog userId={user.id} onTopup={handleTopup} />
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleToggleBan(user.id, user.banned)}
                      className={user.banned ? "text-emerald-500 hover:text-emerald-600" : "text-destructive hover:text-destructive"}
                    >
                      {user.banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
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

function HistoryDialog({ userId, userName }: { userId: number; userName: string }) {
  const [open, setOpen] = useState(false);
  const { data: txs, isLoading } = useGetUserTransactions({ id: userId }, { query: { enabled: open } });

  const getStatusColor = (s: string) => {
    if (s === "paid") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === "pending") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><History className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Riwayat Transaksi — {userName}</DialogTitle>
          <DialogDescription>100 transaksi terbaru user ini</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Memuat...</div>
        ) : !txs?.length ? (
          <div className="py-8 text-center text-muted-foreground">Belum ada transaksi.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-sm">{tx.productName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                  <TableCell className="text-right font-medium">{formatIDR(tx.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(tx.status)}>
                      {tx.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TopUpDialog({ userId, onTopup }: { userId: number; onTopup: (id: number, amount: number, note: string, close: () => void) => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onTopup(userId, Number(amount), note, () => { setOpen(false); setAmount(""); setNote(""); });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Wallet className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Top Up Saldo</DialogTitle>
            <DialogDescription>Tambah atau kurangi saldo user</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah (IDR) — negatif untuk kurangi</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" required />
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Manual top up" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BatchTopupDialog({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const batchMut = useBatchTopup();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text.trim().split("\n").filter(Boolean);
    const items = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return { telegramId: parts[0], amount: Number(parts[1]), note: parts.slice(2).join(" ") || "Batch topup" };
    }).filter((i) => i.telegramId && !isNaN(i.amount) && i.amount !== 0);

    if (!items.length) {
      toast({ title: "Format salah", description: "Pastikan format: telegramId jumlah catatan", variant: "destructive" });
      return;
    }

    batchMut.mutate({ data: { items } }, {
      onSuccess: (res) => {
        setResult(res);
        toast({ title: "Batch selesai", description: `${res.succeeded} berhasil, ${res.failed} gagal.` });
        onRefresh();
      },
      onError: () => toast({ title: "Gagal", description: "Batch topup gagal.", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setText(""); setResult(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Users2 className="h-4 w-4 mr-2" />Batch Top Up</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Batch Top Up</DialogTitle>
            <DialogDescription>
              Satu baris per user. Format: telegramId jumlah catatan{"\n"}
              Contoh: 123456789 50000 bonus
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"123456789 50000 bonus\n987654321 25000 refund"}
              className="font-mono text-xs min-h-[150px]"
            />
            {result && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 text-emerald-500 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold">{result.succeeded}</div>
                  <div className="text-xs">Berhasil</div>
                </div>
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center">
                  <div className="text-2xl font-bold">{result.failed}</div>
                  <div className="text-xs">Gagal</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={batchMut.isPending || !text.trim()}>
              {batchMut.isPending ? "Memproses..." : "Proses Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
