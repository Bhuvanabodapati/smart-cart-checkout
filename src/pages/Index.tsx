
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
              lastScannedProduct={trolley.lastScannedProduct}
              waitingForPlacement={trolley.waitingForPlacement}
              cameraMismatch={trolley.cameraMismatch}
              onMismatchDetected={trolley.simulateCameraMismatch}
              onMatchConfirmed={trolley.confirmPlacement}
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
