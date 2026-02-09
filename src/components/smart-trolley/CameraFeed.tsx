import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertTriangle, Video, VideoOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  frameCount: number;
  isMismatch: boolean;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function CameraFeed({ frameCount, isMismatch }: CameraFeedProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Enumerate available cameras
  const refreshCameras = useCallback(async () => {
    try {
      // Request permission first to get labeled devices
      await navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`
        }));
      
      setCameras(videoDevices);
      
      // Auto-select external camera (usually not the first one, or one with "USB" in name)
      const externalCam = videoDevices.find(cam => 
        cam.label.toLowerCase().includes('usb') || 
        cam.label.toLowerCase().includes('logitech') ||
        cam.label.toLowerCase().includes('c270')
      );
      
      if (externalCam) {
        setSelectedCamera(externalCam.deviceId);
      } else if (videoDevices.length > 0 && !selectedCamera) {
        // If multiple cameras, prefer the second one (often external)
        setSelectedCamera(videoDevices.length > 1 ? videoDevices[1].deviceId : videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating cameras:', err);
      setError('Cannot access cameras');
    }
  }, [selectedCamera]);

  // Load cameras on mount
  useEffect(() => {
    refreshCameras();
  }, []);

  const startCamera = useCallback(async () => {
    if (!selectedCamera) {
      setError('Please select a camera first');
      return;
    }

    try {
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedCamera },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or unavailable');
    }
  }, [selectedCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Restart camera when selection changes while streaming
  useEffect(() => {
    if (isStreaming && selectedCamera) {
      startCamera();
    }
  }, [selectedCamera]);

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
      <CardHeader className="pb-1 px-3 pt-2">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Camera</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={refreshCameras}
              title="Refresh camera list"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              variant={isStreaming ? "destructive" : "default"}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={isStreaming ? stopCamera : startCamera}
            >
              {isStreaming ? (
                <>
                  <VideoOff className="w-3 h-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Video className="w-3 h-3 mr-1" />
                  Start
                </>
              )}
            </Button>
          </div>
        </CardTitle>
        
        {/* Camera selector */}
        <div className="mt-1">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select webcam..." />
            </SelectTrigger>
            <SelectContent>
              {cameras.length === 0 ? (
                <SelectItem value="none" disabled>No cameras found</SelectItem>
              ) : (
                cameras.map((cam) => (
                  <SelectItem key={cam.deviceId} value={cam.deviceId}>
                    {cam.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="relative h-[calc(100%-90px)] px-3 pb-3">
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
              !isStreaming && "hidden"
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
              <AlertTriangle className="w-10 h-10 text-destructive animate-bounce" />
              <span className="text-destructive font-bold text-sm bg-background/80 px-2 py-1 rounded">MISMATCH</span>
            </div>
          )}

          {/* Placeholder when camera is off */}
          {!isStreaming && !isMismatch && (
            <div className="text-muted-foreground/50 text-center z-10 p-2">
              {error ? (
                <>
                  <VideoOff className="w-10 h-10 mx-auto mb-1 text-destructive/50" />
                  <span className="text-[10px] text-destructive/70">{error}</span>
                </>
              ) : (
                <>
                  <Camera className="w-10 h-10 mx-auto mb-1 opacity-30" />
                  <span className="text-[10px]">Select webcam & click Start</span>
                </>
              )}
            </div>
          )}

          {/* Camera info overlay */}
          <div className="absolute top-1 left-1 flex items-center gap-1 z-20">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMismatch ? "bg-destructive" : isStreaming ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            <span className={cn(
              "text-[10px] bg-background/50 px-1 rounded",
              isStreaming ? "text-success" : "text-foreground/70"
            )}>
              {isStreaming ? "REC" : "OFF"}
            </span>
          </div>

          <div className="absolute top-1 right-1 text-[10px] text-foreground/70 bg-background/50 px-1 rounded z-20">
            TROLLEY-CAM
          </div>

          <div className="absolute bottom-1 left-1 text-[10px] text-foreground/70 bg-background/50 px-1 rounded z-20">
            {timestamp}
          </div>

          <div className="absolute bottom-1 right-1 text-[10px] text-foreground/70 bg-background/50 px-1 rounded z-20">
            F:{String(frameCount).padStart(4, '0')}
          </div>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-1 left-0 right-0 py-0.5 text-center text-[10px] font-medium",
          isMismatch 
            ? "bg-destructive text-destructive-foreground" 
            : isStreaming 
              ? "bg-success/20 text-success"
              : "bg-muted text-muted-foreground"
        )}>
          {isMismatch ? "⚠️ MISMATCH" : isStreaming ? "✓ Live" : "○ Standby"}
        </div>
      </CardContent>
    </Card>
  );
}
