import { Barcode, CheckCircle, Camera, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, findProductByBarcode } from '@/data/products';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false); // Immediate blocking flag

  const startScanner = async () => {
    if (!containerRef.current || isScanning) return;

    try {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 200, height: 120 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          handleBarcodeScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
      toast.success("Scanner started - point camera at barcode");
    } catch (err) {
      console.error("Failed to start camera:", err);
      toast.error("Camera access denied or not available");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
        toast.info("Scanner stopped");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    // Immediately block if already processing (ref updates instantly, unlike state)
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Normalize barcode: trim whitespace and remove any non-numeric characters for EAN/UPC barcodes
    const normalizedBarcode = barcode.trim().replace(/[^0-9]/g, '');
    
    console.log('Raw barcode:', barcode, '| Normalized:', normalizedBarcode);

    // Try both original and normalized barcode
    let product = findProductByBarcode(normalizedBarcode);
    if (!product) {
      product = findProductByBarcode(barcode.trim());
    }
    
    if (product) {
      onScan(product);
      toast.success(`Item scanned and added to cart: ${product.name}`);
      // Stop scanner after successful scan (one-time scan)
      await stopScanner();
    } else {
      toast.error(`Unknown barcode: ${normalizedBarcode}. Product not in database.`);
    }

    // Reset processing flag after 2 seconds to allow re-scanning
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Barcode className="w-4 h-4 text-primary" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-60px)] gap-2">
        {/* Camera view area */}
        <div className="flex-1 relative bg-secondary rounded-lg overflow-hidden min-h-[100px]">
          <div id="barcode-reader" ref={containerRef} className="w-full h-full" />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="text-center text-muted-foreground">
                <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-xs">Click Start to scan</span>
              </div>
            </div>
          )}
          {isScanning && (
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="bg-black/70 text-white px-2 py-0.5 rounded-full text-xs">
                Point at barcode
              </span>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={startScanner}
            disabled={isScanning}
            className="flex-1"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Start Scan
          </Button>
          <Button 
            onClick={stopScanner}
            disabled={!isScanning}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop Scan
          </Button>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center justify-center gap-2 ${isScanning ? 'text-success' : 'text-muted-foreground'}`}>
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs">{isScanning ? 'Scanning...' : 'Ready'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
