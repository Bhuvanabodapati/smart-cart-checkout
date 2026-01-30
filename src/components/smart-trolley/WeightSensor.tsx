import { Scale, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WeightSensorProps {
  trolleyWeight: number;
  scannedWeight: number;
  weightsMatch: boolean;
  isMismatch: boolean;
}

export function WeightSensor({
  trolleyWeight,
  scannedWeight,
  weightsMatch,
  isMismatch,
}: WeightSensorProps) {
  const maxWeight = Math.max(trolleyWeight, scannedWeight, 1000);
  const trolleyPercent = (trolleyWeight / maxWeight) * 100;
  const scannedPercent = (scannedWeight / maxWeight) * 100;

  return (
    <Card className={cn(
      "h-full",
      isMismatch && "border-destructive animate-alert-flash"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Weight Sensor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trolley Weight */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Trolley Weight</span>
            <span className="font-medium">{trolleyWeight}g</span>
          </div>
          <Progress 
            value={trolleyPercent} 
            className={cn(
              "h-2",
              isMismatch && "[&>div]:bg-destructive"
            )}
          />
        </div>

        {/* Scanned Weight */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Scanned Items</span>
            <span className="font-medium">{scannedWeight}g</span>
          </div>
          <Progress value={scannedPercent} className="h-2" />
        </div>

        {/* Status */}
        <div className={cn(
          "flex items-center justify-center gap-2 py-2 rounded-lg",
          weightsMatch 
            ? "bg-success/20 text-success" 
            : "bg-destructive/20 text-destructive"
        )}>
          {weightsMatch ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Weight Match ✓</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Mismatch Detected</span>
            </>
          )}
        </div>

        {/* Weight difference indicator */}
        {!weightsMatch && (
          <div className="text-center text-xs text-destructive">
            Difference: {Math.abs(trolleyWeight - scannedWeight)}g
          </div>
        )}
      </CardContent>
    </Card>
  );
}
