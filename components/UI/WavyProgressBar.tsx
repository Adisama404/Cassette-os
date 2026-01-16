import React, { useRef, useMemo } from 'react';

interface WavyProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    amplitude?: number;
    frequency?: number;
    className?: string;
}

export const WavyProgressBar: React.FC<WavyProgressBarProps> = ({
    currentTime,
    duration,
    onSeek,
    amplitude = 10,
    frequency = 4,
    className = ""
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate progress percentage
    const progress = duration > 0 ? (currentTime / duration) : 0;

    // Generate sine wave path
    const points = useMemo(() => {
        const width = 100;
        const startY = 25; // Center Y

        let path = `M 0 ${startY}`;

        // Increase resolution for smoothness (step 0.5 or smaller)
        for (let x = 0; x <= width; x += 0.5) {
            // Sine wave formula: y = A * sin(B * x) + offset
            // x is 0-100.
            // Convert x to radians for frequency
            const rad = (x / width) * Math.PI * 2 * frequency;
            const y = Math.sin(rad) * amplitude + startY;
            path += ` L ${x} ${y}`;
        }
        return path;
    }, [amplitude, frequency]);

    const [hoverState, setHoverState] = React.useState<{ x: number; time: string } | null>(null);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || duration <= 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        const time = percentage * duration;

        setHoverState({ x, time: formatTime(time) });
    };

    const handleMouseLeave = () => {
        setHoverState(null);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || duration <= 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        onSeek(percentage * duration);
    };

    return (
        <div
            ref={containerRef}
            className={`w-full h-12 relative cursor-pointer group hover:scale-[1.01] transition-transform ${className}`}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <svg
                className="w-full h-full"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
            >
                {/* Background Wave (Faint) */}
                <path
                    d={points}
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.2)" // green-500 with low opacity
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Progress Wave (Filled) - animating clip path */}
                <defs>
                    <clipPath id="progress-clip">
                        <rect x="0" y="0" width={`${progress * 100}`} height="50" />
                    </clipPath>
                    {/* Unique gradient for cool effect */}
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                </defs>

                <path
                    d={points}
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    clipPath="url(#progress-clip)"
                    className="drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Scrubber indicator (Optional, maybe just a glowing head on the wave) */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress * 100}% - 8px)` }}
            />

            {/* Hover Peek Cursor */}
            {hoverState && (
                <>
                    {/* Ghost Cursor Line */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-green-500/50 pointer-events-none"
                        style={{ left: hoverState.x }}
                    />
                    {/* Time Tooltip */}
                    <div
                        className="absolute -top-6 -translate-x-1/2 bg-stone-900 text-green-400 text-[10px] font-mono py-1 px-2 rounded border border-green-900 pointer-events-none z-20"
                        style={{ left: hoverState.x }}
                    >
                        {hoverState.time}
                    </div>
                </>
            )}
        </div>
    );
};
