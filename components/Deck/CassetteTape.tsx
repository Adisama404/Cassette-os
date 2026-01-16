import React, { useMemo } from 'react';
import { Playlist, CassetteTheme } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CassetteTapeProps {
    playlist?: Playlist;
    isInserted?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    previewTheme?: CassetteTheme; // For the selector UI
    leftReelRef?: React.RefObject<HTMLDivElement | null>;
    rightReelRef?: React.RefObject<HTMLDivElement | null>;
}

export const CassetteTapeBase: React.FC<CassetteTapeProps> = ({
    playlist,
    isInserted = false,
    isPlaying = false,
    className = '',
    style,
    onClick,
    previewTheme,
    leftReelRef,
    rightReelRef
}) => {
    // Use playlist theme or fallback to preview/default
    const theme: CassetteTheme = playlist?.theme || previewTheme || 'black';

    const themeStyles = useMemo(() => {
        switch (theme) {
            case 'white':
                return {
                    body: 'bg-stone-100 border-stone-300',
                    screws: 'bg-stone-300',
                    label: 'bg-white border border-stone-200',
                    text: 'text-stone-900',
                    reel: 'border-stone-400 text-stone-400 opacity-20',
                    path: 'bg-stone-200 border-stone-300',
                    wearOpacity: 'opacity-20',
                    textureClass: 'bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:4px_4px] opacity-30', // Dot grid
                    isTransparent: false
                };
            case 'orange':
                return {
                    body: 'bg-orange-600/80 border-orange-800 backdrop-blur-[2px]',
                    screws: 'bg-orange-900',
                    label: 'bg-orange-50 border-orange-200',
                    text: 'text-orange-900',
                    reel: 'border-orange-200 text-orange-200 opacity-60',
                    path: 'bg-orange-800/80 border-orange-900',
                    wearOpacity: 'opacity-10',
                    textureClass: 'bg-[linear-gradient(90deg,transparent_0%,transparent_90%,rgba(0,0,0,0.1)_90%,rgba(0,0,0,0.1)_100%)] [background-size:20px_100%]', // Internal Ribs
                    isTransparent: true
                };
            case 'blue':
                return {
                    body: 'bg-blue-700/80 border-blue-900 backdrop-blur-[2px]',
                    screws: 'bg-blue-950',
                    label: 'bg-blue-50 border-blue-200',
                    text: 'text-blue-900',
                    reel: 'border-blue-200 text-blue-200 opacity-60',
                    path: 'bg-blue-900/80 border-blue-950',
                    wearOpacity: 'opacity-10',
                    textureClass: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_11px)]', // Diagonal lines
                    isTransparent: true
                };
            case 'gold':
                return {
                    body: 'bg-yellow-700 border-yellow-800',
                    screws: 'bg-yellow-900',
                    label: 'bg-black border border-yellow-600',
                    text: 'text-yellow-500',
                    reel: 'border-yellow-200 text-yellow-200 opacity-30',
                    path: 'bg-yellow-900 border-yellow-950',
                    wearOpacity: 'opacity-40',
                    textureClass: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]', // Brushed metal sheen
                    isTransparent: false
                };
            case 'sticker': // NOW: "Vandalized / Trash"
                return {
                    body: 'bg-stone-200 border-stone-400',
                    screws: 'bg-stone-400 rotate-45',
                    // Label looks like masking tape: beige, rotated, slight shadow
                    label: 'bg-[#e0cda7] border-none shadow-md transform -rotate-2 mask-tape',
                    text: 'text-black font-hand font-black tracking-widest uppercase rotate-1',
                    reel: 'border-black text-black opacity-90',
                    path: 'bg-stone-300 border-stone-400',
                    wearOpacity: 'opacity-40',
                    // Chaotic permanent marker scribbles
                    textureClass: 'bg-[url("data:image/svg+xml,%3Csvg width=\'300\' height=\'200\' viewBox=\'0 0 300 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20 Q50 10 40 40 T20 80 T60 80\' stroke=\'%23000\' stroke-width=\'3\' fill=\'none\'/%3E%3C!-- Anarchy A --%3E%3Cg transform=\'translate(200, 40) rotate(10) scale(1.5)\'%3E%3Ccircle cx=\'0\' cy=\'0\' r=\'15\' stroke=\'%23d00\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpath d=\'M0 -15 L-10 12 M0 -15 L10 12 M-8 0 L8 0\' stroke=\'%23d00\' stroke-width=\'2\'/%3E%3C/g%3E%3C!-- Scribbles --%3E%3Cpath d=\'M10 150 Q50 140 100 160 T200 140\' stroke=\'%23111\' stroke-width=\'2\' fill=\'none\' stroke-dasharray=\'4,2\'/%3E%3Cpath d=\'M250 20 L270 10 L260 40 Z\' fill=\'%23000\'/%3E%3Ctext x=\'50\' y=\'120\' font-family=\'cursive\' font-size=\'20\' fill=\'%23000\' transform=\'rotate(-15)\'%3ENO!%3C/text%3E%3C/svg%3E")]',
                    isTransparent: false
                };
            case 'caution': // NOW: "Radioactive / Fallout"
                return {
                    body: 'bg-amber-700 border-amber-900', // Rusty base
                    screws: 'bg-stone-800',
                    label: 'bg-black border-2 border-yellow-600',
                    text: 'text-yellow-500 font-mono tracking-widest shadow-[0_0_5px_rgba(234,179,8,0.8)]',
                    reel: 'border-yellow-900 text-yellow-600 opacity-80',
                    path: 'bg-amber-800 border-amber-950',
                    wearOpacity: 'opacity-60 mix-blend-overlay',
                    // Grime + worn hazards + Biohazard symbol
                    textureClass: 'bg-[url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'stripes\' width=\'20\' height=\'20\' patternTransform=\'rotate(45)\' patternUnits=\'userSpaceOnUse\'%3E%3Crect width=\'10\' height=\'20\' fill=\'%23000\' opacity=\'0.8\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%\' height=\'100%\' fill=\'url(%23stripes)\' opacity=\'0.4\'/%3E%3C!-- Biohazard --%3E%3Cg transform=\'translate(150, 120) scale(0.5)\'%3E%3Ccircle cx=\'0\' cy=\'0\' r=\'40\' stroke=\'%23fbbf24\' stroke-width=\'5\' fill=\'none\'/%3E%3Ccircle cx=\'0\' cy=\'0\' r=\'10\' fill=\'%23fbbf24\'/%3E%3Cpath d=\'M0 -40 L0 -20 M35 20 L17 10 M-35 20 L-17 10\' stroke=\'%23fbbf24\' stroke-width=\'5\'/%3E%3C/g%3E%3C!-- Rust Spots --%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'30\' fill=\'%2378350f\' opacity=\'0.5\' filter=\'blur(5px)\'/%3E%3Ccircle cx=\'120\' cy=\'150\' r=\'20\' fill=\'%23451a03\' opacity=\'0.6\' filter=\'blur(3px)\'/%3E%3C/svg%3E")]',
                    isTransparent: false
                };
            case 'neon': // NOW: "Glitch / Corrupt"
                return {
                    body: 'bg-slate-950 border-purple-500',
                    screws: 'bg-green-500 shadow-[0_0_5px_#22c55e]',
                    label: 'bg-black border-l-4 border-r-4 border-purple-600',
                    text: 'text-green-400 font-mono shadow-[-2px_0_0_#ec4899,2px_0_0_#06b6d4]', // Chromatic aber. text
                    reel: 'border-purple-500 text-green-500 opacity-90',
                    path: 'bg-slate-900 border-purple-900',
                    wearOpacity: 'opacity-0',
                    // Digital squares + matrix rain feel
                    textureClass: 'bg-[url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'10\' y=\'10\' width=\'20\' height=\'20\' fill=\'%2322c55e\' opacity=\'0.5\'/%3E%3Crect x=\'40\' y=\'60\' width=\'60\' height=\'10\' fill=\'%23ec4899\' opacity=\'0.6\'/%3E%3Crect x=\'150\' y=\'20\' width=\'10\' height=\'80\' fill=\'%2306b6d4\' opacity=\'0.4\'/%3E%3Crect x=\'80\' y=\'150\' width=\'100\' height=\'5\' fill=\'%23fff\' opacity=\'0.8\'/%3E%3Cpath d=\'M0 100 H200\' stroke=\'%2322c55e\' stroke-width=\'1\' stroke-dasharray=\'2,5\'/%3E%3C/svg%3E")]',
                    isTransparent: false
                };
            case 'black':
            default:
                return {
                    body: 'bg-stone-800 border-stone-700',
                    screws: 'bg-stone-900',
                    label: 'bg-stone-300 shadow-sm',
                    text: 'text-stone-900',
                    reel: 'border-stone-500 text-stone-500 opacity-20',
                    path: 'bg-stone-900 border-stone-600',
                    wearOpacity: 'opacity-30',
                    textureClass: 'bg-[url("https://www.transparenttextures.com/patterns/leather.png")] opacity-50', // Leather texture
                    isTransparent: false
                };
        }
    }, [theme]);

    const fontClass = useMemo(() => {
        const font = playlist?.font || 'hand';
        switch (font) {
            case 'marker': return 'font-marker tracking-wide font-normal';
            case 'hand': return 'font-hand tracking-tighter font-bold';
            case 'pencil': return 'font-pencil tracking-normal text-2xl font-bold';
            case 'typewriter': return 'font-typewriter tracking-tight text-xs font-bold';
            case 'sans': return 'font-sans tracking-widest font-bold';
            default: return 'font-hand tracking-tighter font-bold';
        }
    }, [playlist?.font]);

    return (
        <div
            onClick={onClick}
            style={style}
            className={`relative w-full aspect-[1.6] rounded-lg shadow-xl overflow-hidden select-none border-t mechanical-shadow transition-transform duration-300 ${themeStyles.body} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
        >
            {/* 1. Base Texture / Pattern Layer */}
            <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${themeStyles.textureClass}`}></div>

            {/* 2. Global Grain Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] mix-blend-overlay"></div>

            {/* 3. Internal Structure (For Transparent Tapes) */}
            {themeStyles.isTransparent && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    {/* Left Cog */}
                    <div className="absolute top-[35%] left-[23%] w-16 h-16 rounded-full border-2 border-white/20"></div>
                    {/* Right Cog */}
                    <div className="absolute top-[35%] right-[23%] w-16 h-16 rounded-full border-2 border-white/20"></div>
                </div>
            )}

            {/* Screw Holes */}
            <div className={`absolute top-2 left-2 w-2 h-2 rounded-full shadow-inner ${themeStyles.screws}`}></div>
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full shadow-inner ${themeStyles.screws}`}></div>
            <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full shadow-inner ${themeStyles.screws}`}></div>
            <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full shadow-inner ${themeStyles.screws}`}></div>

            {/* Label Area */}
            <div className={`absolute top-[10%] left-[5%] right-[5%] height-[65%] rounded-sm p-2 flex flex-col items-center justify-center transform rotate-[0.5deg] ${themeStyles.label} overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.1)]`}>
                {/* Label Texture Base */}
                <div className="absolute inset-0 opacity-10 bg-yellow-100 mix-blend-multiply pointer-events-none"></div>

                {/* DYNAMIC WEAR TEXTURE: Scratches */}
                <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/scratches.png')] bg-cover mix-blend-multiply pointer-events-none transition-opacity duration-300 ${themeStyles.wearOpacity}`}></div>

                {/* Subtle Dust/Dirt Vignette for darker themes */}
                {(theme === 'black' || theme === 'gold') && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.2)_100%)] pointer-events-none"></div>
                )}

                {/* Handwritten Text */}
                <div className={`${fontClass} text-lg md:text-xl uppercase relative z-10 text-center line-clamp-2 ${themeStyles.text}`}>
                    {playlist ? playlist.name : (previewTheme ? 'PREVIEW TAPE' : 'BLANK TAPE')}
                </div>

                {/* Lines */}
                <div className={`w-full h-px my-1 ${theme === 'gold' ? 'bg-yellow-900' : 'bg-stone-400'}`}></div>
                <div className={`w-full flex justify-between px-2 text-[0.6rem] font-mono ${theme === 'gold' ? 'text-yellow-700' : 'text-stone-500'}`}>
                    <span>A</span>
                    <span>NR: ON</span>
                    <span>{theme === 'gold' ? 'TYPE IV' : 'TYPE I'}</span>
                </div>
            </div>

            {/* Reel Window (Transparent part) */}
            <div className={`absolute bottom-[15%] left-[20%] right-[20%] h-[35%] rounded-full border-2 shadow-inner flex items-center justify-center overflow-hidden ${themeStyles.isTransparent ? 'bg-black/10 border-white/10' : 'bg-stone-900/90 border-stone-600/50 backdrop-blur-[2px]'}`}>
                {/* Left Reel */}
                <div
                    ref={leftReelRef}
                    className={`w-12 h-12 rounded-full border-4 mr-4 flex items-center justify-center relative ${themeStyles.reel} ${(!isInserted && isPlaying) ? 'animate-[spin_2s_linear_infinite]' : (!isInserted ? 'group-hover:animate-[spin_2s_linear_infinite]' : '')}`}
                >
                    <div className="absolute inset-0 border-4 border-dashed border-current opacity-50 rounded-full"></div>
                    <div className="w-1 h-full bg-current opacity-30 rotate-45"></div>
                    <div className="h-1 w-full bg-current opacity-30 rotate-45"></div>
                </div>

                {/* Right Reel */}
                <div
                    ref={rightReelRef}
                    className={`w-12 h-12 rounded-full border-4 ml-4 flex items-center justify-center relative ${themeStyles.reel} ${(!isInserted && isPlaying) ? 'animate-[spin_2s_linear_infinite]' : (!isInserted ? 'group-hover:animate-[spin_2s_linear_infinite]' : '')}`}
                >
                    <div className="absolute inset-0 border-4 border-dashed border-current opacity-50 rounded-full"></div>
                    <div className="w-1 h-full bg-current opacity-30 rotate-45"></div>
                    <div className="h-1 w-full bg-current opacity-30 rotate-45"></div>
                </div>
            </div>

            {/* Bottom Tape Path */}
            <div className={`absolute bottom-0 left-[15%] right-[15%] h-[12%] border-t rounded-t-sm ${themeStyles.path}`}></div>
        </div>
    );
};

export const CassetteTape = React.memo(CassetteTapeBase);
