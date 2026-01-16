import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeFaderProps {
    volume: number;
    onChange: (vol: number) => void;
    className?: string;
}

export const VolumeFader: React.FC<VolumeFaderProps> = ({ volume, onChange, className = '' }) => {
    const faderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateVolume = (clientY: number) => {
        if (!faderRef.current) return;
        const rect = faderRef.current.getBoundingClientRect();
        const height = rect.height;
        // Calculate distance from bottom (0 is bottom, 1 is top)
        const relativeY = rect.bottom - clientY;
        const newVolume = Math.min(Math.max(relativeY / height, 0), 1);
        onChange(newVolume);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        faderRef.current?.setPointerCapture(e.pointerId);
        calculateVolume(e.clientY);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDragging) {
            calculateVolume(e.clientY);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        faderRef.current?.releasePointerCapture(e.pointerId);
    };

    return (
        <div className={`flex flex-col items-center gap-2 group ${className}`}>
            {/* Fader Track */}
            <div
                ref={faderRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="h-28 sm:h-32 w-7 sm:w-10 bg-[#111] rounded-lg relative border border-stone-800 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] cursor-ns-resize overflow-visible touch-none"
            >
                {/* Track Markings */}
                <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-[#222]"></div>

                {/* Fill Level */}
                <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 bg-green-900/40 rounded-full transition-all duration-75"
                    style={{
                        height: `calc(${volume * 100}% - 16px)`,
                        bottom: '8px'
                    }}
                ></div>

                {/* Fader Cap (The Knob) */}
                <div
                    className={`
                absolute left-1/2 -translate-x-1/2 w-6 h-8 sm:w-8 sm:h-10 
                bg-gradient-to-b from-[var(--knob-face)] to-[var(--button-side)] 
                border-t border-[var(--button-face)] border-b-2 border-b-black
                rounded shadow-xl z-10
                flex items-center justify-center
                transition-transform duration-75 ease-out
            `}
                    style={{
                        bottom: `${volume * (100 - (32 / 128) * 100)}%`, // Adjust for cap height relative to track
                        transform: isDragging ? 'translate(-50%, 0) scale(1.05)' : 'translate(-50%, 0)'
                    }}
                >
                    {/* Grip Lines */}
                    <div className="flex flex-col gap-[2px]">
                        <div className="w-4 h-[1px] bg-black/50"></div>
                        <div className="w-4 h-[1px] bg-black/50"></div>
                        <div className="w-4 h-[1px] bg-black/50"></div>
                    </div>
                </div>
            </div>

            {/* Mute Toggle */}
            <div
                className="text-stone-500 hover:text-green-500 transition-colors cursor-pointer p-1"
                onClick={() => onChange(volume > 0 ? 0 : 0.5)}
            >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </div>

            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-stone-500 tracking-[0.2em] uppercase select-none">VOL</span>
        </div>
    );
};
