import { Barcode, CheckCircle, Camera, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { products, Product, findProductByBarcode } from '@/data/products';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          // On successful scan
          handleBarcodeScan(decodedText);
        },
        () => {
          // Ignore errors during scanning
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start camera:", err);
      toast.error("Camera access denied or not available");
      setOpen(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    // Prevent duplicate scans within 2 seconds
    if (lastScanned === barcode) return;
    setLastScanned(barcode);

    const product = findProductByBarcode(barcode);
    if (product) {
      onScan(product);
      toast.success(`Scanned: ${product.name}`);
    } else {
      toast.error(`Unknown barcode: ${barcode}`);
    }

    // Reset last scanned after 2 seconds
    setTimeout(() => setLastScanned(null), 2000);
  };

  // Handle manual product selection as fallback
  const handleProductSelect = (product: Product) => {
    onScan(product);
    stopScanner();
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      // Delay to ensure DOM is ready
      setTimeout(() => startScanner(), 100);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

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
          <Button 
            onClick={() => setOpen(true)}
            className="w-full h-20 text-lg font-semibold animate-pulse-glow"
            size="lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            Tap to Scan
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scan Barcode
              </DialogTitle>
            </DialogHeader>
            
            {/* Camera Scanner */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <div id="barcode-reader" ref={containerRef} className="w-full" />
              {isScanning && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    Point camera at barcode
                  </span>
                </div>
              )}
            </div>

            {/* Manual Selection Fallback */}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Or select product manually:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="p-2 rounded-lg border border-border bg-secondary hover:bg-accent hover:border-primary transition-all text-left"
                  >
                    <div className="text-xl mb-1">{product.icon}</div>
                    <div className="font-medium text-xs text-foreground">{product.name}</div>
                    <div className="text-xs text-muted-foreground">₹{product.price}</div>
                  </button>
                ))}
              </div>
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
