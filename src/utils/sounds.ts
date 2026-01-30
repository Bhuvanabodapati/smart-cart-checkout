// Web Audio API based sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Scan beep sound
  playScanBeep(): void {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  // Alert alarm sound
  playAlertAlarm(): void {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "square";

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);

    // Create pulsing alarm effect
    for (let i = 0; i < 6; i++) {
      const startTime = ctx.currentTime + i * 0.2;
      oscillator.frequency.setValueAtTime(800, startTime);
      oscillator.frequency.setValueAtTime(600, startTime + 0.1);
    }

    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.2);
  }

  // Success chime sound
  playSuccessChime(): void {
    const ctx = this.getContext();

    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = ctx.currentTime + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }
}

export const soundManager = new SoundManager();
