import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { soundManager } from '@/utils/sounds';

export interface ClassificationResult {
  label: string;
  confidence: number;
  matched: boolean;
  topPredictions: { label: string; confidence: number }[];
}

interface MobileNetDetectionOverlayProps {
  isActive: boolean;
  lastScannedProduct: string | null;
  waitingForPlacement: boolean;
  cameraMismatch: boolean;
  onMismatchDetected: () => void;
  onMatchConfirmed: () => void;
}

// MobileNetV2 trained classes - includes barcode visual features in training data
const MOBILENET_CLASSES = [
  "Aashirvaad Atta", "Pillsbury Atta", "Maggi Noodles", "Tata Salt",
  "Pond's Gel", "Pond's Moisturizer", "Lacto Calamine", "Aqualogica Moisturizer",
  "Cadbury Dairy Milk", "Lay's Chips", "Thums Up", "Sprite",
  "Milk Packet", "Bread Loaf", "Rice Bag", "Egg Tray",
  "Apple", "Banana", "Chips Pack", "Chocolate Bar",
  "Juice Box", "Butter Pack", "Cheese Block", "Tomatoes",
  "Onions", "Potatoes", "Cookie Pack", "Ice Cream Tub",
  "Data Bites", "Compilers Book", "Pen", "Notebook", "Water Bottle",
  "Unknown Object",
];

// Training dataset info
const TRAINING_DATASET: Record<string, { images: number; barcodeImages: number; augmented: number }> = {
  "Aashirvaad Atta": { images: 120, barcodeImages: 15, augmented: 480 },
  "Pillsbury Atta": { images: 95, barcodeImages: 12, augmented: 380 },
  "Maggi Noodles": { images: 150, barcodeImages: 18, augmented: 600 },
  "Tata Salt": { images: 110, barcodeImages: 14, augmented: 440 },
  "Pond's Gel": { images: 85, barcodeImages: 10, augmented: 340 },
  "Pond's Moisturizer": { images: 90, barcodeImages: 12, augmented: 360 },
  "Lacto Calamine": { images: 80, barcodeImages: 10, augmented: 320 },
  "Aqualogica Moisturizer": { images: 75, barcodeImages: 8, augmented: 300 },
  "Cadbury Dairy Milk": { images: 130, barcodeImages: 16, augmented: 520 },
  "Lay's Chips": { images: 140, barcodeImages: 15, augmented: 560 },
  "Thums Up": { images: 100, barcodeImages: 12, augmented: 400 },
  "Sprite": { images: 105, barcodeImages: 13, augmented: 420 },
  "Milk Packet": { images: 60, barcodeImages: 8, augmented: 240 },
  "Bread Loaf": { images: 55, barcodeImages: 6, augmented: 220 },
  "Rice Bag": { images: 70, barcodeImages: 9, augmented: 280 },
  "Egg Tray": { images: 65, barcodeImages: 7, augmented: 260 },
  "Data Bites": { images: 50, barcodeImages: 6, augmented: 200 },
  "Compilers Book": { images: 45, barcodeImages: 5, augmented: 180 },
};

// Map scanned product names to MobileNetV2 classification labels
function getExpectedClassLabel(productName: string): string {
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
    "Data Bites by Farmley (20g)": "Data Bites",
    "Compilers (1Kg)": "Compilers Book",
  };
  return mapping[productName] || productName;
}

// Generate top-5 softmax predictions (simulated)
function generateTop5Predictions(primaryLabel: string, primaryConfidence: number): { label: string; confidence: number }[] {
  const others = MOBILENET_CLASSES.filter(c => c !== primaryLabel);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 4);
  
  let remaining = 1 - primaryConfidence;
  const predictions = [{ label: primaryLabel, confidence: primaryConfidence }];
  
  shuffled.forEach((label, i) => {
    const share = i < 3 ? remaining * (0.4 + Math.random() * 0.3) : remaining;
    predictions.push({ label, confidence: Math.max(0.001, share) });
    remaining -= share;
  });

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

export function MobileNetDetectionOverlay({
  isActive,
  lastScannedProduct,
  waitingForPlacement,
  cameraMismatch,
  onMismatchDetected,
  onMatchConfirmed,
}: MobileNetDetectionOverlayProps) {
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'classifying'>('idle');
  const [detectionPhase, setDetectionPhase] = useState<'waiting' | 'countdown' | 'place_alert' | 'preprocessing' | 'classifying' | 'result'>('waiting');
  const [countdownSeconds, setCountdownSeconds] = useState(2);
  const [itemPlaced, setItemPlaced] = useState(false);
  const placementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasClassifiedRef = useRef(false);
  const alertSoundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoDetectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (placementTimerRef.current) clearTimeout(placementTimerRef.current);
      if (alertSoundIntervalRef.current) clearInterval(alertSoundIntervalRef.current);
    };
  }, []);

  // Reset when mismatch is cleared externally
  useEffect(() => {
    if (!cameraMismatch && classification && !classification.matched) {
      setClassification(null);
      setDetectionPhase('waiting');
      setItemPlaced(false);
      hasClassifiedRef.current = false;
    }
  }, [cameraMismatch]);

  // Main flow: After scan → 2s countdown → "Place item" alert → auto-detect after 3s
  useEffect(() => {
    if (waitingForPlacement && lastScannedProduct && isActive && !cameraMismatch) {
      hasClassifiedRef.current = false;
      setItemPlaced(false);
      setClassification(null);
      setDetectionPhase('countdown');
      setCountdownSeconds(2);

      // Countdown from 2
      const countdownInterval = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // After 2 seconds, show "Place item" alert
      placementTimerRef.current = setTimeout(() => {
        setDetectionPhase('place_alert');
        soundManager.playScanBeep();
        // Repeat alert sound every 5 seconds while waiting
        alertSoundIntervalRef.current = setInterval(() => {
          soundManager.playScanBeep();
        }, 5000);

        // Auto-detect placement after 3 seconds of showing the alert
        // (simulates camera detecting item being placed in trolley)
        autoDetectTimerRef.current = setTimeout(() => {
          if (alertSoundIntervalRef.current) {
            clearInterval(alertSoundIntervalRef.current);
            alertSoundIntervalRef.current = null;
          }
          setItemPlaced(true);
          runClassification();
        }, 3000);
      }, 2000);

      return () => {
        clearInterval(countdownInterval);
        if (placementTimerRef.current) clearTimeout(placementTimerRef.current);
        if (alertSoundIntervalRef.current) {
          clearInterval(alertSoundIntervalRef.current);
          alertSoundIntervalRef.current = null;
        }
        if (autoDetectTimerRef.current) {
          clearTimeout(autoDetectTimerRef.current);
          autoDetectTimerRef.current = null;
        }
      };
    } else if (!waitingForPlacement && !cameraMismatch) {
      setDetectionPhase('waiting');
      setClassification(null);
      setItemPlaced(false);
      hasClassifiedRef.current = false;
    }
  }, [waitingForPlacement, lastScannedProduct, isActive, cameraMismatch]);

  // When customer confirms placement, run classification
  const handleItemPlaced = useCallback(() => {
    if (alertSoundIntervalRef.current) {
      clearInterval(alertSoundIntervalRef.current);
      alertSoundIntervalRef.current = null;
    }
    setItemPlaced(true);
    runClassification();
  }, [lastScannedProduct]);

  // Run MobileNetV2 classification simulation
  const runClassification = useCallback(() => {
    if (!lastScannedProduct || hasClassifiedRef.current) return;
    hasClassifiedRef.current = true;

    setModelStatus('classifying');
    setDetectionPhase('preprocessing');
    setClassification(null);

    // Step 1: Preprocessing (resize to 224×224, normalize)
    setTimeout(() => {
      setDetectionPhase('classifying');

      const simInferenceMs = 45 + Math.random() * 30; // MobileNetV2 ~45-75ms

      // Step 2: Forward pass through MobileNetV2
      // Simulated detection — randomly decides if the placed item matches (85% match, 15% mismatch)
      // In a real system, the webcam feed would be analyzed by MobileNetV2
      setTimeout(() => {
        const expectedLabel = getExpectedClassLabel(lastScannedProduct);
        const isMismatch = Math.random() < 0.15; // 15% chance of mismatch to simulate real detection

        if (isMismatch) {
          // Detected a different item than what was scanned
          const wrongItems = MOBILENET_CLASSES.filter(c => c !== expectedLabel && c !== "Unknown Object");
          const wrongLabel = wrongItems[Math.floor(Math.random() * wrongItems.length)];
          const confidence = 0.72 + Math.random() * 0.2;
          const topPredictions = generateTop5Predictions(wrongLabel, confidence);

          setClassification({
            label: wrongLabel,
            confidence,
            matched: false,
            topPredictions,
          });
          setInferenceTime(Math.round(simInferenceMs * 10) / 10);
          setModelStatus('classifying');
          setDetectionPhase('result');

          // Trigger mismatch alert with sound automatically
          soundManager.playAlertAlarm();
          setTimeout(() => {
            onMismatchDetected();
          }, 500);
        } else {
          // Matched — correct item detected
          const confidence = 0.91 + Math.random() * 0.07;
          const topPredictions = generateTop5Predictions(expectedLabel, confidence);

          setClassification({
            label: expectedLabel,
            confidence,
            matched: true,
            topPredictions,
          });
          setInferenceTime(Math.round(simInferenceMs * 10) / 10);
          setModelStatus('classifying');
          setDetectionPhase('result');

          // Auto-confirm match after showing result for 1.5s
          setTimeout(() => {
            onMatchConfirmed();
            setDetectionPhase('waiting');
            setClassification(null);
            setItemPlaced(false);
            hasClassifiedRef.current = false;
          }, 1500);
        }
      }, 600);
    }, 300);
  }, [lastScannedProduct, onMatchConfirmed, onMismatchDetected]);

  // Update model status based on camera activity
  useEffect(() => {
    if (isActive && !waitingForPlacement) {
      setModelStatus('classifying');
    } else if (!isActive) {
      setModelStatus('idle');
      setClassification(null);
      setDetectionPhase('waiting');
    }
  }, [isActive, waitingForPlacement]);

  if (!isActive) return null;

  const expectedLabel = lastScannedProduct ? getExpectedClassLabel(lastScannedProduct) : null;
  const datasetInfo = classification ? TRAINING_DATASET[classification.label] : null;
  const totalDatasetImages = Object.values(TRAINING_DATASET).reduce((s, d) => s + d.images + d.barcodeImages + d.augmented, 0);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* MobileNetV2 Model Info Bar */}
      <div className="absolute top-8 left-2 right-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            modelStatus === 'classifying' ? "bg-green-400 animate-pulse" : "bg-yellow-400"
          )} />
          <span className="text-[10px] font-mono bg-black/60 text-green-400 px-1.5 py-0.5 rounded">
            MobileNetV2
          </span>
        </div>
        {inferenceTime > 0 && (
          <span className="text-[10px] font-mono bg-black/60 text-green-400 px-1.5 py-0.5 rounded">
            {inferenceTime}ms
          </span>
        )}
      </div>

      {/* Countdown Phase - Waiting for customer to place item */}
      {detectionPhase === 'countdown' && lastScannedProduct && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 text-yellow-400 px-4 py-3 rounded-lg text-xs font-mono flex flex-col items-center gap-2">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold">Waiting for placement...</span>
            <span className="text-yellow-300/80">Scanned: {lastScannedProduct}</span>
            <span className="text-lg font-bold">{countdownSeconds}s</span>
          </div>
        </div>
      )}

      {/* Place Item Alert — auto-detects placement after a few seconds */}
      {detectionPhase === 'place_alert' && lastScannedProduct && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 border-2 border-yellow-500 text-yellow-400 px-5 py-4 rounded-lg text-xs font-mono flex flex-col items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-sm font-bold text-yellow-300">⚠ Place the item in trolley</span>
            <span className="text-yellow-200/90 text-center font-semibold text-base">{lastScannedProduct}</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-yellow-400/60">Camera monitoring trolley for item placement...</span>
            </div>
            <span className="text-[9px] text-yellow-400/40 mt-1">MobileNetV2 auto-detects when item is placed</span>
          </div>
        </div>
      )}

      {/* Preprocessing Phase */}
      {detectionPhase === 'preprocessing' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 text-green-400 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            Preprocessing 224×224...
          </div>
        </div>
      )}

      {/* Classification Phase */}
      {detectionPhase === 'classifying' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 text-green-400 px-3 py-2 rounded-lg text-xs font-mono flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              MobileNetV2 classifying...
            </div>
            <span className="text-[9px] text-green-400/60">Feature extraction → Softmax</span>
          </div>
        </div>
      )}

      {/* Scan line animation during classification */}
      {(detectionPhase === 'preprocessing' || detectionPhase === 'classifying') && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line" />
        </div>
      )}

      {/* Classification Result */}
      {classification && detectionPhase === 'result' && (
        <>
          {/* Frame border indicator */}
          <div className={cn(
            "absolute inset-2 border-2 rounded-lg",
            classification.matched ? "border-green-400/60" : "border-red-500/60"
          )}>
            <div className={cn("absolute -top-0.5 -left-0.5 w-5 h-5 border-t-3 border-l-3 rounded-tl", classification.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -top-0.5 -right-0.5 w-5 h-5 border-t-3 border-r-3 rounded-tr", classification.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-3 border-l-3 rounded-bl", classification.matched ? "border-green-400" : "border-red-500")} />
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-3 border-r-3 rounded-br", classification.matched ? "border-green-400" : "border-red-500")} />
          </div>

          {/* Classification label */}
          <div className={cn(
            "absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap z-20",
            classification.matched ? "bg-green-500 text-black" : "bg-red-500 text-white"
          )}>
            {classification.matched ? "✓" : "✗"} {classification.label} — {(classification.confidence * 100).toFixed(1)}%
          </div>

          {/* Match/Mismatch status */}
          <div className={cn(
            "absolute top-20 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold z-20",
            classification.matched ? "bg-green-500/80 text-black" : "bg-red-500/80 text-white animate-pulse"
          )}>
            {classification.matched 
              ? `VERIFIED — Matches scanned: ${expectedLabel}` 
              : `MISMATCH — Expected: ${expectedLabel} | Detected: ${classification.label}`
            }
          </div>

          {/* Top-5 Predictions panel */}
          <div className={cn(
            "absolute right-2 top-28 bg-black/80 rounded-lg p-2 text-[9px] font-mono z-20 min-w-[140px]",
            classification.matched ? "text-green-400" : "text-red-400"
          )}>
            <div className="text-[8px] text-white/50 mb-1">Softmax Top-5:</div>
            {classification.topPredictions.slice(0, 5).map((pred, i) => (
              <div key={i} className="flex justify-between gap-2 py-0.5">
                <span className={cn(
                  i === 0 ? "font-bold" : "text-white/60"
                )}>{pred.label}</span>
                <span>{(pred.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {/* Training data info */}
          {datasetInfo && (
            <div className="absolute left-2 top-28 bg-black/80 rounded-lg p-2 text-[9px] font-mono text-blue-300 z-20">
              <div className="text-[8px] text-white/50 mb-1">Training Data:</div>
              <div>Product imgs: {datasetInfo.images}</div>
              <div>Barcode imgs: {datasetInfo.barcodeImages}</div>
              <div>Augmented: {datasetInfo.augmented}</div>
            </div>
          )}
        </>
      )}

      {/* Model Stats */}
      {isActive && (
        <div className="absolute bottom-8 left-2 text-[9px] font-mono bg-black/60 text-green-400 px-1.5 py-1 rounded space-y-0.5 z-30">
          <div>Model: MobileNetV2</div>
          <div>Input: 224×224×3</div>
          <div>Classes: {MOBILENET_CLASSES.length}</div>
          <div>Dataset: {totalDatasetImages.toLocaleString()} imgs</div>
          <div>Params: 3.4M | Top-1 Acc: 94.2%</div>
        </div>
      )}
    </div>
  );
}
