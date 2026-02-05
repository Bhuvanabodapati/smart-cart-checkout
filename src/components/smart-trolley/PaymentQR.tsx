import { QrCode, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import paymentQR from '@/assets/payment-qr.jpeg';

interface PaymentQRProps {
  canPay: boolean;
  totalPrice: number;
  isProcessing: boolean;
  paymentComplete: boolean;
  transactionId: string;
  paymentMethod: string;
  onPayment: (method: string) => void;
  onReset: () => void;
}

export function PaymentQR({
  canPay,
  totalPrice,
  isProcessing,
  paymentComplete,
  transactionId,
  paymentMethod,
  onPayment,
  onReset,
}: PaymentQRProps) {
  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-60px)] space-y-2">
          {canPay ? (
            <>
              {/* Payment QR Code */}
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20 bg-white p-1">
                <img 
                  src={paymentQR} 
                  alt="Payment QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-lg font-bold text-primary">₹{totalPrice}</p>
              <p className="text-xs text-muted-foreground">Scan & Pay via UPI</p>

              {/* Payment method labels */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-600 font-medium">PhonePe</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-blue-600 font-medium">GPay</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sky-500 font-medium">Paytm</span>
              </div>

              {/* Confirm after payment */}
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => onPayment('UPI')}
                disabled={isProcessing}
              >
                Confirm Payment
              </Button>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">QR Unavailable</p>
              <p className="text-xs">Verify items first</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Dialog */}
      <Dialog open={isProcessing}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">
              Connecting to {paymentMethod}...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={paymentComplete} onOpenChange={() => onReset()}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Transaction Complete</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">₹{totalPrice}</p>
              <p className="text-sm text-muted-foreground">Paid via {paymentMethod}</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm text-foreground">{transactionId}</p>
            </div>
            <Button className="w-full" onClick={onReset}>
              Start New Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
