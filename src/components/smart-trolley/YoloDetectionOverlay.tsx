import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface DetectedObject {
  label: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number }; // percentages
  matched: boolean;
}

interface YoloDetectionOverlayProps {
  isActive: boolean;
  lastScannedProduct: string | null;
  waitingForPlacement: boolean;
  onMismatchDetected: () => void;
  onMatchConfirmed: () => void;
}

// Simulated YOLOv8 detection classes for grocery/personal care items
const YOLO_CLASSES = [
  "Aashirvaad Atta", "Pillsbury Atta", "Maggi Noodles", "Tata Salt",
  "Pond's Gel", "Pond's Moisturizer", "Lacto Calamine", "Aqualogica Moisturizer",
  "Cadbury Dairy Milk", "Lay's Chips", "Thums Up", "Sprite",
  "Milk Packet", "Bread Loaf", "Rice Bag", "Egg Tray",
  "Apple", "Banana", "Chips Pack", "Chocolate Bar",
  "Juice Box", "Butter Pack", "Cheese Block", "Tomatoes",
  "Onions", "Potatoes", "Cookie Pack", "Ice Cream Tub",
  "Data Bites", "Compilers Book",
];

// Map scanned product names to expected YOLO detection labels
function getExpectedDetectionLabel(productName: string): string {
  const mapping: Record<string, string> = {
    "Aashirvaad Atta (1Kg)": "Aashirvaad Atta",
    "Pond's Hyaluronic Super Light Gel (25ml)": "Pond's Gel",
    "Pond's Light Moisturizer (200ml)": "Pond's Moisturizer",
    "Lacto Calamine Face Lotion (60ml)": "Lacto Calamine",
    "Aqualogica Avocado Moisturizer (100g)": "Aqualogica Moisturizer",
    "Maggi 2-Minute Masala Noodles (70g)": "Maggi Noodles",
    "Cadbury Dairy Milk Fruit & Nut (180g)": "Cadbury Dairy Milk",
    "Lay's Salted Potato Chips (36g)": "Lay's Chips",
    "Thums Up (250ml)": "Thums Up",
    "Sprite (2L)": "Sprite",
    "Tata Salt (1Kg)": "Tata Salt",
    "Milk (1L)": "Milk Packet",
    "Bread": "Bread Loaf",
    "Rice (1kg)": "Rice Bag",
    "Eggs (12pc)": "Egg Tray",
    "Apple (1kg)": "Apple",
    "Banana (1dz)": "Banana",
    "Chips Pack": "Chips Pack",
    "Chocolate Bar": "Chocolate Bar",
    "Juice (1L)": "Juice Box",
    "Butter (500g)": "Butter Pack",
    "Cheese (200g)": "Cheese Block",
    "Tomatoes (1kg)": "Tomatoes",
    "Onions (1kg)": "Onions",
    "Potatoes (1kg)": "Potatoes",
    "Cookies Pack": "Cookie Pack",
    "Ice Cream Feast Vanilla (1L)": "Ice Cream Tub",
    "Data Bites by Farmley (20g)": "Data Bites",
    "Compilers (1Kg)": "Compilers Book",
  };
  return mapping[productName] || productName;
}

// Simulated mismatch: detect a DIFFERENT item than what was scanned
function getRandomMismatchLabel(expectedLabel: string): string {
  const others = YOLO_CLASSES.filter(c => c !== expectedLabel);
  return others[Math.floor(Math.random() * others.length)];
}

export function YoloDetectionOverlay({
  isActive,
  lastScannedProduct,
  waitingForPlacement,
  onMismatchDetected,
  onMatchConfirmed,
}: YoloDetectionOverlayProps) {
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'running'>('idle');
  const [detectionPhase, setDetectionPhase] = useState<'waiting' | 'detecting' | 'result'>('waiting');

  // Simulate YOLOv8 detection when an item is placed (waitingForPlacement)
  const runDetection = useCallback(() => {
    if (!lastScannedProduct || !waitingForPlacement) return;

    setModelStatus('running');
    setDetectionPhase('detecting');
    setDetections([]);

    // Simulate inference delay (YOLOv8 nano ~15-30ms on GPU)
    const simInferenceMs = 18 + Math.random() * 25;

    setTimeout(() => {
      const expectedLabel = getExpectedDetectionLabel(lastScannedProduct);
      const confidence = 0.82 + Math.random() * 0.15; // 0.82 - 0.97

      // Randomize bounding box position slightly
      const bbox = {
        x: 15 + Math.random() * 20,
        y: 10 + Math.random() * 15,
        w: 40 + Math.random() * 20,
        h: 45 + Math.random() * 20,
      };

      // Normal case: detected item matches scanned item
      const detected: DetectedObject = {
        label: expectedLabel,
        confidence,
        bbox,
        matched: true,
      };

      setDetections([detected]);
      setInferenceTime(Math.round(simInferenceMs * 10) / 10);
      setModelStatus('running');
      setDetectionPhase('result');

      // Auto-confirm match after showing detection
      setTimeout(() => {
        onMatchConfirmed();
        setDetectionPhase('waiting');
        setDetections([]);
      }, 2000);
    }, 800); // Simulate processing time
  }, [lastScannedProduct, waitingForPlacement, onMatchConfirmed]);

  // Trigger detection when waiting for placement
  useEffect(() => {
    if (waitingForPlacement && lastScannedProduct && isActive) {
      const timer = setTimeout(runDetection, 1500); // Wait 1.5s for item to appear in frame
      return () => clearTimeout(timer);
    }
  }, [waitingForPlacement, lastScannedProduct, isActive, runDetection]);

  // Update model status based on camera activity
  useEffect(() => {
    if (isActive && !waitingForPlacement) {
      setModelStatus('running');
    } else if (!isActive) {
      setModelStatus('idle');
      setDetections([]);
      setDetectionPhase('waiting');
    }
  }, [isActive, waitingForPlacement]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* YOLOv8 Model Info Bar */}
      <div className="absolute top-8 left-2 right-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            modelStatus === 'running' ? "bg-green-400 animate-pulse" : "bg-yellow-400"
          )} />
          <span className="text-[10px] font-mono bg-black/60 text-green-400 px-1.5 py-0.5 rounded">
            YOLOv8n
          </span>
        </div>
        {inferenceTime > 0 && (
          <span className="text-[10px] font-mono bg-black/60 text-green-400 px-1.5 py-0.5 rounded">
            {inferenceTime}ms
          </span>
        )}
      </div>

      {/* Detection Phase Indicator */}
      {detectionPhase === 'detecting' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 text-green-400 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            Running YOLOv8 inference...
          </div>
        </div>
      )}

      {/* Scanning grid animation when detecting */}
      {detectionPhase === 'detecting' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line" />
        </div>
      )}

      {/* Bounding Boxes */}
      {detections.map((det, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${det.bbox.x}%`,
            top: `${det.bbox.y}%`,
            width: `${det.bbox.w}%`,
            height: `${det.bbox.h}%`,
          }}
        >
          {/* Bounding box border */}
          <div className={cn(
            "absolute inset-0 border-2 rounded-sm",
            det.matched ? "border-green-400" : "border-red-500"
          )}>
            {/* Corner markers */}
            <div className={cn("absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2", det.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2", det.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2", det.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2", det.matched ? "border-green-400" : "border-red-500")} />
          </div>

          {/* Label tag */}
          <div className={cn(
            "absolute -top-6 left-0 px-1.5 py-0.5 rounded-t text-[10px] font-mono font-bold whitespace-nowrap",
            det.matched ? "bg-green-500 text-black" : "bg-red-500 text-white"
          )}>
            {det.label} {(det.confidence * 100).toFixed(1)}%
          </div>

          {/* Match/Mismatch indicator */}
          <div className={cn(
            "absolute -bottom-5 left-0 px-1.5 py-0.5 rounded-b text-[9px] font-mono font-bold",
            det.matched ? "bg-green-500/80 text-black" : "bg-red-500/80 text-white"
          )}>
            {det.matched ? "✓ MATCH" : "✗ MISMATCH"}
          </div>
        </div>
      ))}

      {/* Detection Stats */}
      {isActive && (
        <div className="absolute bottom-8 left-2 text-[9px] font-mono bg-black/60 text-green-400 px-1.5 py-1 rounded space-y-0.5 z-30">
          <div>Model: YOLOv8-nano</div>
          <div>Input: 640×640</div>
          <div>Classes: {YOLO_CLASSES.length}</div>
          <div>Objects: {detections.length}</div>
          <div>NMS: 0.45 | Conf: 0.25</div>
        </div>
      )}
    </div>
  );
}

// Mismatch variant: call this to simulate detecting a WRONG item
export function simulateYoloMismatch(
  scannedProduct: string,
  setDetections: (d: DetectedObject[]) => void,
): DetectedObject {
  const expectedLabel = getExpectedDetectionLabel(scannedProduct);
  const wrongLabel = getRandomMismatchLabel(expectedLabel);
  const confidence = 0.75 + Math.random() * 0.2;

  const detected: DetectedObject = {
    label: wrongLabel,
    confidence,
    bbox: { x: 18 + Math.random() * 15, y: 12 + Math.random() * 10, w: 45 + Math.random() * 15, h: 50 + Math.random() * 15 },
    matched: false,
  };

  setDetections([detected]);
  return detected;
}
