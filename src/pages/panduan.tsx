import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Bot, CreditCard, Users, Package, KeyRound,
  BarChart3, MessageSquare, ScrollText, Settings, Search,
  Download, History, ArrowUpDown, Users2, LayoutTemplate,
  Upload, FileText, Moon, HelpCircle, AlertTriangle,
} from "lucide-react";

type GuideItem = {
  icon: React.ElementType;
  title: string;
  badge?: string;
  badgeColor?: string;
  items: { label: string; desc: string; tip?: string }[];
};

const GUIDE: GuideItem[] = [
  {
    icon: Bot,
    title: "Dashboard",
    badge: "Halaman Utama",
    items: [
      { label: "Total Revenue", desc: "Jumlah total pendapatan dari transaksi yang sudah dibayar (status: paid)." },
      { label: "Total Deposit", desc: "Total volume uang yang sudah di-deposit oleh semua user." },
      { label: "Total Users", desc: "Jumlah semua user yang pernah memulai bot, beserta jumlah yang dibanned." },
      { label: "Pending Actions", desc: "Jumlah transaksi & deposit yang masih menunggu konfirmasi." },
      { label: "Grafik 30 Hari", desc: "Grafik gabungan revenue dan deposit selama 30 hari terakhir." },
      { label: "Aktivitas Terkini", desc: "Ringkasan cepat: transaksi hari ini, deposit hari ini, produk stok menipis." },
    ],
  },
  {
    icon: CreditCard,
    title: "Transaksi",
    items: [
      { label: "Filter Status", desc: "Tampilkan semua transaksi, atau filter berdasarkan: Paid, Pending, Expired." },
      { label: "Export CSV", desc: "Unduh seluruh data transaksi yang sedang ditampilkan dalam format CSV.", tip: "Buka CSV dengan Excel atau Google Sheets untuk laporan keuangan." },
      { label: "Merchant Ref", desc: "Kode referensi unik setiap transaksi dari payment gateway." },
    ],
  },
  {
    icon: CreditCard,
    title: "Deposit",
    items: [
      { label: "Filter Status", desc: "Filter deposit berdasarkan: Paid, Pending, Expired." },
      { label: "Export CSV", desc: "Unduh data deposit ke file CSV untuk keperluan rekap atau audit." },
      { label: "Amount vs Total", desc: "Amount = jumlah yang diinput user. Total = jumlah yang diterima (setelah fee jika ada)." },
    ],
  },
  {
    icon: Users,
    title: "Manajemen User",
    items: [
      { label: "Pencarian", desc: "Cari user berdasarkan Telegram ID, username (@nama), atau nama depan." },
      { label: "Urutkan", desc: "Urutkan daftar user berdasarkan Tanggal Daftar atau Saldo. Klik A→Z / Z→A untuk membalik urutan." },
      { label: "Ikon Jam (Riwayat)", desc: "Klik ikon jam untuk melihat 100 transaksi terakhir user tersebut.", tip: "Gunakan ini untuk verifikasi pembelian user." },
      { label: "Ikon Dompet (Top Up)", desc: "Tambah atau kurangi saldo user. Masukkan angka negatif (misal -50000) untuk mengurangi." },
      { label: "Ikon Ban/Unban", desc: "Ban user agar tidak bisa menggunakan bot. Klik lagi untuk unban." },
      { label: "Batch Top Up", desc: "Top up banyak user sekaligus. Format per baris: telegramId jumlah catatan", tip: "Contoh: 123456789 50000 bonus event" },
    ],
  },
  {
    icon: Package,
    title: "Produk",
    items: [
      { label: "Tambah Produk", desc: "Buat produk baru dengan nama, ID, dan harga. ID produk harus unik (contoh: mod-1day)." },
      { label: "Edit Produk", desc: "Ubah nama, harga, atau status aktif produk kapan saja." },
      { label: "Stok Tersedia", desc: "Jumlah key yang belum terjual untuk produk tersebut." },
      { label: "Tambah Key Manual", desc: "Input key satu per satu atau dalam batch untuk produk tertentu." },
      { label: "Nonaktifkan Produk", desc: "Produk yang tidak aktif tidak akan muncul di bot Telegram." },
    ],
  },
  {
    icon: KeyRound,
    title: "Auto Stock Upload",
    items: [
      { label: "Format Baris", desc: "Setiap baris: keyValue durasi tipe — Contoh: 288292929 1day mod", tip: "Spasi memisahkan ketiga bagian. Jangan ada baris kosong di tengah." },
      { label: "Tipe Valid", desc: "mod = Mod APK, rot = Root Access. Durasi: 1day, 7day, 30day." },
      { label: "Auto-Match Produk", desc: "Sistem otomatis mencocokkan ke produk dengan ID format: tipe-durasi (contoh: mod-1day)." },
      { label: "Upload File .txt", desc: "Bisa upload file .txt langsung — drag & drop atau klik area upload.", tip: "Lebih praktis dari paste manual jika key ribuan baris." },
      { label: "Hasil Parse", desc: "Setelah diproses, lihat berapa key berhasil ditambah, duplikat dilewati, dan baris yang error." },
      { label: "Duplikat", desc: "Key yang sudah ada di database tidak akan ditambahkan dua kali (otomatis terdeteksi)." },
    ],
  },
  {
    icon: BarChart3,
    title: "Analitik",
    items: [
      { label: "Grafik Gabungan", desc: "Tampilkan revenue dan deposit 30 hari terakhir dalam satu grafik area." },
      { label: "Grafik Per Produk", desc: "Klik tombol 'Per Produk' untuk melihat perbandingan revenue dan penjualan tiap produk.", tip: "Cocok untuk menentukan produk mana yang paling laku." },
      { label: "Detail Per Produk", desc: "Tabel yang menampilkan total revenue, total terjual, dan stok tersedia per produk." },
      { label: "Top 10 Produk", desc: "Bar chart horizontal menampilkan 10 produk terlaris berdasarkan jumlah terjual." },
      { label: "Peringatan Stok", desc: "Daftar produk yang stoknya habis atau menipis (di bawah threshold yang diatur di Settings)." },
    ],
  },
  {
    icon: MessageSquare,
    title: "Broadcast",
    items: [
      { label: "Kirim Pesan", desc: "Kirim pesan ke SEMUA user aktif (non-banned). Selalu ada konfirmasi sebelum dikirim." },
      { label: "Format HTML", desc: "Gunakan tag HTML: <b>tebal</b>, <i>miring</i>, <code>kode</code>, <a href='...'>link</a>." },
      { label: "Simpan Template", desc: "Tulis pesan, lalu klik 'Simpan Template' untuk menyimpannya agar bisa dipakai lagi.", tip: "Buat template untuk pesan berulang seperti restok atau promo." },
      { label: "Gunakan Template", desc: "Klik 'Gunakan' pada template di sidebar kanan — pesan akan otomatis terisi di editor." },
      { label: "Hapus Template", desc: "Klik ikon tempat sampah di pojok kanan atas template untuk menghapusnya." },
    ],
  },
  {
    icon: ScrollText,
    title: "Audit Log",
    items: [
      { label: "Apa itu Audit Log?", desc: "Catatan semua aksi yang dilakukan admin: top up, ban, tambah key, broadcast, ubah settings." },
      { label: "Detail Aksi", desc: "Setiap log mencatat: jenis aksi, entity yang diubah, ID entity, dan data detailnya." },
      { label: "Gunakan untuk:", desc: "Verifikasi siapa yang melakukan apa, kapan, dan dengan data apa. Penting untuk akuntabilitas." },
    ],
  },
  {
    icon: Settings,
    title: "Pengaturan Bot (.env)",
    items: [
      { label: "BOT_TOKEN", desc: "Token bot Telegram dari @BotFather. Klik ikon mata untuk menampilkan/sembunyikan nilai." },
      { label: "ADMIN_IDS", desc: "Telegram ID admin yang bisa mengakses command admin bot. Pisahkan dengan koma.", tip: "Cek Telegram ID kamu dengan bot @userinfobot." },
      { label: "SUPPORT_USERNAME", desc: "Username Telegram CS/support toko (tanpa @). Ditampilkan di pesan bot." },
      { label: "CHANNEL_URL", desc: "Link channel Telegram resmi toko. Contoh: https://t.me/nama_channel" },
      { label: "QRIS / DANA / OVO / GoPay", desc: "Nomor atau kode pembayaran untuk masing-masing metode. Digunakan bot saat user deposit." },
      { label: "QRIS_IMAGE_URL", desc: "URL gambar QR code. Bot akan kirim gambar ini ke user yang ingin deposit via QRIS." },
      { label: "WELCOME_MESSAGE", desc: "Pesan pertama yang dikirim bot saat user klik /start." },
      { label: "SOLD_OUT_MESSAGE", desc: "Pesan yang dikirim bot ketika stok produk yang dipilih user habis." },
      { label: "LOW_STOCK_THRESHOLD", desc: "Angka batas stok menipis. Jika stok produk di bawah angka ini, muncul di halaman Analitik." },
      { label: "PAYMENT_TIMEOUT_MINUTES", desc: "Berapa menit batas waktu konfirmasi pembayaran sebelum expired." },
      { label: "Mode Maintenance", desc: "Aktifkan untuk menonaktifkan bot sementara. User akan dapat pesan maintenance." },
    ],
  },
];

export default function Panduan() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? GUIDE.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((s) => s.items.length > 0)
    : GUIDE;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Panduan Penggunaan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cara menggunakan semua fitur dashboard StorBot Admin
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari fitur atau perintah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Tidak ada hasil untuk "{search}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                  {section.badge && (
                    <Badge variant="outline" className="text-xs font-normal ml-1">
                      {section.badge}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                        {item.tip && (
                          <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Tips: {item.tip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
