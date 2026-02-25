
import { useRef, useEffect } from 'react';
import { Header } from '@/components/smart-trolley/Header';
import { BarcodeScanner } from '@/components/smart-trolley/BarcodeScanner';
import { CameraFeed, CameraFeedHandle } from '@/components/smart-trolley/CameraFeed';
import { ShoppingCartPanel } from '@/components/smart-trolley/ShoppingCartPanel';
import { WeightSensor } from '@/components/smart-trolley/WeightSensor';
import { PaymentQR } from '@/components/smart-trolley/PaymentQR';
import { useSmartTrolley } from '@/hooks/useSmartTrolley';
import { PackageCheck } from 'lucide-react';

const Index = () => {
  const trolley = useSmartTrolley();
  const cameraRef = useRef<CameraFeedHandle>(null);

  // Hidden keyboard shortcuts for demo screenshots:
  // Press 'W' to trigger weight mismatch, 'C' for camera mismatch, 'Escape' to stop all alerts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'w' || e.key === 'W') trolley.simulateWeightMismatch();
      if (e.key === 'c' || e.key === 'C') trolley.simulateCameraMismatch();
      if (e.key === 'Escape') {
        trolley.stopWeightAlert();
        trolley.stopCameraAlert();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [trolley]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <Header />

      {/* Placement Prompt Overlay */}
      {trolley.waitingForPlacement && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Place the item in the trolley</h2>
            <p className="text-sm text-muted-foreground">
              Scanned: <span className="font-semibold text-primary">{trolley.lastScannedProduct}</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Content - 3 Column Grid */}
      <main className="flex-1 grid grid-cols-4 gap-3 p-3 min-h-0">
        {/* Left Column - Scanner & Camera */}
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <BarcodeScanner 
              onScan={trolley.addToCart}
              isScanning={trolley.isScanning}
              onScanningChange={trolley.setIsScanning}
              onScanStart={() => cameraRef.current?.startCamera()}
              onScanStop={() => cameraRef.current?.stopCamera()}
            />
          </div>
          <div className="flex-1">
            <CameraFeed 
              ref={cameraRef}
              frameCount={trolley.frameCount} 
              isMismatch={trolley.cameraMismatch}
              isActive={trolley.isScanning || trolley.waitingForPlacement}
            />
          </div>
        </div>

        {/* Center Column - Shopping Cart (takes 2 columns) */}
        <div className="col-span-2">
          <ShoppingCartPanel
            cart={trolley.cart}
            totalItems={trolley.totalItems}
            totalPrice={trolley.totalPrice}
            scannedWeight={trolley.scannedWeight}
            onUpdateQuantity={trolley.updateQuantity}
            onRemove={trolley.removeFromCart}
          />
        </div>

        {/* Right Column - Weight & Payment */}
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <WeightSensor
              trolleyWeight={trolley.trolleyWeight}
              scannedWeight={trolley.scannedWeight}
              weightsMatch={trolley.weightsMatch}
              isMismatch={trolley.weightMismatch}
            />
          </div>
          <div className="flex-1">
            <PaymentQR
              canPay={trolley.canPay}
              totalPrice={trolley.totalPrice}
              isProcessing={trolley.isProcessingPayment}
              paymentComplete={trolley.paymentComplete}
              transactionId={trolley.transactionId}
              paymentMethod={trolley.paymentMethod}
              onPayment={trolley.processPayment}
              onReset={trolley.resetTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
