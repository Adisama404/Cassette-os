import React, { useState, useEffect } from 'react';
import { Deck } from '../components/Deck/Deck';
import { MechanicalButton } from '../components/Controls/MechanicalButton';
import { VolumeFader } from '../components/Controls/VolumeFader';
import { usePlayer } from '../context/PlayerContext';
import { useMechanicalSounds } from '../hooks/useMechanicalSounds';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowUpFromLine } from 'lucide-react';
import { PlaybackState } from '../types';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
    const { play, pause, next, prev, playbackState, currentPlaylist, volume, setVolume, eject } = usePlayer();
    const navigate = useNavigate();

    const isPlaying = playbackState === PlaybackState.PLAYING;
    const hasTape = !!currentPlaylist;

    // 3D Tilt Effect Logic
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
            setTilt({ x, y });
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma === null || e.beta === null) return;
            // Gamma: Left/Right (-90 to 90) => Map to X (-1 to 1)
            // Smaller divisor = higher sensitivity
            const x = Math.max(-1, Math.min(1, e.gamma / 25));

            // Beta: Front/Back. Phone usually held at ~45deg.
            // Map 45deg to 0. 
            const y = Math.max(-1, Math.min(1, (e.beta - 45) / 25));

            setTilt({ x, y });
        };

        // Simple feature detection for mobile
        if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
            window.addEventListener('deviceorientation', handleOrientation);
        } else {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center pt-6 pb-32 px-4 animate-enter bg-transparent">

            {/* Brand Header */}
            <div className="w-full max-w-2xl flex justify-between items-end mb-6 border-b border-[var(--deck-border)] pb-2 px-2" style={{ borderColor: 'var(--deck-border)' }}>
                <div className="flex flex-col">
                    <h1 className="font-mono text-2xl tracking-[0.2em] font-bold flex items-center gap-2" style={{ color: 'var(--lcd-text)', fontFamily: 'var(--font-display)' }}>
                        CASSETTE.OS
                        <div className="w-2 h-2 rounded-full animate-pulse bg-[var(--lcd-text)]"></div>
                    </h1>
                    <span className="text-[0.6rem] font-mono uppercase tracking-widest pl-1 opacity-70" style={{ color: 'var(--lcd-subtext)' }}>High Fidelity Personal Audio</span>
                </div>
                <div className="flex space-x-6 text-[0.65rem] font-mono font-bold tracking-wider opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--lcd-subtext)' }}>
                    <button onClick={() => navigate('/')} className="hover:text-[var(--accent-color)] transition-colors uppercase">Return to Shelf</button>
                    <button onClick={() => navigate('/settings')} className="hover:text-[var(--accent-color)] transition-colors uppercase">System</button>
                </div>
            </div>

            {/* Main Deck Unit */}
            <div
                className="mb-4 sm:mb-8 w-full flex justify-center will-change-transform"
                style={{
                    transform: `perspective(1000px) rotateX(${-tilt.y * 3}deg) rotateY(${tilt.x * 3}deg)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <Deck />
            </div>

            {/* Control Panel Strip */}
            {/* This mimics a separate physical panel below the deck mechanism */}
            <div className="w-full max-w-xl relative">

                {/* Panel Background */}
                <div className="absolute inset-0 rounded-lg shadow-2xl border-t border-white/5 border-b border-black transition-colors duration-500" style={{ backgroundColor: 'var(--deck-bg)', borderColor: 'var(--deck-border)' }}></div>

                {/* Brushed Metal Texture Overlay */}
                <div className="absolute inset-0 opacity-10 rounded-lg pointer-events-none transition-all duration-500" style={{ backgroundImage: 'var(--deck-surface-pattern)' }}></div>

                {/* Screw details */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center"><div className="w-1.5 h-[1px] bg-stone-700 rotate-45"></div></div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center"><div className="w-1.5 h-[1px] bg-stone-700 rotate-12"></div></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center"><div className="w-1.5 h-[1px] bg-stone-700 rotate-90"></div></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center"><div className="w-1.5 h-[1px] bg-stone-700 rotate-0"></div></div>

                {/* Controls Container */}
                <div className="relative z-10 p-3 sm:p-8 flex justify-center items-end gap-2 sm:gap-8">

                    {/* Volume Control (Left Side) */}
                    <div className="mr-1 sm:mr-4">
                        <VolumeFader
                            volume={volume}
                            onChange={setVolume}
                        />
                    </div>

                    {/* Previous */}
                    <MechanicalButton
                        onClick={prev}
                        icon={<SkipBack size={24} fill="currentColor" />}
                        label="PREV"
                        disabled={!hasTape}
                        className="stagger-1 animate-enter"
                    />

                    {/* Play / Pause - Centerpiece */}
                    <div className="p-2 rounded-xl bg-black/20 border border-stone-800/50 shadow-inner mb-2">
                        <MechanicalButton
                            onClick={isPlaying ? pause : play}
                            icon={isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                            label={isPlaying ? "PAUSE" : "PLAY"}
                            active={isPlaying}
                            disabled={!hasTape}
                            className="stagger-2 animate-enter transform scale-110"
                        />
                    </div>

                    {/* Next */}
                    <MechanicalButton
                        onClick={next}
                        icon={<SkipForward size={24} fill="currentColor" />}
                        label="NEXT"
                        disabled={!hasTape}
                        className="stagger-3 animate-enter"
                    />

                    {/* Eject (Right Side) */}
                    <MechanicalButton
                        onClick={() => {
                            if (window.confirm("Eject Cassette?")) {
                                eject();
                                navigate('/');
                            }
                        }}
                        icon={<ArrowUpFromLine size={20} />}
                        label="EJECT"
                        color="orange"
                        disabled={!hasTape}
                        className="stagger-4 animate-enter ml-1 sm:ml-4"
                    />

                </div>
            </div>

            {/* Status / Message Area */}
            <div className="mt-8 h-8 flex items-center justify-center">
                {!hasTape ? (
                    <div className="text-stone-600 font-mono text-xs animate-pulse tracking-widest border border-stone-800 px-4 py-1 rounded bg-black/40">
                        [ INSERT TAPE FROM LIBRARY ]
                    </div>
                ) : (
                    <div className="text-green-900/40 font-mono text-[10px] uppercase tracking-[0.3em]">
                        Dolby NR System Enabled
                    </div>
                )}
            </div>
        </div>
    );
};