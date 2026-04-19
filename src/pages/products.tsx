import React, { useState } from "react";
import { 
  useListProducts, 
  getListProductsQueryKey, 
  useCreateProduct, 
  useUpdateProduct, 
  useAddProductKeys 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, KeySquare, PackageOpen, Tag, Edit, SwitchCamera } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Products() {
  const { data: products, isLoading } = useListProducts({ query: { queryKey: getListProductsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMut = useUpdateProduct();

  const toggleActive = (id: string, currentActive: boolean) => {
    updateMut.mutate({ id, data: { active: !currentActive } }, {
      onSuccess: () => {
        toast({ title: "Updated", description: "Product status updated." });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update product status.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <AddProductDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : products?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">No products found</TableCell></TableRow>
            ) : (
              products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.id}</TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Tag className="h-3 w-3" /> {product.category}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatIDR(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.availableKeys > 0 ? "outline" : "destructive"}>
                        {product.availableKeys} available
                      </Badge>
                      <span className="text-xs text-muted-foreground">({product.soldKeys} sold)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={product.active} 
                        onCheckedChange={() => toggleActive(product.id, product.active)}
                        disabled={updateMut.isPending}
                      />
                      <span className="text-xs text-muted-foreground">{product.active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AddKeysDialog productId={product.id} productName={product.name} />
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

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  
  const createMut = useCreateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !category || !price || isNaN(Number(price))) return;
    
    createMut.mutate({ 
      data: { id, name, category, price: Number(price), active: true } 
    }, {
      onSuccess: () => {
        toast({ title: "Product created", description: "Successfully added new product." });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setOpen(false);
        setId(""); setName(""); setCategory(""); setPrice("");
      },
      onError: (err) => {
        toast({ title: "Error", description: "Failed to create product.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id">Product ID (Unique code)</Label>
              <Input id="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="1day_mod" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="1 Day Mod Access" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Mod Menu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (IDR)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddKeysDialog({ productId, productName }: { productId: string, productName: string }) {
  const [open, setOpen] = useState(false);
  const [keysText, setKeysText] = useState("");
  
  const addKeysMut = useAddProductKeys();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keys = keysText.split("\n").map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length === 0) return;
    
    addKeysMut.mutate({ 
      id: productId,
      data: { keys } 
    }, {
      onSuccess: (res) => {
        toast({ 
          title: "Keys added", 
          description: `Successfully added ${res.added} keys. ${res.duplicates} duplicates skipped.` 
        });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setOpen(false);
        setKeysText("");
      },
      onError: (err) => {
        toast({ title: "Error", description: "Failed to add keys.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeySquare className="h-4 w-4 mr-2" /> Add Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Keys to {productName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keys">Paste Keys (One per line)</Label>
              <Textarea 
                id="keys" 
                value={keysText} 
                onChange={(e) => setKeysText(e.target.value)} 
                placeholder="XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY" 
                className="h-[200px] font-mono text-xs"
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addKeysMut.isPending}>
              {addKeysMut.isPending ? "Adding..." : `Add Keys`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
