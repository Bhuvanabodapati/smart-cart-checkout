

# Smart Trolley with Dual-Layer Billing System

A modern, fixed-layout mobile UI for an automated smart trolley billing system with secured dual-layer verification using camera, weight sensor, and barcode scanner.

## Application Overview

This will be a **simulation/demo application** that showcases the complete smart trolley system functionality with an attractive dark-themed UI matching your reference design.

---

## Main Dashboard Layout (Fixed Single Screen - No Scrolling)

The UI will be organized in a **3-column grid layout** that fits perfectly on one screen:

### Left Column
1. **Barcode Scanner Panel**
   - "Tap to Scan" button with scanner icon
   - Clicking opens a product selection dialog with pre-defined supermarket items
   - Each product has name, weight, and price
   - Plays buzzer sound when item is scanned successfully
   - Shows "Ready" status indicator

2. **Camera Feed Panel**
   - Simulated camera view with "REC" indicator and frame counter
   - Capturing status with green dot indicator
   - Displays timestamp and camera ID (CAM-01)
   - Live visual verification simulation

### Center Column
3. **Shopping Cart / Dashboard**
   - Lists all scanned items with:
     - Product name and image
     - Weight and price
     - Quantity controls (minus, number, plus buttons)
     - Remove item option
   - Shows total items count and total price
   - Displays total weight of all scanned items

### Right Column (Top)
4. **Weight Sensor Panel**
   - Trolley Weight display (starts at 0g)
   - Scanned Items Weight display
   - Visual progress bars for both
   - Weight match/mismatch status indicator
   - **Weight status comparison** showing if weights match

### Right Column (Bottom)
5. **Payment QR Panel**
   - QR code display (only shows when weights match)
   - Payment options: PhonePe, GPay, Paytm logos
   - Clicking payment option triggers payment simulation
   - Shows "Transaction Complete" with transaction ID on success
   - Plays success buzzer sound after payment

---

## Alert & Verification System

### Camera Mismatch Alert
- **"Simulate Camera Mismatch"** button to test camera verification
- When triggered:
  - Red flashing alert overlay appears
  - Audio alarm sound plays
  - Camera panel shows "MISMATCH DETECTED" warning
  - **"Stop Alert"** button to dismiss

### Weight Mismatch Alert
- **"Simulate Weight Mismatch"** button to test weight verification
- When triggered:
  - Red warning indicator on weight panel
  - Audio alarm sound plays
  - QR code becomes unavailable
  - Shows "Weight mismatch - Please verify items"
  - **"Stop Alert"** button to dismiss

### Alert Controls Section
- Grouped "Simulate Mismatch" and "Stop Alert" buttons for:
  - Camera verification
  - Weight verification

---

## Sound Effects (Web Audio)
- **Scan beep**: When item is successfully scanned
- **Alert alarm**: When camera or weight mismatch is detected
- **Success chime**: When payment transaction is complete

---

## Payment Flow
1. All items scanned → Weights must match
2. When weights match → QR code appears with payment options
3. User clicks PhonePe/GPay/Paytm button
4. Loading animation (2-3 seconds)
5. "Transaction Complete" dialog with:
   - ✅ Green checkmark
   - Transaction ID (e.g., TXN20260130123456)
   - Amount paid
   - Payment method used
   - Success buzzer sound

---

## Header Section
- Smart Trolley logo and name
- "Dual-Layer Secure Billing" tagline
- Trolley ID badge (TROLLEY-001)
- Status icons (signal, battery, time)

---

## Visual Design
- **Dark theme** with deep navy/charcoal background
- **Teal/cyan accent color** for highlights and interactive elements
- Clean, modern cards with subtle borders
- Smooth animations for transitions
- Mobile-optimized touch-friendly buttons
- Fixed layout that fits on tablet/large phone screens

---

## Technical Features
- Responsive but fixed to viewport height (100vh, no scroll)
- Web Audio API for buzzer and alert sounds
- Simulated product database with 10+ items
- Real-time weight calculations
- State management for cart, alerts, and payment status

