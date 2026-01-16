import { useRef, useCallback } from 'react';

export const useHaptics = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const trigger = useCallback(() => {
    // 1. Vibration (Tactile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(15); // Short, sharp vibration
        } catch (e) {
            // Ignore vibration errors (privacy blockers etc)
        }
    }

    // 2. Audio (Mechanical Click)
    try {
        // Lazy initialization
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }

        const ctx = audioContextRef.current;
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const t = ctx.currentTime;
        
        // Part A: The low mechanical "Thud" (Plastic body resonance)
        const oscLow = ctx.createOscillator();
        const gainLow = ctx.createGain();
        
        oscLow.type = 'sine';
        oscLow.frequency.setValueAtTime(120, t);
        oscLow.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        
        gainLow.gain.setValueAtTime(0.3, t); // Moderate volume
        gainLow.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        oscLow.connect(gainLow);
        gainLow.connect(ctx.destination);
        
        oscLow.start(t);
        oscLow.stop(t + 0.1);

        // Part B: The high "Click" (Switch contact)
        const oscHigh = ctx.createOscillator();
        const gainHigh = ctx.createGain();
        
        oscHigh.type = 'triangle';
        oscHigh.frequency.setValueAtTime(800, t);
        oscHigh.frequency.exponentialRampToValueAtTime(100, t + 0.04);
        
        gainHigh.gain.setValueAtTime(0.1, t); // Lower volume for the click
        gainHigh.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        
        oscHigh.connect(gainHigh);
        gainHigh.connect(ctx.destination);
        
        oscHigh.start(t);
        oscHigh.stop(t + 0.04);

    } catch (e) {
        console.warn("Haptic audio failed", e);
    }
  }, []);

  return { trigger };
};
