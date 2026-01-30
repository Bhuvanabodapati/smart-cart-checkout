import { Camera, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  frameCount: number;
  isMismatch: boolean;
}

export function CameraFeed({ frameCount, isMismatch }: CameraFeedProps) {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <Card className={cn(
      "h-full relative overflow-hidden",
      isMismatch && "border-destructive animate-alert-flash"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Camera Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-60px)]">
        {/* Simulated camera view */}
        <div className={cn(
          "w-full h-full rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden",
          isMismatch && "border-2 border-destructive"
        )}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-3 grid-rows-3 h-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-foreground/10" />
              ))}
            </div>
          </div>

          {/* Mismatch warning overlay */}
          {isMismatch ? (
            <div className="flex flex-col items-center justify-center gap-2 z-10">
              <AlertTriangle className="w-12 h-12 text-destructive animate-bounce" />
              <span className="text-destructive font-bold text-lg">MISMATCH DETECTED</span>
              <span className="text-destructive text-xs">Item verification failed</span>
            </div>
          ) : (
            <div className="text-muted-foreground/50 text-center">
              <Camera className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <span className="text-xs">Live Feed Active</span>
            </div>
          )}

          {/* Camera info overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMismatch ? "bg-destructive" : "bg-success animate-pulse"
            )} />
            <span className="text-xs text-foreground/70">REC</span>
          </div>

          <div className="absolute top-2 right-2 text-xs text-foreground/70">
            CAM-01
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-foreground/70">
            {timestamp}
          </div>

          <div className="absolute bottom-2 right-2 text-xs text-foreground/70">
            Frame: {String(frameCount).padStart(4, '0')}
          </div>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-1 left-0 right-0 py-1 text-center text-xs font-medium",
          isMismatch 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-success/20 text-success"
        )}>
          {isMismatch ? "⚠️ ALERT: Item Mismatch" : "✓ Capturing - All Clear"}
        </div>
      </CardContent>
    </Card>
  );
}
