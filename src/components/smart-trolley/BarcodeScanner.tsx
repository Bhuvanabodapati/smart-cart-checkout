import { Barcode, CheckCircle, Camera, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, findProductByBarcode } from '@/data/products';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
  onScanStart?: () => void;
  onScanStop?: () => void;
}

export function BarcodeScanner({ onScan, isScanning, onScanningChange, onScanStart, onScanStop }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  const startScanner = async () => {
    if (!containerRef.current || isScanning) return;

    try {
      // Find built-in laptop camera (avoid USB/external)
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      initialStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      const builtInCamera = videoDevices.find(device => {
        const label = device.label.toLowerCase();
        return label.includes('uvc webcam') || label.includes('hd webcam') ||
               label.includes('integrated') || label.includes('322e:2012');
      }) || videoDevices.find(device => {
        const label = device.label.toLowerCase();
        const isExternal = label.includes('pc camera') || label.includes('1908:2311') ||
                           label.includes('logitech') || label.includes('c270');
        return !isExternal;
      }) || videoDevices[0];

      const cameraId = builtInCamera?.deviceId;

      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" },
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
      onScanningChange(true);
      onScanStart?.();
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
        onScanningChange(false);
        onScanStop?.();
        toast.info("Scanner stopped");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const normalizedBarcode = barcode.trim().replace(/[^0-9]/g, '');
    
    console.log('Raw barcode:', barcode, '| Normalized:', normalizedBarcode);

    let product = findProductByBarcode(normalizedBarcode);
    if (!product) {
      product = findProductByBarcode(barcode.trim());
    }
    
    if (product) {
      onScan(product);
      toast.success(`Item scanned and added to cart: ${product.name}`);
      // Don't stop scanner - keep scanning continuously
    } else {
      toast.error(`Unknown barcode: ${normalizedBarcode}. Product not in database.`);
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 2000);
  };

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
