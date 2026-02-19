import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Camera, AlertTriangle, VideoOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  frameCount: number;
  isMismatch: boolean;
  isActive: boolean;
}

export interface CameraFeedHandle {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(({ frameCount, isMismatch, isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // First get permission + populate labels
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      initialStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      console.log('Available cameras:', videoDevices.map(d => `${d.label} (${d.deviceId.slice(0, 8)})`));

      // Pick USB/external camera
      const usbCamera = videoDevices.find(device => {
        const label = device.label.toLowerCase();
        return label.includes('usb') || label.includes('web cam') ||
               label.includes('logitech') || label.includes('c270') ||
               label.includes('046d');
      }) || (videoDevices.length > 1 ? videoDevices[videoDevices.length - 1] : undefined);

      if (usbCamera) {
        console.log('Selected trolley camera:', usbCamera.label);
      }

      const constraints: MediaStreamConstraints = {
        video: usbCamera
          ? { deviceId: { exact: usbCamera.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Trolley camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Expose start/stop to parent via ref
  useImperativeHandle(ref, () => ({ startCamera, stopCamera }), [startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  return (
    <Card className={cn(
      "h-full relative overflow-hidden",
      isMismatch && "border-destructive animate-alert-flash"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Trolley Camera
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative h-[calc(100%-60px)]">
        {/* Video/Camera view container */}
        <div className={cn(
          "w-full h-full rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden",
          isMismatch && "border-2 border-destructive"
        )}>
          {/* Live video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              !isActive && "hidden"
            )}
          />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="grid grid-cols-3 grid-rows-3 h-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-foreground/10" />
              ))}
            </div>
          </div>

          {/* Mismatch warning overlay */}
          {isMismatch && (
            <div className="absolute inset-0 bg-destructive/30 flex flex-col items-center justify-center gap-2 z-10">
              <AlertTriangle className="w-12 h-12 text-destructive animate-bounce" />
              <span className="text-destructive font-bold text-lg bg-background/80 px-3 py-1 rounded">MISMATCH DETECTED</span>
              <span className="text-destructive text-xs bg-background/80 px-2 py-0.5 rounded">Item verification failed</span>
            </div>
          )}

          {/* Placeholder when camera is off */}
          {!isActive && !isMismatch && (
            <div className="text-muted-foreground/50 text-center z-10">
              <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <span className="text-xs">Waiting for scan...</span>
            </div>
          )}

          {/* Camera info overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-2 z-20">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMismatch ? "bg-destructive" : isActive ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            <span className={cn(
              "text-xs bg-background/50 px-1 rounded",
              isActive ? "text-success" : "text-foreground/70"
            )}>
              {isActive ? "REC" : "OFF"}
            </span>
          </div>

          <div className="absolute top-2 right-2 text-xs text-foreground/70 bg-background/50 px-1 rounded z-20">
            TROLLEY-CAM
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-foreground/70 bg-background/50 px-1 rounded z-20">
            {timestamp}
          </div>

          <div className="absolute bottom-2 right-2 text-xs text-foreground/70 bg-background/50 px-1 rounded z-20">
            Frame: {String(frameCount).padStart(4, '0')}
          </div>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-1 left-0 right-0 py-1 text-center text-xs font-medium",
          isMismatch 
            ? "bg-destructive text-destructive-foreground" 
            : isActive 
              ? "bg-success/20 text-success"
              : "bg-muted text-muted-foreground"
        )}>
          {isMismatch ? "⚠️ ALERT: Item Mismatch" : isActive ? "✓ Live Feed Active" : "○ Camera Standby"}
        </div>
      </CardContent>
    </Card>
  );
});

CameraFeed.displayName = 'CameraFeed';
