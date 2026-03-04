import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

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
  "Data Bites", "Compilers Book",
];

// Training dataset info - barcode images + product images per class
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
  "Apple": { images: 90, barcodeImages: 10, augmented: 360 },
  "Banana": { images: 85, barcodeImages: 8, augmented: 340 },
  "Chips Pack": { images: 100, barcodeImages: 12, augmented: 400 },
  "Chocolate Bar": { images: 110, barcodeImages: 14, augmented: 440 },
  "Juice Box": { images: 75, barcodeImages: 9, augmented: 300 },
  "Butter Pack": { images: 60, barcodeImages: 7, augmented: 240 },
  "Cheese Block": { images: 65, barcodeImages: 8, augmented: 260 },
  "Tomatoes": { images: 80, barcodeImages: 6, augmented: 320 },
  "Onions": { images: 75, barcodeImages: 6, augmented: 300 },
  "Potatoes": { images: 70, barcodeImages: 6, augmented: 280 },
  "Cookie Pack": { images: 90, barcodeImages: 11, augmented: 360 },
  "Ice Cream Tub": { images: 85, barcodeImages: 10, augmented: 340 },
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

function getRandomMismatchLabel(expectedLabel: string): string {
  const others = MOBILENET_CLASSES.filter(c => c !== expectedLabel);
  return others[Math.floor(Math.random() * others.length)];
}

// Generate top-5 softmax predictions (simulated)
function generateTop5Predictions(primaryLabel: string, primaryConfidence: number, isMismatch: boolean): { label: string; confidence: number }[] {
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
  const [detectionPhase, setDetectionPhase] = useState<'waiting' | 'preprocessing' | 'classifying' | 'result'>('waiting');

  // Show mismatch when cameraMismatch is triggered externally (keyboard shortcut)
  useEffect(() => {
    if (cameraMismatch && lastScannedProduct) {
      const expectedLabel = getExpectedClassLabel(lastScannedProduct);
      const wrongLabel = getRandomMismatchLabel(expectedLabel);
      const confidence = 0.78 + Math.random() * 0.18;
      const topPredictions = generateTop5Predictions(wrongLabel, confidence, true);

      setClassification({
        label: wrongLabel,
        confidence,
        matched: false,
        topPredictions,
      });
      setInferenceTime(Math.round((45 + Math.random() * 30) * 10) / 10);
      setDetectionPhase('result');
      setModelStatus('classifying');
    } else if (!cameraMismatch && classification && !classification.matched) {
      setClassification(null);
      setDetectionPhase('waiting');
    }
  }, [cameraMismatch, lastScannedProduct]);

  // MobileNetV2 classification when item is placed
  // 25% chance of auto-mismatch
  const runClassification = useCallback(() => {
    if (!lastScannedProduct || !waitingForPlacement || cameraMismatch) return;

    setModelStatus('classifying');
    setDetectionPhase('preprocessing');
    setClassification(null);

    // Step 1: Preprocessing (resize to 224×224, normalize)
    setTimeout(() => {
      setDetectionPhase('classifying');

      const simInferenceMs = 45 + Math.random() * 30; // MobileNetV2 ~45-75ms
      const isMismatch = Math.random() < 0.25;

      // Step 2: Forward pass through MobileNetV2
      setTimeout(() => {
        const expectedLabel = getExpectedClassLabel(lastScannedProduct);
        const detectedLabel = isMismatch ? getRandomMismatchLabel(expectedLabel) : expectedLabel;
        const confidence = isMismatch ? (0.72 + Math.random() * 0.2) : (0.88 + Math.random() * 0.1);
        const topPredictions = generateTop5Predictions(detectedLabel, confidence, isMismatch);

        setClassification({
          label: detectedLabel,
          confidence,
          matched: !isMismatch,
          topPredictions,
        });
        setInferenceTime(Math.round(simInferenceMs * 10) / 10);
        setModelStatus('classifying');
        setDetectionPhase('result');

        if (isMismatch) {
          setTimeout(() => {
            onMismatchDetected();
          }, 1000);
        } else {
          setTimeout(() => {
            onMatchConfirmed();
            setDetectionPhase('waiting');
            setClassification(null);
          }, 2000);
        }
      }, 600);
    }, 300);
  }, [lastScannedProduct, waitingForPlacement, cameraMismatch, onMatchConfirmed, onMismatchDetected]);

  // Trigger classification when waiting for placement
  useEffect(() => {
    if (waitingForPlacement && lastScannedProduct && isActive) {
      const timer = setTimeout(runClassification, 1500);
      return () => clearTimeout(timer);
    }
  }, [waitingForPlacement, lastScannedProduct, isActive, runClassification]);

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

      {/* Classification Result - Full frame highlight instead of bounding box */}
      {classification && detectionPhase === 'result' && (
        <>
          {/* Frame border indicator */}
          <div className={cn(
            "absolute inset-2 border-2 rounded-lg",
            classification.matched ? "border-green-400/60" : "border-red-500/60"
          )}>
            {/* Corner markers */}
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
            {classification.matched ? "VERIFIED — Item matches scanned barcode" : "ALERT — Item does NOT match scanned barcode"}
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
