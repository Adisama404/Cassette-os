import { useCallback, useRef } from 'react';

export const useMechanicalSounds = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    const createNoiseBuffer = (ctx: AudioContext) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const playClick = useCallback(() => {
        const ctx = initAudio();
        const t = ctx.currentTime;

        // High pitch "click" (Plastic/Metal impact)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);

        // Subtile thud
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.frequency.setValueAtTime(150, t);
        thud.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        thudGain.gain.setValueAtTime(0.5, t);
        thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        thud.connect(thudGain);
        thudGain.connect(ctx.destination);
        thud.start(t);
        thud.stop(t + 0.1);

    }, [initAudio]);

    const playSwitch = useCallback(() => {
        const ctx = initAudio();
        const t = ctx.currentTime;

        // Heavier switch sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }, [initAudio]);

    const playInsert = useCallback(() => {
        const ctx = initAudio();
        const t = ctx.currentTime;

        // Slide noise (White noise with filter)
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, t);
        noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.4);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.linearRampToValueAtTime(0, t + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);

        // Clunk at the end
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.type = 'square';
        thud.frequency.setValueAtTime(100, t + 0.3);
        thud.frequency.exponentialRampToValueAtTime(10, t + 0.45);
        thudGain.gain.setValueAtTime(0, t + 0.3);
        thudGain.gain.linearRampToValueAtTime(0.4, t + 0.31);
        thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        thud.connect(thudGain);
        thudGain.connect(ctx.destination);
        thud.start(t + 0.3);
        thud.stop(t + 0.5);

    }, [initAudio]);

    const playEject = useCallback(() => {
        const ctx = initAudio();
        const t = ctx.currentTime;

        // Similar to insert but reverse pitched or sharper
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);

        // Mechanical spring sound
        const spring = ctx.createOscillator();
        const springGain = ctx.createGain();
        spring.frequency.setValueAtTime(300, t);
        spring.frequency.linearRampToValueAtTime(200, t + 0.3);
        springGain.gain.setValueAtTime(0.1, t);
        springGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        spring.connect(springGain);
        springGain.connect(ctx.destination);
        spring.start(t);
        spring.stop(t + 0.3);

    }, [initAudio]);

    return { playClick, playInsert, playEject, playSwitch };
};
