import React, { useState, useRef } from "react";
import { useBulkParseKeys } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Play, AlertTriangle, KeyRound, Upload, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Stock() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseMut = useBulkParseKeys();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      toast({ title: "Format salah", description: "Hanya file .txt yang didukung.", variant: "destructive" });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      toast({ title: "File dimuat", description: `${file.name} (${content.split("\n").filter(Boolean).length} baris)` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleParse = () => {
    if (!text.trim()) return;
    parseMut.mutate({ data: { text } }, {
      onSuccess: (res) => {
        setResult(res);
        toast({
          title: "Selesai",
          description: `${res.totalAdded} key ditambahkan ke ${res.groups.length} produk.`,
        });
        queryClient.invalidateQueries();
        if (res.totalAdded > 0) { setText(""); setFileName(null); }
      },
      onError: () => toast({ title: "Gagal", description: "Gagal memproses key.", variant: "destructive" }),
    });
  };

  const clearFile = () => { setText(""); setFileName(null); setResult(null); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Auto Stock Upload</h1>
      </div>

      {/* Format guide */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-3 text-sm">
            <KeyRound className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-medium mb-1">Format baris:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">keyValue durasi tipe</code>
              <span className="mx-2 text-muted-foreground">→</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">288292929 1day mod</code>
              <p className="text-muted-foreground text-xs mt-1.5">
                Sistem otomatis mencocokkan ke produk dengan ID <code className="bg-muted px-1 rounded">mod-1day</code>.
                Tipe valid: <Badge variant="outline" className="text-xs mx-0.5">mod</Badge>
                <Badge variant="outline" className="text-xs mx-0.5">rot</Badge>
                — Durasi: <Badge variant="outline" className="text-xs mx-0.5">1day</Badge>
                <Badge variant="outline" className="text-xs mx-0.5">7day</Badge>
                <Badge variant="outline" className="text-xs mx-0.5">30day</Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Input Key</CardTitle>
            <CardDescription>Paste baris key atau upload file .txt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* File upload area */}
            <div
              className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const fakeEvent = { target: { files: [file], value: "" } } as any;
                  handleFileUpload(fakeEvent);
                }
              }}
            >
              <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{fileName}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p>Upload file .txt atau drag & drop</p>
                  <p className="text-xs mt-1">Satu key per baris</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" /> atau ketik manual <Separator className="flex-1" />
            </div>

            <Textarea
              className="min-h-[280px] font-mono text-xs"
              placeholder={"288292929 1day mod\n292929299 1day rot\n382838283 7day mod\n..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{text.split("\n").filter(Boolean).length} baris</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleParse} disabled={parseMut.isPending || !text.trim()}>
              <Play className="h-4 w-4 mr-2" />
              {parseMut.isPending ? "Memproses..." : "Proses Key"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4 md:col-span-1">
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle>Hasil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-emerald-500">{result.totalAdded}</div>
                    <div className="text-xs text-muted-foreground mt-1">Key Ditambahkan</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold">{result.totalDuplicates}</div>
                    <div className="text-xs text-muted-foreground mt-1">Duplikat Dilewati</div>
                  </div>
                </div>

                {result.groups?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Dikelompokkan per Produk:</h4>
                    <div className="space-y-2">
                      {result.groups.map((g: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium text-sm">{g.productName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{g.productId}</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">+{g.keysAdded} key</Badge>
                            {g.duplicates > 0 && <div className="text-xs text-muted-foreground mt-1">{g.duplicates} duplikat</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-destructive flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Error / Tidak Cocok ({result.errors.length})
                    </h4>
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-xs font-mono max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                      {result.errors.join("\n")}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center min-h-[350px] border-dashed text-muted-foreground">
              <KeyRound className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Hasil akan muncul di sini setelah diproses.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
