import React, { useState } from "react";
import {
  useSendBroadcast,
  useListBroadcastTemplates, getListBroadcastTemplatesQueryKey,
  useCreateBroadcastTemplate, useDeleteBroadcastTemplate,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertCircle, BookMarked, Plus, Trash2, CheckCircle2, LayoutTemplate } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Broadcast() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const broadcastMut = useSendBroadcast();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading: templatesLoading } = useListBroadcastTemplates({
    query: { queryKey: getListBroadcastTemplatesQueryKey() },
  });
  const createTplMut = useCreateBroadcastTemplate();
  const deleteTplMut = useDeleteBroadcastTemplate();

  const handleSend = () => {
    if (!message.trim()) return;
    broadcastMut.mutate({ data: { message, parseMode: "HTML" } }, {
      onSuccess: (res) => {
        setResult(res);
        toast({ title: "Broadcast Terkirim", description: `Berhasil ke ${res.sent} user.` });
        setMessage("");
      },
      onError: () => toast({ title: "Gagal", description: "Broadcast gagal dikirim.", variant: "destructive" }),
    });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !message.trim()) return;
    createTplMut.mutate({ data: { name: templateName, message } }, {
      onSuccess: () => {
        toast({ title: "Template disimpan", description: `"${templateName}" tersimpan.` });
        queryClient.invalidateQueries({ queryKey: getListBroadcastTemplatesQueryKey() });
        setShowSaveDialog(false);
        setTemplateName("");
      },
      onError: () => toast({ title: "Gagal", variant: "destructive" }),
    });
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTplMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBroadcastTemplatesQueryKey() });
        toast({ title: "Template dihapus" });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Broadcast Pesan</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Editor */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Pesan Baru</CardTitle>
              <CardDescription>
                Kirim ke semua user aktif. Format HTML didukung: &lt;b&gt;tebal&lt;/b&gt;, &lt;i&gt;miring&lt;/i&gt;, &lt;code&gt;kode&lt;/code&gt;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <AlertDescription className="text-emerald-600 font-medium">
                    Broadcast berhasil! {result.sent} terkirim, {result.failed} gagal dari {result.total} user.
                  </AlertDescription>
                </Alert>
              )}
              <Textarea
                className="min-h-[220px] font-mono text-sm"
                placeholder={"<b>Halo!</b>\nStok key 1-day mod baru saja ditambah.\n\nGunakan /buy untuk beli sekarang."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Telegram membatasi kecepatan pengiriman. Semakin banyak user, semakin lama prosesnya.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 border-t pt-4">
              <Button
                variant="outline" size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={!message.trim()}
              >
                <BookMarked className="h-4 w-4 mr-2" /> Simpan Template
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={broadcastMut.isPending || !message.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {broadcastMut.isPending ? "Mengirim..." : "Kirim Broadcast"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Broadcast</AlertDialogTitle>
                    <AlertDialogDescription>
                      Pesan ini akan dikirim ke SEMUA user aktif. Aksi ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend}>Ya, Kirim</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>

        {/* Templates sidebar */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" /> Template Tersimpan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templatesLoading ? (
                <p className="text-xs text-muted-foreground">Memuat...</p>
              ) : !templates?.length ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Belum ada template. Tulis pesan lalu klik "Simpan Template".
                </p>
              ) : (
                templates.map((tpl) => (
                  <div key={tpl.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium leading-tight">{tpl.name}</p>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-mono">{tpl.message}</p>
                    <Button
                      variant="outline" size="sm" className="w-full h-7 text-xs"
                      onClick={() => { setMessage(tpl.message); toast({ title: "Template dipilih", description: tpl.name }); }}
                    >
                      Gunakan
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Simpan Template</DialogTitle>
            <DialogDescription>Beri nama template ini agar mudah digunakan kembali.</DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Nama Template</Label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Contoh: Restok Mingguan" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTemplate} disabled={createTplMut.isPending || !templateName.trim()}>
              {createTplMut.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
