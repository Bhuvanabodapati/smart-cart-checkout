import { Barcode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { products, Product } from '@/data/products';
import { useState } from 'react';

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    onScan(product);
    setOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Barcode className="w-4 h-4 text-primary" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[calc(100%-60px)]">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full h-20 text-lg font-semibold animate-pulse-glow"
              size="lg"
            >
              <Barcode className="w-6 h-6 mr-2" />
              Tap to Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Product to Scan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 rounded-lg border border-border bg-secondary hover:bg-accent hover:border-primary transition-all text-left"
                >
                  <div className="text-2xl mb-1">{product.icon}</div>
                  <div className="font-medium text-sm text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.weight}g • ₹{product.price}</div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Ready</span>
        </div>
      </CardContent>
    </Card>
  );
}
