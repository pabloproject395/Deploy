import React, { useEffect, useState } from "react";
import { useGetSettings, getGetSettingsQueryKey, useUpdateSettings } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Save, Bot, CreditCard, Bell, MessageSquare, Eye, EyeOff, Link2, Copy, Check, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type SettingsForm = {
  maintenance: boolean;
  support_username: string;
  channel_url: string;
  bot_token: string;
  admin_ids: string;
  qris_api_url: string;
  qris_api_token: string;
  welcome_message: string;
  sold_out_message: string;
  low_stock_threshold: string;
  payment_timeout_minutes: string;
};

const DEFAULT_FORM: SettingsForm = {
  maintenance: false,
  support_username: "",
  channel_url: "",
  bot_token: "",
  admin_ids: "",
  qris_api_url: "",
  qris_api_token: "",
  welcome_message: "",
  sold_out_message: "",
  low_stock_threshold: "5",
  payment_timeout_minutes: "60",
};

function SectionTitle({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="p-2 bg-primary/10 rounded-md mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateMut = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [showToken, setShowToken] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const webApiUrl = `${window.location.protocol}//${window.location.host}/api`;
  const webDownloadUrl = `${window.location.protocol}//${window.location.host}/api/download/web`;
  const botDownloadUrl = `${window.location.protocol}//${window.location.host}/api/download/bot`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedUrl(key);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  useEffect(() => {
    if (settings) {
      setForm({
        maintenance: settings.maintenance === "true",
        support_username: settings.support_username ?? "",
        channel_url: settings.channel_url ?? "",
        bot_token: settings.bot_token ?? "",
        admin_ids: settings.admin_ids ?? "",
        qris_api_url: (settings as Record<string, string>)["qris_api_url"] ?? "",
        qris_api_token: (settings as Record<string, string>)["qris_api_token"] ?? "",
        welcome_message: settings.welcome_message ?? "",
        sold_out_message: settings.sold_out_message ?? "",
        low_stock_threshold: settings.low_stock_threshold ?? "5",
        payment_timeout_minutes: settings.payment_timeout_minutes ?? "60",
      });
    }
  }, [settings]);

  const set = (key: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate(
      {
        data: {
          ...form,
          maintenance: form.maintenance ? "true" : "false",
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Tersimpan", description: "Konfigurasi bot berhasil diperbarui." });
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        },
        onError: () => {
          toast({ title: "Gagal", description: "Tidak bisa menyimpan pengaturan.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) return <div className="p-6 text-muted-foreground text-sm">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Bot</h1>
        <p className="text-sm text-muted-foreground mt-1">Konfigurasi lengkap bot Telegram — setara dengan file .env</p>
      </div>

      {/* Web API URL Info Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <SectionTitle icon={Link2} title="Link Web API" description="URL API server — dibutuhkan saat setup bot dan integrasi lainnya" />
        </CardHeader>
        <CardContent className="space-y-3">
          {/* API Base URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WEB_API_URL (untuk Bot)</Label>
            <div className="flex gap-2 items-center">
              <Input readOnly value={webApiUrl} className="font-mono text-sm bg-muted/50 cursor-default" />
              <button
                type="button"
                onClick={() => copyToClipboard(webApiUrl, "api")}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md border border-input bg-background hover:bg-muted text-sm font-medium transition-colors"
              >
                {copiedUrl === "api" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copiedUrl === "api" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Paste URL ini ke variabel <code className="bg-muted px-1 rounded">WEB_API_URL</code> di file <code className="bg-muted px-1 rounded">.env</code> bot kamu.</p>
          </div>

          <Separator />

          {/* Download Links */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Link Download Proyek</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Web Project (Dashboard + API)</p>
                <div className="flex gap-2">
                  <Input readOnly value={webDownloadUrl} className="font-mono text-xs bg-muted/50 cursor-default" />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webDownloadUrl, "web-dl")}
                    className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-md border border-input bg-background hover:bg-muted text-xs font-medium transition-colors"
                  >
                    {copiedUrl === "web-dl" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <a
                    href={webDownloadUrl}
                    download
                    className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-md border border-input bg-background hover:bg-muted text-xs font-medium transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Bot Project (Standalone)</p>
                <div className="flex gap-2">
                  <Input readOnly value={botDownloadUrl} className="font-mono text-xs bg-muted/50 cursor-default" />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(botDownloadUrl, "bot-dl")}
                    className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-md border border-input bg-background hover:bg-muted text-xs font-medium transition-colors"
                  >
                    {copiedUrl === "bot-dl" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <a
                    href={botDownloadUrl}
                    download
                    className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-md border border-input bg-background hover:bg-muted text-xs font-medium transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Bot Config */}
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle icon={Bot} title="Konfigurasi Bot" description="Token bot dan daftar admin Telegram" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldRow label="BOT_TOKEN" hint="Token dari @BotFather. Jaga kerahasiaan token ini.">
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={form.bot_token}
                  onChange={set("bot_token")}
                  placeholder="123456789:ABCDefgh..."
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldRow>

            <FieldRow label="ADMIN_IDS" hint="Telegram ID admin, pisahkan dengan koma. Contoh: 123456789,987654321">
              <Input
                value={form.admin_ids}
                onChange={set("admin_ids")}
                placeholder="123456789,987654321"
                className="font-mono"
              />
            </FieldRow>

            <FieldRow label="SUPPORT_USERNAME" hint="Username Telegram CS/support (tanpa @)">
              <div className="flex">
                <span className="flex items-center justify-center bg-muted px-3 border border-r-0 rounded-l-md text-muted-foreground text-sm">@</span>
                <Input
                  value={form.support_username}
                  onChange={set("support_username")}
                  placeholder="support_admin"
                  className="rounded-l-none"
                />
              </div>
            </FieldRow>

            <FieldRow label="CHANNEL_URL" hint="Link channel Telegram resmi toko">
              <Input
                value={form.channel_url}
                onChange={set("channel_url")}
                placeholder="https://t.me/toko_channel"
              />
            </FieldRow>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle icon={CreditCard} title="Pembayaran (RamaAPI QRIS)" description="Konfigurasi RamaAPI untuk generate QR code QRIS otomatis" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldRow label="QRIS_API_URL" hint="URL endpoint RamaAPI. Contoh: https://api.rama.id/v1">
              <Input
                value={form.qris_api_url}
                onChange={set("qris_api_url")}
                placeholder="https://api.rama.id/v1"
                className="font-mono"
              />
            </FieldRow>
            <FieldRow label="QRIS_API_TOKEN" hint="API Key / Token dari RamaAPI. Jaga kerahasiaan token ini.">
              <div className="relative">
                <Input
                  type={showApiToken ? "text" : "password"}
                  value={form.qris_api_token}
                  onChange={set("qris_api_token")}
                  placeholder="rama_xxxxxxxxxxxx"
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldRow>
            <FieldRow label="PAYMENT_TIMEOUT_MINUTES" hint="Batas waktu invoice QRIS (menit, default: 5)">
              <Input
                type="number"
                value={form.payment_timeout_minutes}
                onChange={set("payment_timeout_minutes")}
                placeholder="5"
                min="1"
                max="60"
                className="font-mono w-32"
              />
            </FieldRow>
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
              <strong>Cara mendapatkan API Key:</strong> Daftar di RamaAPI → Dashboard → API Keys → Buat API Key baru. Isi URL endpoint sesuai dokumentasi RamaAPI yang kamu gunakan.
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle icon={MessageSquare} title="Pesan Bot" description="Template pesan yang dikirim bot ke pengguna" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldRow label="WELCOME_MESSAGE" hint="Pesan sambutan saat pengguna pertama kali start bot">
              <Textarea
                value={form.welcome_message}
                onChange={set("welcome_message")}
                placeholder="Selamat datang di toko kami! 👋"
                className="min-h-[80px] text-sm"
              />
            </FieldRow>
            <FieldRow label="SOLD_OUT_MESSAGE" hint="Pesan yang dikirim ketika stok produk habis">
              <Textarea
                value={form.sold_out_message}
                onChange={set("sold_out_message")}
                placeholder="Maaf, stok produk ini sedang habis. 😔"
                className="min-h-[80px] text-sm"
              />
            </FieldRow>
          </CardContent>
        </Card>

        {/* Notifications & System */}
        <Card>
          <CardHeader className="pb-2">
            <SectionTitle icon={Bell} title="Notifikasi & Sistem" description="Ambang batas stok dan mode maintenance" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="LOW_STOCK_THRESHOLD" hint="Kirim notifikasi jika stok produk di bawah angka ini">
                <Input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={set("low_stock_threshold")}
                  placeholder="5"
                  min="1"
                  className="font-mono"
                />
              </FieldRow>
            </div>

            <Separator />

            <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Mode Maintenance</Label>
                <p className="text-xs text-muted-foreground">
                  Aktifkan untuk menonaktifkan bot sementara. Pengguna akan mendapat pesan maintenance.
                </p>
              </div>
              <Switch
                checked={form.maintenance}
                onCheckedChange={(val) => setForm((prev) => ({ ...prev, maintenance: val }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMut.isPending} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {updateMut.isPending ? "Menyimpan..." : "Simpan Semua Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
