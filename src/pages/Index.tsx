import { Header } from '@/components/smart-trolley/Header';
import { BarcodeScanner } from '@/components/smart-trolley/BarcodeScanner';
import { CameraFeed } from '@/components/smart-trolley/CameraFeed';
import { ShoppingCartPanel } from '@/components/smart-trolley/ShoppingCartPanel';
import { WeightSensor } from '@/components/smart-trolley/WeightSensor';
import { PaymentQR } from '@/components/smart-trolley/PaymentQR';
import { AlertControls } from '@/components/smart-trolley/AlertControls';
import { useSmartTrolley } from '@/hooks/useSmartTrolley';

const Index = () => {
  const trolley = useSmartTrolley();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content - Responsive Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 overflow-auto">
        {/* Scanner - Full width on mobile, half on tablet */}
        <div className="min-h-[180px] md:min-h-[200px]">
          <BarcodeScanner onScan={trolley.addToCart} />
        </div>

        {/* Camera Feed - Hidden on mobile for cleaner UX, shows on tablet+ */}
        <div className="hidden md:block min-h-[200px]">
          <CameraFeed 
            frameCount={trolley.frameCount} 
            isMismatch={trolley.cameraMismatch} 
          />
        </div>

        {/* Shopping Cart - Full width on mobile, spans 2 cols on desktop */}
        <div className="lg:col-span-2 min-h-[250px] md:min-h-[300px]">
          <ShoppingCartPanel
            cart={trolley.cart}
            totalItems={trolley.totalItems}
            totalPrice={trolley.totalPrice}
            scannedWeight={trolley.scannedWeight}
            onUpdateQuantity={trolley.updateQuantity}
            onRemove={trolley.removeFromCart}
          />
        </div>

        {/* Weight Sensor */}
        <div className="min-h-[150px] md:min-h-[180px]">
          <WeightSensor
            trolleyWeight={trolley.trolleyWeight}
            scannedWeight={trolley.scannedWeight}
            weightsMatch={trolley.weightsMatch}
            isMismatch={trolley.weightMismatch}
          />
        </div>

        {/* Payment QR */}
        <div className="min-h-[150px] md:min-h-[180px]">
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

        {/* Alert Controls */}
        <div className="md:col-span-2 lg:col-span-1">
          <AlertControls
            cameraMismatch={trolley.cameraMismatch}
            weightMismatch={trolley.weightMismatch}
            onSimulateCameraMismatch={trolley.simulateCameraMismatch}
            onStopCameraAlert={trolley.stopCameraAlert}
            onSimulateWeightMismatch={trolley.simulateWeightMismatch}
            onStopWeightAlert={trolley.stopWeightAlert}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
