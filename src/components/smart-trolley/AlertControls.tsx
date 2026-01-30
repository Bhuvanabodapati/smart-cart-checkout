import { AlertTriangle, Camera, Scale, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AlertControlsProps {
  cameraMismatch: boolean;
  weightMismatch: boolean;
  onSimulateCameraMismatch: () => void;
  onStopCameraAlert: () => void;
  onSimulateWeightMismatch: () => void;
  onStopWeightAlert: () => void;
}

export function AlertControls({
  cameraMismatch,
  weightMismatch,
  onSimulateCameraMismatch,
  onStopCameraAlert,
  onSimulateWeightMismatch,
  onStopWeightAlert,
}: AlertControlsProps) {
  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-warning" />
          Alert Controls (Demo)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Camera Controls */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Camera className="w-3 h-3" />
              <span>Camera</span>
            </div>
            <Button
              variant={cameraMismatch ? "secondary" : "destructive"}
              size="sm"
              className="w-full text-xs h-7"
              onClick={onSimulateCameraMismatch}
              disabled={cameraMismatch}
            >
              Simulate Mismatch
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={onStopCameraAlert}
              disabled={!cameraMismatch}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Stop Alert
            </Button>
          </div>

          {/* Weight Controls */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Scale className="w-3 h-3" />
              <span>Weight</span>
            </div>
            <Button
              variant={weightMismatch ? "secondary" : "destructive"}
              size="sm"
              className="w-full text-xs h-7"
              onClick={onSimulateWeightMismatch}
              disabled={weightMismatch}
            >
              Simulate Mismatch
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={onStopWeightAlert}
              disabled={!weightMismatch}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Stop Alert
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
