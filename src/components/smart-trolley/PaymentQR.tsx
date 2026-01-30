import { QrCode, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-60px)] space-y-3">
          {canPay ? (
            <>
              {/* QR Code simulation */}
              <div className="w-24 h-24 bg-foreground rounded-lg p-1.5 relative">
                <div className="w-full h-full bg-background rounded grid grid-cols-5 gap-0.5 p-1">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-sm",
                        Math.random() > 0.4 ? "bg-foreground" : "bg-background"
                      )}
                    />
                  ))}
                </div>
                <QrCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary bg-background rounded p-0.5" />
              </div>

              <p className="text-lg font-bold text-primary">₹{totalPrice}</p>
              <p className="text-xs text-muted-foreground">Scan or tap to pay</p>

              {/* Payment buttons */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onPayment('PhonePe')}
                  disabled={isProcessing}
                >
                  📱 PhonePe
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onPayment('GPay')}
                  disabled={isProcessing}
                >
                  💳 GPay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onPayment('Paytm')}
                  disabled={isProcessing}
                >
                  💰 Paytm
                </Button>
              </div>
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
