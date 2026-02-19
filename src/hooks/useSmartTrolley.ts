import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, Product } from '@/data/products';
import { soundManager } from '@/utils/sounds';

export interface TrolleyState {
  cart: CartItem[];
  trolleyWeight: number;
  scannedWeight: number;
  cameraMismatch: boolean;
  weightMismatch: boolean;
  isProcessingPayment: boolean;
  paymentComplete: boolean;
  transactionId: string;
  paymentMethod: string;
  frameCount: number;
  isScanning: boolean;
  waitingForPlacement: boolean;
  lastScannedProduct: string | null;
}

export function useSmartTrolley() {
  const [state, setState] = useState<TrolleyState>({
    cart: [],
    trolleyWeight: 0,
    scannedWeight: 0,
    cameraMismatch: false,
    weightMismatch: false,
    isProcessingPayment: false,
    paymentComplete: false,
    transactionId: '',
    paymentMethod: '',
    frameCount: 0,
    isScanning: false,
    waitingForPlacement: false,
    lastScannedProduct: null,
  });

  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Frame counter for camera simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        frameCount: (prev.frameCount + 1) % 10000
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate scanned weight whenever cart changes
  useEffect(() => {
    const totalWeight = state.cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    setState(prev => ({
      ...prev,
      scannedWeight: totalWeight,
      trolleyWeight: prev.weightMismatch ? prev.trolleyWeight : totalWeight, // Sync if no mismatch
    }));
  }, [state.cart, state.weightMismatch]);

  const placementTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addToCart = useCallback((product: Product) => {
    soundManager.playScanBeep();
    
    // Clear any existing placement timer
    if (placementTimerRef.current) {
      clearTimeout(placementTimerRef.current);
    }

    setState(prev => {
      const existing = prev.cart.find(item => item.id === product.id);
      const newCart = existing
        ? prev.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev.cart, { ...product, quantity: 1 }];
      return {
        ...prev,
        cart: newCart,
        waitingForPlacement: true,
        lastScannedProduct: product.name,
      };
    });

    // Auto-dismiss placement popup after 2 seconds
    placementTimerRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        waitingForPlacement: false,
        lastScannedProduct: null,
      }));
    }, 2000);
  }, []);

  const confirmPlacement = useCallback(() => {
    setState(prev => ({
      ...prev,
      waitingForPlacement: false,
      lastScannedProduct: null,
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setState(prev => {
      const updated = prev.cart.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return { ...prev, cart: updated };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.id !== productId),
    }));
  }, []);

  const simulateCameraMismatch = useCallback(() => {
    soundManager.playAlertAlarm();
    setState(prev => ({ ...prev, cameraMismatch: true }));
    
    // Play repeated alarm
    alertIntervalRef.current = setInterval(() => {
      soundManager.playAlertAlarm();
    }, 2000);
  }, []);

  const stopCameraAlert = useCallback(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, cameraMismatch: false }));
  }, []);

  const simulateWeightMismatch = useCallback(() => {
    soundManager.playAlertAlarm();
    setState(prev => ({
      ...prev,
      weightMismatch: true,
      trolleyWeight: Math.round(prev.scannedWeight * 0.7), // Simulate 30% weight difference
    }));
    
    alertIntervalRef.current = setInterval(() => {
      soundManager.playAlertAlarm();
    }, 2000);
  }, []);

  const stopWeightAlert = useCallback(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      weightMismatch: false,
      trolleyWeight: prev.scannedWeight, // Sync weights
    }));
  }, []);

  const processPayment = useCallback((method: string) => {
    setState(prev => ({ ...prev, isProcessingPayment: true, paymentMethod: method }));
    
    setTimeout(() => {
      const txnId = `TXN${Date.now()}`;
      soundManager.playSuccessChime();
      setState(prev => ({
        ...prev,
        isProcessingPayment: false,
        paymentComplete: true,
        transactionId: txnId,
      }));
    }, 2500);
  }, []);

  const setIsScanning = useCallback((scanning: boolean) => {
    setState(prev => ({ ...prev, isScanning: scanning }));
  }, []);

  const resetTransaction = useCallback(() => {
    setState({
      cart: [],
      trolleyWeight: 0,
      scannedWeight: 0,
      cameraMismatch: false,
      weightMismatch: false,
      isProcessingPayment: false,
      paymentComplete: false,
      transactionId: '',
      paymentMethod: '',
      frameCount: state.frameCount,
      isScanning: false,
      waitingForPlacement: false,
      lastScannedProduct: null,
    });
  }, [state.frameCount]);

  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const weightsMatch = state.trolleyWeight === state.scannedWeight && !state.weightMismatch;
  const canPay = weightsMatch && !state.cameraMismatch && state.cart.length > 0;

  return {
    ...state,
    totalPrice,
    totalItems,
    weightsMatch,
    canPay,
    addToCart,
    updateQuantity,
    removeFromCart,
    simulateCameraMismatch,
    stopCameraAlert,
    simulateWeightMismatch,
    stopWeightAlert,
    processPayment,
    resetTransaction,
    setIsScanning,
    confirmPlacement,
  };
}
