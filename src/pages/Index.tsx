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
            />
          </div>
          <div className="flex-1">
            <CameraFeed 
              frameCount={trolley.frameCount} 
              isMismatch={trolley.cameraMismatch}
              isActive={trolley.isScanning}
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
          {/* Alert Controls */}
          <AlertControls
            weightMismatch={trolley.weightMismatch}
            onSimulateWeightMismatch={trolley.simulateWeightMismatch}
            onStopWeightAlert={trolley.stopWeightAlert}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
